-- Create enum for violation types
CREATE TYPE public.violation_type AS ENUM (
  'profanity',
  'hate_speech',
  'threats',
  'harassment',
  'personal_attack',
  'other'
);

-- Create enum for violation status
CREATE TYPE public.violation_status AS ENUM (
  'active',
  'overridden',
  'expired',
  'appealed'
);

-- Create enum for restriction type
CREATE TYPE public.restriction_type AS ENUM (
  'warning',
  'temp_restriction',
  'suspension'
);

-- Table to track content violations and strikes
CREATE TABLE public.content_violations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  violation_type violation_type NOT NULL,
  restriction_type restriction_type NOT NULL,
  content_preview TEXT NOT NULL,
  detected_terms TEXT[],
  status violation_status NOT NULL DEFAULT 'active',
  strike_number INTEGER NOT NULL DEFAULT 1,
  expires_at TIMESTAMP WITH TIME ZONE,
  overridden_by UUID REFERENCES public.profiles(user_id),
  override_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table to track Code of Conduct agreements
CREATE TABLE public.conduct_agreements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  agreed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  version TEXT NOT NULL DEFAULT '1.0',
  ip_address TEXT
);

-- Add posting restriction fields to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_restricted BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS restriction_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS strike_count INTEGER NOT NULL DEFAULT 0;

-- Enable RLS
ALTER TABLE public.content_violations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conduct_agreements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for content_violations
CREATE POLICY "Users can view their own violations"
ON public.content_violations FOR SELECT
USING (auth.uid() = user_id OR can_moderate(auth.uid()));

CREATE POLICY "System can create violations"
ON public.content_violations FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Moderators can update violations"
ON public.content_violations FOR UPDATE
USING (can_moderate(auth.uid()));

-- RLS Policies for conduct_agreements
CREATE POLICY "Users can view their own agreement"
ON public.conduct_agreements FOR SELECT
USING (auth.uid() = user_id OR can_moderate(auth.uid()));

CREATE POLICY "Users can create their own agreement"
ON public.conduct_agreements FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Function to check if user has agreed to conduct policy
CREATE OR REPLACE FUNCTION public.has_agreed_to_conduct(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.conduct_agreements
    WHERE user_id = _user_id
  )
$$;

-- Function to get user's active strike count
CREATE OR REPLACE FUNCTION public.get_active_strike_count(_user_id UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT COUNT(*)::INTEGER 
     FROM public.content_violations 
     WHERE user_id = _user_id 
     AND status = 'active'
     AND (expires_at IS NULL OR expires_at > now())),
    0
  )
$$;

-- Function to check if user can post (updated to include conduct check)
CREATE OR REPLACE FUNCTION public.can_post(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = _user_id 
    AND email_verified = true
    AND is_banned = false
    AND (is_restricted = false OR restriction_expires_at < now())
  ) 
  AND NOT public.is_shadow_banned(_user_id)
  AND public.has_agreed_to_conduct(_user_id)
$$;

-- Function to apply strike and update user status
CREATE OR REPLACE FUNCTION public.apply_content_strike(
  _user_id UUID,
  _violation_type violation_type,
  _content_preview TEXT,
  _detected_terms TEXT[]
)
RETURNS TABLE(
  strike_number INTEGER,
  restriction_type restriction_type,
  message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_strikes INTEGER;
  new_restriction restriction_type;
  restriction_duration INTERVAL;
  result_message TEXT;
BEGIN
  -- Get current strike count
  SELECT COALESCE(strike_count, 0) + 1 INTO current_strikes
  FROM public.profiles WHERE user_id = _user_id;
  
  -- Determine restriction based on strike count
  IF current_strikes = 1 THEN
    new_restriction := 'warning';
    restriction_duration := NULL;
    result_message := 'Your content was blocked due to a policy violation. Please revise your message to maintain a professional tone.';
  ELSIF current_strikes = 2 THEN
    new_restriction := 'temp_restriction';
    restriction_duration := INTERVAL '24 hours';
    result_message := 'Due to repeated violations, you have been temporarily restricted from posting for 24 hours.';
  ELSE
    new_restriction := 'suspension';
    restriction_duration := NULL; -- Indefinite until moderator review
    result_message := 'Your account has been suspended pending moderator review due to multiple policy violations.';
  END IF;
  
  -- Insert violation record
  INSERT INTO public.content_violations (
    user_id, violation_type, restriction_type, content_preview, 
    detected_terms, strike_number, expires_at
  ) VALUES (
    _user_id, _violation_type, new_restriction, _content_preview,
    _detected_terms, current_strikes,
    CASE WHEN restriction_duration IS NOT NULL THEN now() + restriction_duration ELSE NULL END
  );
  
  -- Update profile with restriction
  UPDATE public.profiles SET
    strike_count = current_strikes,
    is_restricted = (new_restriction IN ('temp_restriction', 'suspension')),
    restriction_expires_at = CASE 
      WHEN new_restriction = 'temp_restriction' THEN now() + restriction_duration
      WHEN new_restriction = 'suspension' THEN now() + INTERVAL '100 years'
      ELSE NULL
    END
  WHERE profiles.user_id = _user_id;
  
  RETURN QUERY SELECT current_strikes, new_restriction, result_message;
END;
$$;

-- Function for moderators to override a violation
CREATE OR REPLACE FUNCTION public.override_violation(
  _violation_id UUID,
  _moderator_id UUID,
  _reason TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  affected_user_id UUID;
BEGIN
  -- Check if moderator has permission
  IF NOT public.can_moderate(_moderator_id) THEN
    RETURN false;
  END IF;
  
  -- Get the user affected
  SELECT user_id INTO affected_user_id
  FROM public.content_violations WHERE id = _violation_id;
  
  -- Update the violation
  UPDATE public.content_violations SET
    status = 'overridden',
    overridden_by = _moderator_id,
    override_reason = _reason
  WHERE id = _violation_id;
  
  -- Decrease strike count
  UPDATE public.profiles SET
    strike_count = GREATEST(strike_count - 1, 0)
  WHERE user_id = affected_user_id;
  
  -- If no more active violations, remove restriction
  IF public.get_active_strike_count(affected_user_id) < 2 THEN
    UPDATE public.profiles SET
      is_restricted = false,
      restriction_expires_at = NULL
    WHERE user_id = affected_user_id;
  END IF;
  
  -- Log moderation action
  INSERT INTO public.moderation_logs (moderator_id, target_user_id, action, reason, details)
  VALUES (_moderator_id, affected_user_id, 'warning', _reason, 
    jsonb_build_object('action', 'override_violation', 'violation_id', _violation_id));
  
  RETURN true;
END;
$$;

-- Create index for performance
CREATE INDEX idx_content_violations_user_id ON public.content_violations(user_id);
CREATE INDEX idx_content_violations_status ON public.content_violations(status);
CREATE INDEX idx_conduct_agreements_user_id ON public.conduct_agreements(user_id);