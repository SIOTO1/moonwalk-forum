import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useNotificationPreferences } from "@/hooks/useNotificationPreferences";
import { Bell, Mail, MessageSquare, AtSign, Newspaper } from "lucide-react";

export function NotificationSettings() {
  const { preferences, isLoading, updatePreferences, isUpdating } = useNotificationPreferences();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72 mt-2" />
        </CardHeader>
        <CardContent className="space-y-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-6 w-11 rounded-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!preferences) {
    return null;
  }

  const notifications = [
    {
      key: "email_thread_replies" as const,
      label: "Thread Replies",
      description: "Receive an email when someone replies to your thread",
      icon: MessageSquare,
      value: preferences.email_thread_replies,
    },
    {
      key: "email_comment_replies" as const,
      label: "Comment Replies",
      description: "Receive an email when someone replies to your comment",
      icon: Mail,
      value: preferences.email_comment_replies,
    },
    {
      key: "email_mentions" as const,
      label: "Mentions",
      description: "Receive an email when someone mentions you in a discussion",
      icon: AtSign,
      value: preferences.email_mentions,
    },
    {
      key: "email_weekly_digest" as const,
      label: "Weekly Digest",
      description: "Receive a weekly summary of forum activity",
      icon: Newspaper,
      value: preferences.email_weekly_digest,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Email Notifications
        </CardTitle>
        <CardDescription>
          Choose which email notifications you'd like to receive
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {notifications.map((notification) => (
          <div
            key={notification.key}
            className="flex items-center justify-between space-x-4"
          >
            <div className="flex items-start space-x-4">
              <div className="p-2 rounded-lg bg-muted">
                <notification.icon className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <Label
                  htmlFor={notification.key}
                  className="text-sm font-medium leading-none cursor-pointer"
                >
                  {notification.label}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {notification.description}
                </p>
              </div>
            </div>
            <Switch
              id={notification.key}
              checked={notification.value}
              disabled={isUpdating}
              onCheckedChange={(checked) =>
                updatePreferences({ [notification.key]: checked })
              }
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
