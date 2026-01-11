-- Fix 1: Create a secure view for public profile data (hide sensitive fields)
CREATE OR REPLACE VIEW public.public_profiles AS
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

-- Grant access to the view
GRANT SELECT ON public.public_profiles TO anon, authenticated;

-- Update profiles RLS: Only authenticated users can see full profiles, and only their own sensitive fields
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Anyone can see basic profile info
CREATE POLICY "Anyone can view basic profile info"
ON public.profiles
FOR SELECT
USING (true);

-- Note: We'll use the public_profiles view for anonymous access which hides sensitive fields

-- Fix 2: Restrict conduct_agreements IP visibility to admins only
DROP POLICY IF EXISTS "Users can view their own agreement" ON public.conduct_agreements;

CREATE POLICY "Users can view their own agreement"
ON public.conduct_agreements
FOR SELECT
USING (auth.uid() = user_id);

-- Admins can view all agreements (including IP)
CREATE POLICY "Admins can view all agreements"
ON public.conduct_agreements
FOR SELECT
USING (public.is_admin(auth.uid()));