CREATE TABLE IF NOT EXISTS public.hr_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    department TEXT NOT NULL,
    monthly_contracted_hours NUMERIC DEFAULT 160,
    hours_per_day NUMERIC DEFAULT 8,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT hr_settings_department_key UNIQUE (department)
);

ALTER TABLE public.hr_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Auth read hr_settings" ON public.hr_settings;
CREATE POLICY "Auth read hr_settings" ON public.hr_settings 
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Auth update hr_settings" ON public.hr_settings;
CREATE POLICY "Auth update hr_settings" ON public.hr_settings 
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Auth insert hr_settings" ON public.hr_settings;
CREATE POLICY "Auth insert hr_settings" ON public.hr_settings 
  FOR INSERT TO authenticated WITH CHECK (true);

INSERT INTO public.hr_settings (department, monthly_contracted_hours, hours_per_day)
VALUES ('HR', 160, 8)
ON CONFLICT (department) DO NOTHING;
