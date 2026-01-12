-- Add notification frequency column
ALTER TABLE public.notification_preferences 
ADD COLUMN notification_frequency TEXT NOT NULL DEFAULT 'live' 
CHECK (notification_frequency IN ('live', 'daily', 'weekly'));

-- Create pending notifications table for batched emails
CREATE TABLE public.pending_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('thread_reply', 'comment_reply', 'mention')),
  thread_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content_preview TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  sent_at TIMESTAMP WITH TIME ZONE,
  is_sent BOOLEAN NOT NULL DEFAULT false
);

-- Enable RLS
ALTER TABLE public.pending_notifications ENABLE ROW LEVEL SECURITY;

-- Only service role can manage pending notifications
CREATE POLICY "Service role can manage pending notifications"
ON public.pending_notifications
FOR ALL
USING (false)
WITH CHECK (false);

-- Index for efficient batch queries
CREATE INDEX idx_pending_notifications_unsent ON public.pending_notifications(recipient_user_id, is_sent) WHERE is_sent = false;
CREATE INDEX idx_pending_notifications_created ON public.pending_notifications(created_at);