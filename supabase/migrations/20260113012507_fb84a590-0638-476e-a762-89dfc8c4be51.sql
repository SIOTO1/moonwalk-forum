-- Enable the pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create a function to invoke the digest edge function
CREATE OR REPLACE FUNCTION public.invoke_digest_emails(frequency text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  response json;
BEGIN
  -- Use pg_net to call the edge function
  PERFORM net.http_post(
    url := current_setting('app.settings.supabase_url') || '/functions/v1/send-digest-emails',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
    ),
    body := jsonb_build_object('frequency', frequency)
  );
END;
$$;

-- Schedule daily digest at 8:00 AM UTC
SELECT cron.schedule(
  'send-daily-digest',
  '0 8 * * *',
  $$SELECT net.http_post(
    url := 'https://ulztqglgbzhzqpaaekki.supabase.co/functions/v1/send-digest-emails',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('supabase.service_role_key') || '"}'::jsonb,
    body := '{"frequency": "daily"}'::jsonb
  )$$
);

-- Schedule weekly digest at 9:00 AM UTC on Mondays
SELECT cron.schedule(
  'send-weekly-digest',
  '0 9 * * 1',
  $$SELECT net.http_post(
    url := 'https://ulztqglgbzhzqpaaekki.supabase.co/functions/v1/send-digest-emails',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('supabase.service_role_key') || '"}'::jsonb,
    body := '{"frequency": "weekly"}'::jsonb
  )$$
);