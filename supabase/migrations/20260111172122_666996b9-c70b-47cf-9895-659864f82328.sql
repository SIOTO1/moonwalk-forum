-- Create report reasons enum
CREATE TYPE public.report_reason AS ENUM (
  'spam',
  'harassment',
  'misinformation',
  'unsafe_advice',
  'inappropriate',
  'off_topic',
  'other'
);

-- Create report status enum
CREATE TYPE public.report_status AS ENUM (
  'pending',
  'reviewed',
  'resolved',
  'dismissed'
);

-- Create moderation action enum
CREATE TYPE public.moderation_action AS ENUM (
  'warning',
  'edit',
  'remove',
  'lock',
  'unlock',
  'shadow_ban',
  'unshadow_ban',
  'ban',
  'unban'
);

-- Reports table for posts and comments
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES public.profiles(user_id) ON DELETE SET NULL,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  reason report_reason NOT NULL,
  description TEXT,
  status report_status NOT NULL DEFAULT 'pending',
  reviewed_by UUID REFERENCES public.profiles(user_id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  resolution_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT report_target_check CHECK (
    (post_id IS NOT NULL AND comment_id IS NULL) OR
    (post_id IS NULL AND comment_id IS NOT NULL)
  )
);

-- Moderation log for audit trail
CREATE TABLE public.moderation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  moderator_id UUID REFERENCES public.profiles(user_id) ON DELETE SET NULL NOT NULL,
  target_user_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  action moderation_action NOT NULL,
  reason TEXT,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Shadow ban table
CREATE TABLE public.shadow_bans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE NOT NULL UNIQUE,
  banned_by UUID REFERENCES public.profiles(user_id) ON DELETE SET NULL NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- User rate limits tracking
CREATE TABLE public.user_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE NOT NULL,
  activity_type TEXT NOT NULL, -- 'post', 'comment', 'vote'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add email_verified and is_removed columns to profiles
ALTER TABLE public.profiles 
ADD COLUMN email_verified BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN is_banned BOOLEAN NOT NULL DEFAULT false;

-- Add is_removed column to posts and comments for soft delete
ALTER TABLE public.posts 
ADD COLUMN is_removed BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN removed_by UUID REFERENCES public.profiles(user_id) ON DELETE SET NULL,
ADD COLUMN removed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN removal_reason TEXT;

ALTER TABLE public.comments 
ADD COLUMN is_removed BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN removed_by UUID REFERENCES public.profiles(user_id) ON DELETE SET NULL,
ADD COLUMN removed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN removal_reason TEXT;

-- Enable RLS
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shadow_bans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;

-- Reports policies
CREATE POLICY "Users can create reports"
ON public.reports FOR INSERT
WITH CHECK (auth.uid() = reporter_id AND can_post(auth.uid()));

CREATE POLICY "Users can view their own reports"
ON public.reports FOR SELECT
USING (auth.uid() = reporter_id OR can_moderate(auth.uid()));

CREATE POLICY "Moderators can update reports"
ON public.reports FOR UPDATE
USING (can_moderate(auth.uid()));

-- Moderation logs policies
CREATE POLICY "Moderators can view logs"
ON public.moderation_logs FOR SELECT
USING (can_moderate(auth.uid()));

CREATE POLICY "Moderators can create logs"
ON public.moderation_logs FOR INSERT
WITH CHECK (can_moderate(auth.uid()) AND auth.uid() = moderator_id);

-- Shadow bans policies
CREATE POLICY "Moderators can view shadow bans"
ON public.shadow_bans FOR SELECT
USING (can_moderate(auth.uid()));

CREATE POLICY "Moderators can create shadow bans"
ON public.shadow_bans FOR INSERT
WITH CHECK (can_moderate(auth.uid()) AND auth.uid() = banned_by);

CREATE POLICY "Moderators can remove shadow bans"
ON public.shadow_bans FOR DELETE
USING (can_moderate(auth.uid()));

-- User activity policies
CREATE POLICY "Users can insert own activity"
ON public.user_activity FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own activity"
ON public.user_activity FOR SELECT
USING (auth.uid() = user_id OR can_moderate(auth.uid()));

-- Function to check if user is shadow banned
CREATE OR REPLACE FUNCTION public.is_shadow_banned(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.shadow_bans
    WHERE user_id = _user_id
    AND (expires_at IS NULL OR expires_at > now())
  )
$$;

-- Function to check rate limit (returns true if within limit)
CREATE OR REPLACE FUNCTION public.check_rate_limit(_user_id uuid, _activity_type text)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_tier membership_tier;
  activity_count integer;
  time_window interval;
  max_allowed integer;
BEGIN
  -- Get user's membership tier
  SELECT membership_tier INTO user_tier FROM profiles WHERE user_id = _user_id;
  
  -- Set limits based on tier and activity type
  IF _activity_type = 'post' THEN
    time_window := interval '1 hour';
    CASE user_tier
      WHEN 'free' THEN max_allowed := 2;
      WHEN 'pro' THEN max_allowed := 10;
      WHEN 'elite' THEN max_allowed := 50;
      ELSE max_allowed := 2;
    END CASE;
  ELSIF _activity_type = 'comment' THEN
    time_window := interval '1 hour';
    CASE user_tier
      WHEN 'free' THEN max_allowed := 10;
      WHEN 'pro' THEN max_allowed := 50;
      WHEN 'elite' THEN max_allowed := 200;
      ELSE max_allowed := 10;
    END CASE;
  ELSE
    RETURN true; -- No limit for other activities
  END IF;
  
  -- Count recent activities
  SELECT COUNT(*) INTO activity_count
  FROM user_activity
  WHERE user_id = _user_id
    AND activity_type = _activity_type
    AND created_at > now() - time_window;
  
  RETURN activity_count < max_allowed;
END;
$$;

-- Function to check if user can post (updated with email verification and shadow ban)
CREATE OR REPLACE FUNCTION public.can_post(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = _user_id 
    AND email_verified = true
    AND is_banned = false
  ) AND NOT public.is_shadow_banned(_user_id)
$$;

-- Trigger to update updated_at on reports
CREATE TRIGGER update_reports_updated_at
BEFORE UPDATE ON public.reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes for performance
CREATE INDEX idx_reports_status ON public.reports(status);
CREATE INDEX idx_reports_post_id ON public.reports(post_id) WHERE post_id IS NOT NULL;
CREATE INDEX idx_reports_comment_id ON public.reports(comment_id) WHERE comment_id IS NOT NULL;
CREATE INDEX idx_moderation_logs_target_user ON public.moderation_logs(target_user_id);
CREATE INDEX idx_moderation_logs_created_at ON public.moderation_logs(created_at DESC);
CREATE INDEX idx_shadow_bans_user ON public.shadow_bans(user_id);
CREATE INDEX idx_user_activity_user_type ON public.user_activity(user_id, activity_type, created_at DESC);
CREATE INDEX idx_posts_is_removed ON public.posts(is_removed);
CREATE INDEX idx_comments_is_removed ON public.comments(is_removed);