-- Add onboarding_completed field to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS onboarding_completed boolean NOT NULL DEFAULT false;

-- Update the handle_new_user function to include onboarding_completed
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  generated_username TEXT;
BEGIN
  -- Generate username from email or metadata
  generated_username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    split_part(NEW.email, '@', 1)
  );
  
  INSERT INTO public.profiles (user_id, username, email_verified, onboarding_completed)
  VALUES (
    NEW.id, 
    generated_username,
    NEW.email_confirmed_at IS NOT NULL,
    false
  );
  
  -- Also add default 'user' role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN NEW;
END;
$$;