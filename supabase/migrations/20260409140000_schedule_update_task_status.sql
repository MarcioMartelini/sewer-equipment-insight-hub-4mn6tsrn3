-- Enable pg_net to make HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Enable pg_cron for scheduling
CREATE EXTENSION IF NOT EXISTS pg_cron;

DO $DO$
DECLARE
  project_url text;
BEGIN
  -- URL for the deployed edge function
  project_url := 'https://mfujajfcebsbkovbtvqh.supabase.co/functions/v1/update-task-status';
  
  -- Unschedule existing job if any to ensure idempotency
  BEGIN
    PERFORM cron.unschedule('update-task-status-daily');
  EXCEPTION
    WHEN OTHERS THEN
      -- Ignore error if job doesn't exist
  END;
  
  -- Schedule the edge function to run daily at 00:00 (midnight UTC)
  PERFORM cron.schedule(
    'update-task-status-daily',
    '0 0 * * *',
    format(
      $$ SELECT net.http_post(url:='%s', headers:='{"Content-Type": "application/json"}'::jsonb, body:='{}'::jsonb) $$,
      project_url
    )
  );
END $DO$;
