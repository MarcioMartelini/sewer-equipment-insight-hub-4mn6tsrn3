DO $DO$
BEGIN
  CREATE TABLE IF NOT EXISTS public.salespersons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    salesperson_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    department TEXT,
    region TEXT,
    total_wos INTEGER DEFAULT 0,
    total_revenue NUMERIC DEFAULT 0,
    commission_rate NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'Active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
  );

  ALTER TABLE public.salespersons ENABLE ROW LEVEL SECURITY;

  DROP POLICY IF EXISTS "Auth read salespersons" ON public.salespersons;
  CREATE POLICY "Auth read salespersons" ON public.salespersons
    FOR SELECT TO authenticated USING (true);

  DROP POLICY IF EXISTS "Auth insert salespersons" ON public.salespersons;
  CREATE POLICY "Auth insert salespersons" ON public.salespersons
    FOR INSERT TO authenticated WITH CHECK (true);

  DROP POLICY IF EXISTS "Auth update salespersons" ON public.salespersons;
  CREATE POLICY "Auth update salespersons" ON public.salespersons
    FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "Auth delete salespersons" ON public.salespersons;
  CREATE POLICY "Auth delete salespersons" ON public.salespersons
    FOR DELETE TO authenticated USING (true);
END $DO$;

INSERT INTO public.salespersons (salesperson_id, name, email, phone, department, region, total_wos, total_revenue, commission_rate, status)
VALUES
('SP-001', 'John Doe', 'john.doe@example.com', '(555) 123-4567', 'Enterprise', 'North America', 45, 1250000.00, 5.0, 'Active'),
('SP-002', 'Jane Smith', 'jane.smith@example.com', '(555) 987-6543', 'SMB', 'Europe', 32, 850000.00, 4.5, 'Active'),
('SP-003', 'Mike Johnson', 'mike.j@example.com', '(555) 456-7890', 'Enterprise', 'Asia', 12, 450000.00, 5.0, 'Inactive')
ON CONFLICT (salesperson_id) DO NOTHING;
