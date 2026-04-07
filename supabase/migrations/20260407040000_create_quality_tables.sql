-- 1. Create quality_warranty_claims
CREATE TABLE IF NOT EXISTS public.quality_warranty_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wo_id UUID REFERENCES public.work_orders(id) ON DELETE CASCADE,
  serial_number TEXT,
  customer_name TEXT,
  issue_description TEXT,
  issue_category TEXT,
  status TEXT DEFAULT 'pending',
  reported_date DATE,
  resolved_date DATE,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create quality_late_card_pulls
CREATE TABLE IF NOT EXISTS public.quality_late_card_pulls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wo_id UUID REFERENCES public.work_orders(id) ON DELETE CASCADE,
  component_name TEXT NOT NULL,
  pull_reason TEXT,
  pull_date DATE,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. RLS Policies
-- quality_warranty_claims
ALTER TABLE public.quality_warranty_claims ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Auth delete quality_warranty_claims" ON public.quality_warranty_claims;
CREATE POLICY "Auth delete quality_warranty_claims" ON public.quality_warranty_claims
  FOR DELETE TO authenticated USING (true);

DROP POLICY IF EXISTS "Auth insert quality_warranty_claims" ON public.quality_warranty_claims;
CREATE POLICY "Auth insert quality_warranty_claims" ON public.quality_warranty_claims
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Auth read quality_warranty_claims" ON public.quality_warranty_claims;
CREATE POLICY "Auth read quality_warranty_claims" ON public.quality_warranty_claims
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Auth update quality_warranty_claims" ON public.quality_warranty_claims;
CREATE POLICY "Auth update quality_warranty_claims" ON public.quality_warranty_claims
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- quality_late_card_pulls
ALTER TABLE public.quality_late_card_pulls ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Auth delete quality_late_card_pulls" ON public.quality_late_card_pulls;
CREATE POLICY "Auth delete quality_late_card_pulls" ON public.quality_late_card_pulls
  FOR DELETE TO authenticated USING (true);

DROP POLICY IF EXISTS "Auth insert quality_late_card_pulls" ON public.quality_late_card_pulls;
CREATE POLICY "Auth insert quality_late_card_pulls" ON public.quality_late_card_pulls
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Auth read quality_late_card_pulls" ON public.quality_late_card_pulls;
CREATE POLICY "Auth read quality_late_card_pulls" ON public.quality_late_card_pulls
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Auth update quality_late_card_pulls" ON public.quality_late_card_pulls;
CREATE POLICY "Auth update quality_late_card_pulls" ON public.quality_late_card_pulls
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DO $$
DECLARE
  woid UUID;
BEGIN
  SELECT id INTO woid FROM public.work_orders LIMIT 1;
  IF woid IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM public.quality_warranty_claims WHERE serial_number = 'SN-10023') THEN
      INSERT INTO public.quality_warranty_claims (wo_id, serial_number, customer_name, issue_description, issue_category, status, reported_date)
      VALUES (woid, 'SN-10023', 'Acme Corp', 'Hydraulic leak on main cylinder', 'Hydraulics', 'pending', CURRENT_DATE);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.quality_late_card_pulls WHERE component_name = 'Water Pump X1') THEN
      INSERT INTO public.quality_late_card_pulls (wo_id, component_name, pull_reason, pull_date, status)
      VALUES (woid, 'Water Pump X1', 'Out of stock at station', CURRENT_DATE, 'pending');
    END IF;
  END IF;
END $$;
