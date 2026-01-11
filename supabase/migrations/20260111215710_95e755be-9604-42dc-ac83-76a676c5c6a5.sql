-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Anyone can view basic profile info" ON public.profiles;

-- Create new policy that only allows authenticated users to view profiles
CREATE POLICY "Authenticated users can view profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- Also update the public_profiles view to use SECURITY INVOKER (already done, but ensure it's correct)
DROP VIEW IF EXISTS public.public_profiles;
CREATE VIEW public.public_profiles WITH (security_invoker = true) AS
SELECT 
  id,
  user_id,
  username,
  display_name,
  avatar_url,
  bio,
  membership_tier,
  reputation,
  post_count,
  reply_count,
  created_at
FROM public.profiles;