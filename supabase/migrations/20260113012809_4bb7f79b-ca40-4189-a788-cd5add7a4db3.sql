-- Remove existing schedules
SELECT cron.unschedule('send-daily-digest');
SELECT cron.unschedule('send-weekly-digest');

-- Schedule daily digest at 8:00 AM UTC Monday-Saturday (not Sunday)
SELECT cron.schedule(
  'send-daily-digest',
  '0 8 * * 1-6',
  $$SELECT net.http_post(
    url := 'https://ulztqglgbzhzqpaaekki.supabase.co/functions/v1/send-digest-emails',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('supabase.service_role_key') || '"}'::jsonb,
    body := '{"frequency": "daily"}'::jsonb
  )$$
);

-- Schedule weekly digest at 8:00 AM UTC on Sundays
SELECT cron.schedule(
  'send-weekly-digest',
  '0 8 * * 0',
  $$SELECT net.http_post(
    url := 'https://ulztqglgbzhzqpaaekki.supabase.co/functions/v1/send-digest-emails',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('supabase.service_role_key') || '"}'::jsonb,
    body := '{"frequency": "weekly"}'::jsonb
  )$$
);