-- 1. Fix privilege escalation in override_violation: use auth.uid() instead of trusting caller-supplied moderator id
DROP FUNCTION IF EXISTS public.override_violation(uuid, uuid, text);

CREATE OR REPLACE FUNCTION public.override_violation(_violation_id uuid, _reason text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  affected_user_id UUID;
  caller_id UUID := auth.uid();
BEGIN
  -- Require an authenticated caller
  IF caller_id IS NULL THEN
    RETURN false;
  END IF;

  -- Check moderator permission against the AUTHENTICATED user, never a client-supplied id
  IF NOT public.can_moderate(caller_id) THEN
    RETURN false;
  END IF;

  SELECT user_id INTO affected_user_id
  FROM public.content_violations WHERE id = _violation_id;

  IF affected_user_id IS NULL THEN
    RETURN false;
  END IF;

  UPDATE public.content_violations SET
    status = 'overridden',
    overridden_by = caller_id,
    override_reason = _reason
  WHERE id = _violation_id;

  UPDATE public.profiles SET
    strike_count = GREATEST(strike_count - 1, 0)
  WHERE user_id = affected_user_id;

  IF public.get_active_strike_count(affected_user_id) < 2 THEN
    UPDATE public.profiles SET
      is_restricted = false,
      restriction_expires_at = NULL
    WHERE user_id = affected_user_id;
  END IF;

  INSERT INTO public.moderation_logs (moderator_id, target_user_id, action, reason, details)
  VALUES (caller_id, affected_user_id, 'warning', _reason,
    jsonb_build_object('action', 'override_violation', 'violation_id', _violation_id));

  RETURN true;
END;
$function$;

-- 2. Stop storing user IP addresses in conduct_agreements (PII minimization).
ALTER TABLE public.conduct_agreements DROP COLUMN IF EXISTS ip_address;

-- 3. Add explicit UPDATE policy on storage.objects for the thread-images bucket
--    (owner-only, scoped by folder = auth.uid()).
DROP POLICY IF EXISTS "Users can update their own thread images" ON storage.objects;
CREATE POLICY "Users can update their own thread images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'thread-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'thread-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);