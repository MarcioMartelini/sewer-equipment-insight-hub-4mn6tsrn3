-- Add new columns to wo_tasks if they don't exist
ALTER TABLE public.wo_tasks ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES public.users(id) ON DELETE SET NULL;
ALTER TABLE public.wo_tasks ADD COLUMN IF NOT EXISTS progress INTEGER DEFAULT 0;

-- Create history table
CREATE TABLE IF NOT EXISTS public.wo_task_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.wo_tasks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS policies for history
ALTER TABLE public.wo_task_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Auth read wo_task_history" ON public.wo_task_history;
CREATE POLICY "Auth read wo_task_history" ON public.wo_task_history FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Auth insert wo_task_history" ON public.wo_task_history;
CREATE POLICY "Auth insert wo_task_history" ON public.wo_task_history FOR INSERT TO authenticated WITH CHECK (true);
