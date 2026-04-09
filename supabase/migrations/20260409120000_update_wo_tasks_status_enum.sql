DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_status_enum') THEN
    CREATE TYPE public.task_status_enum AS ENUM (
      'not_started',
      'parked',
      'on_track',
      'at_risk',
      'delayed',
      'complete'
    );
  END IF;
END $$;

-- Drop default if exists to safely alter column
ALTER TABLE public.wo_tasks ALTER COLUMN status DROP DEFAULT;

-- Batch update existing status strings to match enum exact values
DO $$
DECLARE
  batch_size INT := 1000;
  affected INT;
BEGIN
  LOOP
    UPDATE public.wo_tasks
    SET status = CASE 
      WHEN lower(status) IN ('not started', 'pending', 'não iniciado') THEN 'not_started'
      WHEN lower(status) = 'parked' THEN 'parked'
      WHEN lower(status) IN ('on track', 'on_track') THEN 'on_track'
      WHEN lower(status) IN ('at risk', 'at_risk') THEN 'at_risk'
      WHEN lower(status) = 'delayed' THEN 'delayed'
      WHEN lower(status) IN ('complete', 'completed') THEN 'complete'
      ELSE 'not_started'
    END
    WHERE status NOT IN ('not_started', 'parked', 'on_track', 'at_risk', 'delayed', 'complete')
    AND id IN (
      SELECT id FROM public.wo_tasks 
      WHERE status NOT IN ('not_started', 'parked', 'on_track', 'at_risk', 'delayed', 'complete')
      LIMIT batch_size
    );
    
    GET DIAGNOSTICS affected = ROW_COUNT;
    EXIT WHEN affected = 0;
    PERFORM pg_sleep(0.1);
  END LOOP;
END $$;

-- Alter column to use ENUM
ALTER TABLE public.wo_tasks ALTER COLUMN status TYPE public.task_status_enum USING status::public.task_status_enum;
ALTER TABLE public.wo_tasks ALTER COLUMN status SET DEFAULT 'not_started'::public.task_status_enum;

-- Add enum status column to wo_task_comments_history to register changes with enum values
ALTER TABLE public.wo_task_comments_history ADD COLUMN IF NOT EXISTS status public.task_status_enum;
