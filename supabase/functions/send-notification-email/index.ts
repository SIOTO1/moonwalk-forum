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
  authorId: string;
  authorName: string;
  contentPreview: string;
  commentId?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { 
      type, 
      recipientUserId, 
      threadId,
      threadTitle, 
      threadSlug, 
      authorId,
      authorName, 
      contentPreview,
      commentId 
    }: NotificationRequest = await req.json();

    // Don't notify if author is replying to themselves
    if (recipientUserId === authorId) {
      return new Response(
        JSON.stringify({ message: "Self-notification skipped" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get recipient's notification preferences
    const { data: preferences } = await supabase
      .from("notification_preferences")
      .select("*")
      .eq("user_id", recipientUserId)
      .maybeSingle();

    // Check if user wants this type of notification
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

    const frequency = preferences?.notification_frequency || 'live';

    // If not live, queue the notification for batch sending
    if (frequency !== 'live') {
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

    // Get recipient's email from auth.users
    const { data: userData } = await supabase.auth.admin.getUserById(recipientUserId);
    
    if (!userData?.user?.email) {
      return new Response(
        JSON.stringify({ error: "User email not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const recipientEmail = userData.user.email;
    const siteUrl = Deno.env.get("SITE_URL") || "https://your-forum.com";

    // Compose email based on notification type
    let subject = "";
    let heading = "";
    
    switch (type) {
      case "thread_reply":
        subject = `New reply to your thread: ${threadTitle}`;
        heading = `${authorName} replied to your thread`;
        break;
      case "comment_reply":
        subject = `${authorName} replied to your comment`;
        heading = `${authorName} replied to your comment in "${threadTitle}"`;
        break;
      case "mention":
        subject = `${authorName} mentioned you in a discussion`;
        heading = `${authorName} mentioned you in "${threadTitle}"`;
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
                  <p style="margin: 0; color: #4b5563;">${contentPreview}</p>
                </div>
                <a href="${siteUrl}/thread/${threadSlug}" class="button">View Discussion</a>
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
    console.log("Email sent successfully:", emailData);

    return new Response(JSON.stringify(emailData), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-notification-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
