CREATE TABLE IF NOT EXISTS public.production_weld_shop (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wo_id UUID REFERENCES public.work_orders(id) ON DELETE CASCADE,
    task_name TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.production_paint (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wo_id UUID REFERENCES public.work_orders(id) ON DELETE CASCADE,
    task_name TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.production_sub_assembly (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wo_id UUID REFERENCES public.work_orders(id) ON DELETE CASCADE,
    task_name TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.production_warehouse (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wo_id UUID REFERENCES public.work_orders(id) ON DELETE CASCADE,
    task_name TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.production_final_assembly (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wo_id UUID REFERENCES public.work_orders(id) ON DELETE CASCADE,
    station_name TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.production_tests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wo_id UUID REFERENCES public.work_orders(id) ON DELETE CASCADE,
    test_name TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Enable
ALTER TABLE public.production_weld_shop ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_paint ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_sub_assembly ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_warehouse ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_final_assembly ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_tests ENABLE ROW LEVEL SECURITY;

-- Policies for production_weld_shop
DROP POLICY IF EXISTS "Auth read production_weld_shop" ON public.production_weld_shop;
CREATE POLICY "Auth read production_weld_shop" ON public.production_weld_shop FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Auth insert production_weld_shop" ON public.production_weld_shop;
CREATE POLICY "Auth insert production_weld_shop" ON public.production_weld_shop FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Auth update production_weld_shop" ON public.production_weld_shop;
CREATE POLICY "Auth update production_weld_shop" ON public.production_weld_shop FOR UPDATE TO authenticated USING (true);
DROP POLICY IF EXISTS "Auth delete production_weld_shop" ON public.production_weld_shop;
CREATE POLICY "Auth delete production_weld_shop" ON public.production_weld_shop FOR DELETE TO authenticated USING (true);

-- Policies for production_paint
DROP POLICY IF EXISTS "Auth read production_paint" ON public.production_paint;
CREATE POLICY "Auth read production_paint" ON public.production_paint FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Auth insert production_paint" ON public.production_paint;
CREATE POLICY "Auth insert production_paint" ON public.production_paint FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Auth update production_paint" ON public.production_paint;
CREATE POLICY "Auth update production_paint" ON public.production_paint FOR UPDATE TO authenticated USING (true);
DROP POLICY IF EXISTS "Auth delete production_paint" ON public.production_paint;
CREATE POLICY "Auth delete production_paint" ON public.production_paint FOR DELETE TO authenticated USING (true);

-- Policies for production_sub_assembly
DROP POLICY IF EXISTS "Auth read production_sub_assembly" ON public.production_sub_assembly;
CREATE POLICY "Auth read production_sub_assembly" ON public.production_sub_assembly FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Auth insert production_sub_assembly" ON public.production_sub_assembly;
CREATE POLICY "Auth insert production_sub_assembly" ON public.production_sub_assembly FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Auth update production_sub_assembly" ON public.production_sub_assembly;
CREATE POLICY "Auth update production_sub_assembly" ON public.production_sub_assembly FOR UPDATE TO authenticated USING (true);
DROP POLICY IF EXISTS "Auth delete production_sub_assembly" ON public.production_sub_assembly;
CREATE POLICY "Auth delete production_sub_assembly" ON public.production_sub_assembly FOR DELETE TO authenticated USING (true);

-- Policies for production_warehouse
DROP POLICY IF EXISTS "Auth read production_warehouse" ON public.production_warehouse;
CREATE POLICY "Auth read production_warehouse" ON public.production_warehouse FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Auth insert production_warehouse" ON public.production_warehouse;
CREATE POLICY "Auth insert production_warehouse" ON public.production_warehouse FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Auth update production_warehouse" ON public.production_warehouse;
CREATE POLICY "Auth update production_warehouse" ON public.production_warehouse FOR UPDATE TO authenticated USING (true);
DROP POLICY IF EXISTS "Auth delete production_warehouse" ON public.production_warehouse;
CREATE POLICY "Auth delete production_warehouse" ON public.production_warehouse FOR DELETE TO authenticated USING (true);

-- Policies for production_final_assembly
DROP POLICY IF EXISTS "Auth read production_final_assembly" ON public.production_final_assembly;
CREATE POLICY "Auth read production_final_assembly" ON public.production_final_assembly FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Auth insert production_final_assembly" ON public.production_final_assembly;
CREATE POLICY "Auth insert production_final_assembly" ON public.production_final_assembly FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Auth update production_final_assembly" ON public.production_final_assembly;
CREATE POLICY "Auth update production_final_assembly" ON public.production_final_assembly FOR UPDATE TO authenticated USING (true);
DROP POLICY IF EXISTS "Auth delete production_final_assembly" ON public.production_final_assembly;
CREATE POLICY "Auth delete production_final_assembly" ON public.production_final_assembly FOR DELETE TO authenticated USING (true);

-- Policies for production_tests
DROP POLICY IF EXISTS "Auth read production_tests" ON public.production_tests;
CREATE POLICY "Auth read production_tests" ON public.production_tests FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Auth insert production_tests" ON public.production_tests;
CREATE POLICY "Auth insert production_tests" ON public.production_tests FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Auth update production_tests" ON public.production_tests;
CREATE POLICY "Auth update production_tests" ON public.production_tests FOR UPDATE TO authenticated USING (true);
DROP POLICY IF EXISTS "Auth delete production_tests" ON public.production_tests;
CREATE POLICY "Auth delete production_tests" ON public.production_tests FOR DELETE TO authenticated USING (true);

-- Seed basic data
DO $$
DECLARE
  v_wo_id UUID;
  v_quote_id UUID;
  v_user_id UUID;
BEGIN
  -- We need a user to create a quote and a work order (created_by)
  SELECT id INTO v_user_id FROM auth.users LIMIT 1;
  
  -- Check if any work orders exist
  SELECT id INTO v_wo_id FROM public.work_orders LIMIT 1;
  
  -- If not, create a quote and a work order to avoid empty state
  IF v_wo_id IS NULL THEN
    v_quote_id := gen_random_uuid();
    INSERT INTO public.quotes (id, quote_number, customer_name, product_type, status, created_by)
    VALUES (v_quote_id, 'Q-PROD-001', 'Acme Corp', 'Industrial', 'approved', v_user_id)
    ON CONFLICT (quote_number) DO NOTHING;

    v_wo_id := gen_random_uuid();
    INSERT INTO public.work_orders (id, wo_number, customer_name, product_type, status, department, created_by, quote_id)
    VALUES (v_wo_id, 'WO-PROD-001', 'Acme Corp', 'Industrial', 'Em andamento', 'Production', v_user_id, v_quote_id)
    ON CONFLICT (wo_number) DO NOTHING;
  END IF;

  -- Insert dummy tasks into production_weld_shop if empty
  IF v_wo_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.production_weld_shop WHERE wo_id = v_wo_id) THEN
    INSERT INTO public.production_weld_shop (wo_id, task_name, status) VALUES 
      (v_wo_id, 'Chassis frame', 'pending'),
      (v_wo_id, 'Trailer frame', 'in_progress'),
      (v_wo_id, 'Boiler frame', 'completed');
  END IF;

  -- Insert dummy tasks into production_paint if empty
  IF v_wo_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.production_paint WHERE wo_id = v_wo_id) THEN
    INSERT INTO public.production_paint (wo_id, task_name, status) VALUES 
      (v_wo_id, 'Prime coating', 'pending'),
      (v_wo_id, 'Final paint', 'pending');
  END IF;

  -- Insert dummy tasks into production_sub_assembly if empty
  IF v_wo_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.production_sub_assembly WHERE wo_id = v_wo_id) THEN
    INSERT INTO public.production_sub_assembly (wo_id, task_name, status) VALUES 
      (v_wo_id, 'Engine sub-assembly', 'pending');
  END IF;

  -- Insert dummy tasks into production_warehouse if empty
  IF v_wo_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.production_warehouse WHERE wo_id = v_wo_id) THEN
    INSERT INTO public.production_warehouse (wo_id, task_name, status) VALUES 
      (v_wo_id, 'Accessories list', 'pending');
  END IF;

  -- Insert dummy tasks into production_final_assembly if empty
  IF v_wo_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.production_final_assembly WHERE wo_id = v_wo_id) THEN
    INSERT INTO public.production_final_assembly (wo_id, station_name, status) VALUES 
      (v_wo_id, 'Station #1', 'pending'),
      (v_wo_id, 'Station #2', 'pending');
  END IF;

  -- Insert dummy tasks into production_tests if empty
  IF v_wo_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.production_tests WHERE wo_id = v_wo_id) THEN
    INSERT INTO public.production_tests (wo_id, test_name, status) VALUES 
      (v_wo_id, 'First test', 'pending'),
      (v_wo_id, 'Final test', 'pending');
  END IF;

END $$;
