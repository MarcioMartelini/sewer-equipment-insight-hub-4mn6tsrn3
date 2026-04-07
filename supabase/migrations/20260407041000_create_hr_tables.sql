CREATE TABLE IF NOT EXISTS public.hr_productivity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wo_id UUID REFERENCES public.work_orders(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    employee_name TEXT NOT NULL,
    labour_hours NUMERIC,
    production_value NUMERIC,
    productivity_ratio NUMERIC GENERATED ALWAYS AS (
        CASE 
            WHEN production_value IS NULL OR production_value = 0 THEN NULL 
            ELSE labour_hours / (production_value / 1000) 
        END
    ) STORED,
    recorded_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.hr_absences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    employee_name TEXT NOT NULL,
    absence_date DATE,
    absence_type TEXT CHECK (absence_type IN ('excused', 'unexcused')),
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.hr_injuries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    employee_name TEXT NOT NULL,
    injury_date DATE,
    injury_description TEXT,
    injury_type TEXT CHECK (injury_type IN ('recordable', 'non-recordable')),
    severity_level TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ENABLE RLS
ALTER TABLE public.hr_productivity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_absences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_injuries ENABLE ROW LEVEL SECURITY;

-- POLICIES
DROP POLICY IF EXISTS "Auth read hr_productivity" ON public.hr_productivity;
CREATE POLICY "Auth read hr_productivity" ON public.hr_productivity FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Auth insert hr_productivity" ON public.hr_productivity;
CREATE POLICY "Auth insert hr_productivity" ON public.hr_productivity FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Auth update hr_productivity" ON public.hr_productivity;
CREATE POLICY "Auth update hr_productivity" ON public.hr_productivity FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "Auth delete hr_productivity" ON public.hr_productivity;
CREATE POLICY "Auth delete hr_productivity" ON public.hr_productivity FOR DELETE TO authenticated USING (true);

DROP POLICY IF EXISTS "Auth read hr_absences" ON public.hr_absences;
CREATE POLICY "Auth read hr_absences" ON public.hr_absences FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Auth insert hr_absences" ON public.hr_absences;
CREATE POLICY "Auth insert hr_absences" ON public.hr_absences FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Auth update hr_absences" ON public.hr_absences;
CREATE POLICY "Auth update hr_absences" ON public.hr_absences FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "Auth delete hr_absences" ON public.hr_absences;
CREATE POLICY "Auth delete hr_absences" ON public.hr_absences FOR DELETE TO authenticated USING (true);

DROP POLICY IF EXISTS "Auth read hr_injuries" ON public.hr_injuries;
CREATE POLICY "Auth read hr_injuries" ON public.hr_injuries FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Auth insert hr_injuries" ON public.hr_injuries;
CREATE POLICY "Auth insert hr_injuries" ON public.hr_injuries FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Auth update hr_injuries" ON public.hr_injuries;
CREATE POLICY "Auth update hr_injuries" ON public.hr_injuries FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "Auth delete hr_injuries" ON public.hr_injuries;
CREATE POLICY "Auth delete hr_injuries" ON public.hr_injuries FOR DELETE TO authenticated USING (true);

-- SEED MOCK DATA
DO $do$
DECLARE
  v_user_id UUID;
  v_wo_id UUID;
BEGIN
  SELECT id INTO v_user_id FROM public.users LIMIT 1;
  SELECT id INTO v_wo_id FROM public.work_orders LIMIT 1;

  IF v_user_id IS NOT NULL THEN
    INSERT INTO public.hr_productivity (wo_id, employee_id, employee_name, labour_hours, production_value, recorded_date)
    VALUES 
      (v_wo_id, v_user_id, 'João Silva', 40, 50000, CURRENT_DATE - INTERVAL '1 day'),
      (v_wo_id, v_user_id, 'Maria Souza', 35, 45000, CURRENT_DATE - INTERVAL '2 days')
    ON CONFLICT DO NOTHING;

    INSERT INTO public.hr_absences (employee_id, employee_name, absence_date, absence_type, reason)
    VALUES 
      (v_user_id, 'João Silva', CURRENT_DATE - INTERVAL '5 days', 'excused', 'Consulta médica'),
      (v_user_id, 'Maria Souza', CURRENT_DATE - INTERVAL '10 days', 'unexcused', 'Atraso devido a trânsito')
    ON CONFLICT DO NOTHING;

    INSERT INTO public.hr_injuries (employee_id, employee_name, injury_date, injury_description, injury_type, severity_level)
    VALUES 
      (v_user_id, 'João Silva', CURRENT_DATE - INTERVAL '15 days', 'Corte leve na mão', 'non-recordable', 'Low'),
      (v_user_id, 'Carlos Lima', CURRENT_DATE - INTERVAL '20 days', 'Queda de material no pé', 'recordable', 'Medium')
    ON CONFLICT DO NOTHING;
  END IF;
END $do$;
