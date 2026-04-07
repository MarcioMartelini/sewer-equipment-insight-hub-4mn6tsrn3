DO $$
BEGIN
-- Create tables
CREATE TABLE IF NOT EXISTS public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  department TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.work_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wo_number TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  product_type TEXT,
  status TEXT NOT NULL DEFAULT 'Não iniciado',
  department TEXT,
  due_date DATE,
  progress INTEGER DEFAULT 0,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_name TEXT NOT NULL,
  product_type TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wo_id UUID REFERENCES public.work_orders(id) ON DELETE CASCADE,
  department TEXT,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC,
  threshold_min NUMERIC,
  threshold_max NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_id UUID REFERENCES public.metrics(id) ON DELETE CASCADE,
  alert_type TEXT,
  alert_message TEXT,
  assigned_to UUID REFERENCES public.users(id),
  status TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.warranty_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  serial_number TEXT,
  wo_id UUID REFERENCES public.work_orders(id) ON DELETE CASCADE,
  customer_name TEXT,
  issue_description TEXT,
  status TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wo_id UUID REFERENCES public.work_orders(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id),
  action TEXT,
  description TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);
END $$;

-- Trigger for auto creating user profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, department, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', 'Usuário'),
    COALESCE(NEW.raw_user_meta_data->>'department', 'Vendas'),
    'user'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Functions for RLS
CREATE OR REPLACE FUNCTION public.get_user_department()
RETURNS TEXT AS $$
  SELECT department FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ENABLE RLS
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warranty_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- POLICIES

-- Departments
DROP POLICY IF EXISTS "Read all departments" ON public.departments;
CREATE POLICY "Read all departments" ON public.departments FOR SELECT TO authenticated USING (true);

-- Users
DROP POLICY IF EXISTS "Users can read own profile or admin reads all" ON public.users;
CREATE POLICY "Users can read own profile or admin reads all" ON public.users
  FOR SELECT TO authenticated USING (auth.uid() = id OR public.get_user_role() = 'admin');

-- Work Orders (Read by department or admin)
DROP POLICY IF EXISTS "Read WO by department or admin" ON public.work_orders;
CREATE POLICY "Read WO by department or admin" ON public.work_orders
  FOR SELECT TO authenticated USING (
    department = public.get_user_department()
    OR public.get_user_role() = 'admin'
  );

DROP POLICY IF EXISTS "Insert WO" ON public.work_orders;
CREATE POLICY "Insert WO" ON public.work_orders
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Update WO" ON public.work_orders;
CREATE POLICY "Update WO" ON public.work_orders
  FOR UPDATE TO authenticated USING (
    department = public.get_user_department()
    OR public.get_user_role() = 'admin'
  );

-- Other tables policies
DROP POLICY IF EXISTS "Auth read metrics" ON public.metrics;
CREATE POLICY "Auth read metrics" ON public.metrics FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Auth read alerts" ON public.alerts;
CREATE POLICY "Auth read alerts" ON public.alerts FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Auth read warranty" ON public.warranty_claims;
CREATE POLICY "Auth read warranty" ON public.warranty_claims FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Auth read audit" ON public.audit_log;
CREATE POLICY "Auth read audit" ON public.audit_log FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Auth read products" ON public.products;
CREATE POLICY "Auth read products" ON public.products FOR SELECT TO authenticated USING (true);

-- Seed Data
DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- 1. Seed Departments
  INSERT INTO public.departments (name, description) VALUES
  ('Vendas', 'Departamento de Vendas'),
  ('Engenharia', 'Departamento de Engenharia'),
  ('Compras', 'Departamento de Compras'),
  ('Produção', 'Departamento de Produção'),
  ('Qualidade', 'Departamento de Qualidade'),
  ('Entrega', 'Departamento de Entrega'),
  ('Garantia', 'Departamento de Garantia')
  ON CONFLICT (name) DO NOTHING;

  -- 2. Seed Admin User
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'marcio_martelini@hotmail.com') THEN
    new_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      new_user_id,
      '00000000-0000-0000-0000-000000000000',
      'marcio_martelini@hotmail.com',
      crypt('Skip@Pass123', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Marcio Martelini", "department": "admin"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );

    UPDATE public.users SET role = 'admin', department = 'admin' WHERE id = new_user_id;
  ELSE
    UPDATE public.users SET role = 'admin', department = 'admin' 
    WHERE email = 'marcio_martelini@hotmail.com';
  END IF;
  
  -- 3. Seed some WOs so the dashboard is not empty
  IF NOT EXISTS (SELECT 1 FROM public.work_orders) THEN
    INSERT INTO public.work_orders (wo_number, customer_name, product_type, status, department, due_date, progress) VALUES
    ('WO-1001', 'Tech Corp', 'Servidor', 'No prazo', 'Engenharia', CURRENT_DATE + INTERVAL '5 days', 30),
    ('WO-1002', 'Indústrias ACME', 'Motor', 'Atrasado', 'Produção', CURRENT_DATE - INTERVAL '2 days', 65),
    ('WO-1003', 'Global Solutions', 'Software', 'Em risco', 'Qualidade', CURRENT_DATE + INTERVAL '1 day', 85),
    ('WO-1004', 'Mega Store', 'Painel Solar', 'Não iniciado', 'Vendas', CURRENT_DATE + INTERVAL '10 days', 0),
    ('WO-1005', 'Fast Logistics', 'Empilhadeira', 'Concluído', 'Entrega', CURRENT_DATE - INTERVAL '5 days', 100);
  END IF;

END $$;
