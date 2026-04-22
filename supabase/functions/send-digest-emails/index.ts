import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.90.1";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface DigestRequest {
  frequency: "daily" | "weekly";
}

// Escape user-controlled strings before embedding them into HTML email bodies.
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

    // ---- AUTH: this is an admin/cron job — require either the service-role
    //      key or an authenticated admin user. Never allow anonymous callers. ----
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    const token = authHeader.replace("Bearer ", "");

    let authorized = false;
    if (token === supabaseServiceKey) {
      // Internal cron / scheduled job invocation
      authorized = true;
    } else {
      // Otherwise the caller must be an authenticated admin
      const userScopedClient = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data: claimsData, error: claimsError } =
        await userScopedClient.auth.getClaims(token);
      if (!claimsError && claimsData?.claims?.sub) {
        const adminCheckClient = createClient(supabaseUrl, supabaseServiceKey);
        const { data: isAdminData } = await adminCheckClient.rpc("is_admin", {
          _user_id: claimsData.claims.sub,
        });
        if (isAdminData === true) {
          authorized = true;
        }
      }
    }

    if (!authorized) {
      return new Response(
        JSON.stringify({ error: "Forbidden" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { frequency }: DigestRequest = await req.json();
    if (frequency !== "daily" && frequency !== "weekly") {
      return new Response(
        JSON.stringify({ error: "Invalid frequency" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const siteUrl = Deno.env.get("SITE_URL") || "https://moonwalkforum.com";

    const { data: usersWithPrefs } = await supabase
      .from("notification_preferences")
      .select("user_id")
      .eq("notification_frequency", frequency);

    if (!usersWithPrefs || usersWithPrefs.length === 0) {
      return new Response(
        JSON.stringify({ message: "No users with this frequency setting" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const userIds = usersWithPrefs.map((u) => u.user_id);
    let emailsSent = 0;

    for (const userId of userIds) {
      const { data: notifications } = await supabase
        .from("pending_notifications")
        .select("*")
        .eq("recipient_user_id", userId)
        .eq("is_sent", false)
        .order("created_at", { ascending: false });

      if (!notifications || notifications.length === 0) continue;

      const { data: userData } = await supabase.auth.admin.getUserById(userId);
      if (!userData?.user?.email) continue;

      const threadIds = [...new Set(notifications.map((n) => n.thread_id))];
      const { data: threads } = await supabase
        .from("posts")
        .select("id, title, slug")
        .in("id", threadIds);

      const threadMap = new Map(threads?.map((t) => [t.id, t]) || []);

      const authorIds = [...new Set(notifications.map((n) => n.author_id))];
      const { data: authors } = await supabase
        .from("profiles")
        .select("user_id, display_name, username")
        .in("user_id", authorIds);

      const authorMap = new Map(
        authors?.map((a) => [a.user_id, a.display_name || a.username]) || []
      );

      const notificationItems = notifications
        .map((n) => {
          const thread = threadMap.get(n.thread_id);
          const authorName = authorMap.get(n.author_id) || "Someone";
          const threadTitle = thread?.title || "a discussion";
          const threadSlug = thread?.slug || n.thread_id;

          let actionText = "";
          switch (n.notification_type) {
            case "thread_reply":
              actionText = `replied to your thread "${escapeHtml(threadTitle)}"`;
              break;
            case "comment_reply":
              actionText = `replied to your comment in "${escapeHtml(threadTitle)}"`;
              break;
            case "mention":
              actionText = `mentioned you in "${escapeHtml(threadTitle)}"`;
              break;
          }

          const safeAuthorName = escapeHtml(authorName);
          const safePreview = escapeHtml(
            (n.content_preview || "").substring(0, 150) +
              ((n.content_preview || "").length > 150 ? "..." : "")
          );
          const safeSlug = encodeURIComponent(threadSlug);

          return `
            <div style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid #667eea;">
              <strong>${safeAuthorName}</strong> ${actionText}
              <p style="color: #6b7280; margin: 10px 0; font-size: 14px;">"${safePreview}"</p>
              <a href="${siteUrl}/thread/${safeSlug}" style="color: #667eea; text-decoration: none; font-size: 14px;">View discussion →</a>
            </div>
          `;
        })
        .join("");

      const subject =
        frequency === "daily"
          ? `Your daily forum digest - ${notifications.length} new ${notifications.length === 1 ? "notification" : "notifications"}`
          : `Your weekly forum digest - ${notifications.length} new ${notifications.length === 1 ? "notification" : "notifications"}`;

      const emailResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "Forum Notifications <onboarding@resend.dev>",
          to: [userData.user.email],
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
                .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1 style="margin: 0; font-size: 24px;">Your ${frequency === "daily" ? "Daily" : "Weekly"} Digest</h1>
                  <p style="margin: 10px 0 0 0; opacity: 0.9;">${notifications.length} new ${notifications.length === 1 ? "notification" : "notifications"}</p>
                </div>
                <div class="content">
                  ${notificationItems}
                </div>
                <div class="footer">
                  <p>You're receiving this ${frequency} digest because of your notification preferences.</p>
                  <p>To change your settings, visit your profile.</p>
                </div>
              </div>
            </body>
            </html>
          `,
        }),
      });

      if (emailResponse.ok) {
        const notificationIds = notifications.map((n) => n.id);
        await supabase
          .from("pending_notifications")
          .update({ is_sent: true, sent_at: new Date().toISOString() })
          .in("id", notificationIds);

        emailsSent++;
      }
    }

    return new Response(
      JSON.stringify({ message: `Sent ${emailsSent} digest emails` }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-digest-emails function:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
