ALTER TABLE public.wo_tasks ADD COLUMN IF NOT EXISTS was_delayed BOOLEAN DEFAULT false;

UPDATE public.wo_tasks 
SET was_delayed = true 
WHERE finish_date < CURRENT_DATE AND is_completed = false AND was_delayed = false;
