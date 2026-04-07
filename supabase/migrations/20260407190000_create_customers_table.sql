DO $$
BEGIN
  CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id TEXT UNIQUE NOT NULL,
    customer_name TEXT NOT NULL,
    contact_person TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    country TEXT,
    status TEXT DEFAULT 'Active',
    total_wos INTEGER DEFAULT 0,
    last_wo_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );
END $$;

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Auth read customers" ON public.customers;
CREATE POLICY "Auth read customers" ON public.customers FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Auth insert customers" ON public.customers;
CREATE POLICY "Auth insert customers" ON public.customers FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Auth update customers" ON public.customers;
CREATE POLICY "Auth update customers" ON public.customers FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "Auth delete customers" ON public.customers;
CREATE POLICY "Auth delete customers" ON public.customers FOR DELETE TO authenticated USING (true);

INSERT INTO public.customers (customer_id, customer_name, contact_person, email, phone, city, state, country, status, total_wos, last_wo_date)
VALUES 
  ('CUST-001', 'Acme Corp', 'John Doe', 'john@acme.com', '123-456-7890', 'New York', 'NY', 'USA', 'Active', 5, '2026-03-15'),
  ('CUST-002', 'TechFlow', 'Jane Smith', 'jane@techflow.com', '098-765-4321', 'San Francisco', 'CA', 'USA', 'Active', 2, '2026-04-01'),
  ('CUST-003', 'Global Ind', 'Mike Johnson', 'mike@globalind.com', '555-123-4567', 'Chicago', 'IL', 'USA', 'Inactive', 0, NULL)
ON CONFLICT (customer_id) DO NOTHING;
