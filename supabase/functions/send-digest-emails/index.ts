import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.90.1";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface PendingNotification {
  id: string;
  recipient_user_id: string;
  notification_type: string;
  thread_id: string;
  comment_id: string | null;
  author_id: string;
  content_preview: string;
  created_at: string;
}

interface DigestRequest {
  frequency: "daily" | "weekly";
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { frequency }: DigestRequest = await req.json();
    const siteUrl = Deno.env.get("SITE_URL") || "https://moonwalkforum.com";

    // Get users with this frequency preference who have pending notifications
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

    const userIds = usersWithPrefs.map(u => u.user_id);
    let emailsSent = 0;

    for (const userId of userIds) {
      // Get pending notifications for this user
      const { data: notifications } = await supabase
        .from("pending_notifications")
        .select("*")
        .eq("recipient_user_id", userId)
        .eq("is_sent", false)
        .order("created_at", { ascending: false });

      if (!notifications || notifications.length === 0) continue;

      // Get user email
      const { data: userData } = await supabase.auth.admin.getUserById(userId);
      if (!userData?.user?.email) continue;

      // Get thread titles for notifications
      const threadIds = [...new Set(notifications.map(n => n.thread_id))];
      const { data: threads } = await supabase
        .from("posts")
        .select("id, title, slug")
        .in("id", threadIds);

      const threadMap = new Map(threads?.map(t => [t.id, t]) || []);

      // Get author names
      const authorIds = [...new Set(notifications.map(n => n.author_id))];
      const { data: authors } = await supabase
        .from("profiles")
        .select("user_id, display_name, username")
        .in("user_id", authorIds);

      const authorMap = new Map(authors?.map(a => [a.user_id, a.display_name || a.username]) || []);

      // Build digest HTML
      const notificationItems = notifications.map(n => {
        const thread = threadMap.get(n.thread_id);
        const authorName = authorMap.get(n.author_id) || "Someone";
        const threadTitle = thread?.title || "a discussion";
        const threadSlug = thread?.slug || n.thread_id;

        let actionText = "";
        switch (n.notification_type) {
          case "thread_reply":
            actionText = `replied to your thread "${threadTitle}"`;
            break;
          case "comment_reply":
            actionText = `replied to your comment in "${threadTitle}"`;
            break;
          case "mention":
            actionText = `mentioned you in "${threadTitle}"`;
            break;
        }

        return `
          <div style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid #667eea;">
            <strong>${authorName}</strong> ${actionText}
            <p style="color: #6b7280; margin: 10px 0; font-size: 14px;">"${n.content_preview.substring(0, 150)}${n.content_preview.length > 150 ? '...' : ''}"</p>
            <a href="${siteUrl}/thread/${threadSlug}" style="color: #667eea; text-decoration: none; font-size: 14px;">View discussion →</a>
          </div>
        `;
      }).join("");

      const subject = frequency === "daily" 
        ? `Your daily forum digest - ${notifications.length} new ${notifications.length === 1 ? 'notification' : 'notifications'}`
        : `Your weekly forum digest - ${notifications.length} new ${notifications.length === 1 ? 'notification' : 'notifications'}`;

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
                  <h1 style="margin: 0; font-size: 24px;">Your ${frequency === 'daily' ? 'Daily' : 'Weekly'} Digest</h1>
                  <p style="margin: 10px 0 0 0; opacity: 0.9;">${notifications.length} new ${notifications.length === 1 ? 'notification' : 'notifications'}</p>
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
        // Mark notifications as sent
        const notificationIds = notifications.map(n => n.id);
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
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
