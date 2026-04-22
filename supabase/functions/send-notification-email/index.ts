import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.90.1";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  type: "thread_reply" | "comment_reply" | "mention";
  recipientUserId: string;
  threadId: string;
  threadTitle: string;
  threadSlug: string;
  // authorId / authorName intentionally NOT trusted from the client.
  // The author is always the authenticated caller (auth.uid()), and the
  // displayed name is fetched server-side from `profiles`.
  contentPreview: string;
  commentId?: string;
}

// Escape user-controlled strings before embedding them into HTML email bodies
// to prevent HTML/phishing-link injection.
function escapeHtml(input: unknown): string {
  const str = String(input ?? "");
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // ---- AUTH: require a valid JWT ----
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const userScopedClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } =
      await userScopedClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims?.sub) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    const callerId = claimsData.claims.sub as string;

    // Service-role client for writes / admin lookups
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const {
      type,
      recipientUserId,
      threadId,
      threadTitle,
      threadSlug,
      contentPreview,
      commentId,
    }: NotificationRequest = await req.json();

    // Basic input validation
    if (
      !["thread_reply", "comment_reply", "mention"].includes(type) ||
      typeof recipientUserId !== "string" ||
      typeof threadId !== "string" ||
      typeof threadTitle !== "string" ||
      typeof threadSlug !== "string" ||
      typeof contentPreview !== "string"
    ) {
      return new Response(
        JSON.stringify({ error: "Invalid request payload" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // The author IS the authenticated caller — never trusted from the body.
    const authorId = callerId;

    // Don't notify if author is replying to themselves
    if (recipientUserId === authorId) {
      return new Response(
        JSON.stringify({ message: "Self-notification skipped" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Resolve the author's display name from the database (do not trust the client)
    const { data: authorProfile } = await supabase
      .from("profiles")
      .select("display_name, username")
      .eq("user_id", authorId)
      .maybeSingle();
    const authorName = authorProfile?.display_name || authorProfile?.username || "Someone";

    // Get recipient's notification preferences
    const { data: preferences } = await supabase
      .from("notification_preferences")
      .select("*")
      .eq("user_id", recipientUserId)
      .maybeSingle();

    let shouldNotify = false;
    if (type === "thread_reply" && preferences?.email_thread_replies) {
      shouldNotify = true;
    } else if (type === "comment_reply" && preferences?.email_comment_replies) {
      shouldNotify = true;
    } else if (type === "mention" && preferences?.email_mentions) {
      shouldNotify = true;
    }

    if (!shouldNotify) {
      return new Response(
        JSON.stringify({ message: "User has disabled this notification type" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const frequency = preferences?.notification_frequency || "live";

    if (frequency !== "live") {
      const { error: insertError } = await supabase
        .from("pending_notifications")
        .insert({
          recipient_user_id: recipientUserId,
          notification_type: type,
          thread_id: threadId,
          comment_id: commentId || null,
          author_id: authorId,
          content_preview: contentPreview,
        });

      if (insertError) {
        console.error("Error queuing notification:", insertError);
      }

      return new Response(
        JSON.stringify({ message: `Notification queued for ${frequency} digest` }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { data: userData } = await supabase.auth.admin.getUserById(recipientUserId);

    if (!userData?.user?.email) {
      return new Response(
        JSON.stringify({ error: "User email not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const recipientEmail = userData.user.email;
    const siteUrl = Deno.env.get("SITE_URL") || "https://moonwalkforum.com";

    // Pre-escape every string interpolated into the HTML body
    const safeAuthorName = escapeHtml(authorName);
    const safeThreadTitle = escapeHtml(threadTitle);
    const safeContentPreview = escapeHtml(contentPreview);
    const safeThreadSlug = encodeURIComponent(threadSlug);

    let subject = "";
    let heading = "";

    switch (type) {
      case "thread_reply":
        subject = `New reply to your thread: ${threadTitle}`;
        heading = `${safeAuthorName} replied to your thread`;
        break;
      case "comment_reply":
        subject = `${authorName} replied to your comment`;
        heading = `${safeAuthorName} replied to your comment in "${safeThreadTitle}"`;
        break;
      case "mention":
        subject = `${authorName} mentioned you in a discussion`;
        heading = `${safeAuthorName} mentioned you in "${safeThreadTitle}"`;
        break;
    }

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Forum Notifications <onboarding@resend.dev>",
        to: [recipientEmail],
        subject,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
              .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
              .preview { background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; margin: 20px 0; }
              .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
              .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0; font-size: 24px;">${heading}</h1>
              </div>
              <div class="content">
                <div class="preview">
                  <p style="margin: 0; color: #4b5563;">${safeContentPreview}</p>
                </div>
                <a href="${siteUrl}/thread/${safeThreadSlug}" class="button">View Discussion</a>
              </div>
              <div class="footer">
                <p>You're receiving this because you have email notifications enabled.</p>
                <p>To manage your preferences, visit your profile settings.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      }),
    });

    const emailData = await emailResponse.json();
    console.log("Email sent successfully");

    return new Response(JSON.stringify(emailData), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-notification-email function:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
