ALTER TABLE public.wo_task_comments_history ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
