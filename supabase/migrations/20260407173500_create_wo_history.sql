DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'wo_history') THEN
    CREATE TABLE public.wo_history (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      wo_id UUID REFERENCES public.work_orders(id) ON DELETE CASCADE,
      changed_at TIMESTAMPTZ DEFAULT NOW(),
      department TEXT,
      user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
      old_status TEXT,
      new_status TEXT,
      notes TEXT
    );
    
    ALTER TABLE public.wo_history ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

ALTER TABLE public.work_orders ADD COLUMN IF NOT EXISTS expected_completion_date DATE;
ALTER TABLE public.work_orders ADD COLUMN IF NOT EXISTS actual_completion_date DATE;

DROP POLICY IF EXISTS "Auth read wo_history" ON public.wo_history;
CREATE POLICY "Auth read wo_history" ON public.wo_history FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Auth insert wo_history" ON public.wo_history;
CREATE POLICY "Auth insert wo_history" ON public.wo_history FOR INSERT TO authenticated WITH CHECK (true);
