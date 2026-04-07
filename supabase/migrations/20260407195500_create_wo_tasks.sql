CREATE TABLE IF NOT EXISTS public.wo_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wo_id UUID NOT NULL REFERENCES public.work_orders(id) ON DELETE CASCADE,
  department TEXT NOT NULL,
  sub_department TEXT,
  task_name TEXT NOT NULL,
  start_date DATE,
  finish_date DATE,
  status TEXT NOT NULL DEFAULT 'Pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS wo_tasks_wo_id_idx ON public.wo_tasks(wo_id);

ALTER TABLE public.wo_tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Auth read wo_tasks" ON public.wo_tasks;
CREATE POLICY "Auth read wo_tasks" ON public.wo_tasks
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Auth insert wo_tasks" ON public.wo_tasks;
CREATE POLICY "Auth insert wo_tasks" ON public.wo_tasks
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Auth update wo_tasks" ON public.wo_tasks;
CREATE POLICY "Auth update wo_tasks" ON public.wo_tasks
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Auth delete wo_tasks" ON public.wo_tasks;
CREATE POLICY "Auth delete wo_tasks" ON public.wo_tasks
  FOR DELETE TO authenticated USING (true);
