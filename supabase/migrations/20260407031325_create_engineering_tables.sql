-- Create engineering_layouts table
CREATE TABLE IF NOT EXISTS public.engineering_layouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wo_id UUID REFERENCES public.work_orders(id) ON DELETE CASCADE,
  layout_name TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.engineering_layouts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Auth read engineering_layouts" ON public.engineering_layouts;
CREATE POLICY "Auth read engineering_layouts" ON public.engineering_layouts
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Auth insert engineering_layouts" ON public.engineering_layouts;
CREATE POLICY "Auth insert engineering_layouts" ON public.engineering_layouts
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Auth update engineering_layouts" ON public.engineering_layouts;
CREATE POLICY "Auth update engineering_layouts" ON public.engineering_layouts
  FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "Auth delete engineering_layouts" ON public.engineering_layouts;
CREATE POLICY "Auth delete engineering_layouts" ON public.engineering_layouts
  FOR DELETE TO authenticated USING (true);


-- Create engineering_boms table
CREATE TABLE IF NOT EXISTS public.engineering_boms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wo_id UUID REFERENCES public.work_orders(id) ON DELETE CASCADE,
  bom_name TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.engineering_boms ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Auth read engineering_boms" ON public.engineering_boms;
CREATE POLICY "Auth read engineering_boms" ON public.engineering_boms
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Auth insert engineering_boms" ON public.engineering_boms;
CREATE POLICY "Auth insert engineering_boms" ON public.engineering_boms
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Auth update engineering_boms" ON public.engineering_boms;
CREATE POLICY "Auth update engineering_boms" ON public.engineering_boms
  FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "Auth delete engineering_boms" ON public.engineering_boms;
CREATE POLICY "Auth delete engineering_boms" ON public.engineering_boms
  FOR DELETE TO authenticated USING (true);


-- Create engineering_travelers table
CREATE TABLE IF NOT EXISTS public.engineering_travelers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wo_id UUID REFERENCES public.work_orders(id) ON DELETE CASCADE,
  traveler_name TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.engineering_travelers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Auth read engineering_travelers" ON public.engineering_travelers;
CREATE POLICY "Auth read engineering_travelers" ON public.engineering_travelers
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Auth insert engineering_travelers" ON public.engineering_travelers;
CREATE POLICY "Auth insert engineering_travelers" ON public.engineering_travelers
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Auth update engineering_travelers" ON public.engineering_travelers;
CREATE POLICY "Auth update engineering_travelers" ON public.engineering_travelers
  FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "Auth delete engineering_travelers" ON public.engineering_travelers;
CREATE POLICY "Auth delete engineering_travelers" ON public.engineering_travelers
  FOR DELETE TO authenticated USING (true);


-- Create engineering_accessories table
CREATE TABLE IF NOT EXISTS public.engineering_accessories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wo_id UUID REFERENCES public.work_orders(id) ON DELETE CASCADE,
  accessories_list_name TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.engineering_accessories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Auth read engineering_accessories" ON public.engineering_accessories;
CREATE POLICY "Auth read engineering_accessories" ON public.engineering_accessories
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Auth insert engineering_accessories" ON public.engineering_accessories;
CREATE POLICY "Auth insert engineering_accessories" ON public.engineering_accessories
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Auth update engineering_accessories" ON public.engineering_accessories;
CREATE POLICY "Auth update engineering_accessories" ON public.engineering_accessories
  FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "Auth delete engineering_accessories" ON public.engineering_accessories;
CREATE POLICY "Auth delete engineering_accessories" ON public.engineering_accessories
  FOR DELETE TO authenticated USING (true);


-- Create engineering_tasks table
CREATE TABLE IF NOT EXISTS public.engineering_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wo_id UUID REFERENCES public.work_orders(id) ON DELETE CASCADE,
  task_type TEXT NOT NULL,
  task_name TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.engineering_tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Auth read engineering_tasks" ON public.engineering_tasks;
CREATE POLICY "Auth read engineering_tasks" ON public.engineering_tasks
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Auth insert engineering_tasks" ON public.engineering_tasks;
CREATE POLICY "Auth insert engineering_tasks" ON public.engineering_tasks
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Auth update engineering_tasks" ON public.engineering_tasks;
CREATE POLICY "Auth update engineering_tasks" ON public.engineering_tasks
  FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "Auth delete engineering_tasks" ON public.engineering_tasks;
CREATE POLICY "Auth delete engineering_tasks" ON public.engineering_tasks
  FOR DELETE TO authenticated USING (true);
