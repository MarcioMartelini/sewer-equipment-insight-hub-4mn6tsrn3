ALTER TABLE public.work_orders ADD COLUMN IF NOT EXISTS production_schedule JSONB DEFAULT '{}'::jsonb;
