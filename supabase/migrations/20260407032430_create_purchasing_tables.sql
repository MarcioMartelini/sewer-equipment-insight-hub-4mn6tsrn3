-- Create purchasing_components table
CREATE TABLE IF NOT EXISTS public.purchasing_components (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wo_id UUID REFERENCES public.work_orders(id) ON DELETE CASCADE,
    component_type TEXT NOT NULL CHECK (component_type IN ('Engine', 'Hydraulics', 'Water Pump', 'Water Tank', 'Debris Box', 'Blower', 'Van Air', 'Sewer Hose', 'Shroud')),
    component_name TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    order_date DATE,
    expected_delivery_date DATE,
    actual_delivery_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create purchasing_expedites table
CREATE TABLE IF NOT EXISTS public.purchasing_expedites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wo_id UUID REFERENCES public.work_orders(id) ON DELETE CASCADE,
    component_type TEXT NOT NULL CHECK (component_type IN ('Engine', 'Hydraulics', 'Water Pump', 'Water Tank', 'Debris Box', 'Blower', 'Van Air', 'Sewer Hose', 'Shroud')),
    expedite_reason TEXT,
    expedite_date DATE,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.purchasing_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchasing_expedites ENABLE ROW LEVEL SECURITY;

-- Policies for purchasing_components
DROP POLICY IF EXISTS "Auth read purchasing_components" ON public.purchasing_components;
CREATE POLICY "Auth read purchasing_components" ON public.purchasing_components
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Auth insert purchasing_components" ON public.purchasing_components;
CREATE POLICY "Auth insert purchasing_components" ON public.purchasing_components
    FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Auth update purchasing_components" ON public.purchasing_components;
CREATE POLICY "Auth update purchasing_components" ON public.purchasing_components
    FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "Auth delete purchasing_components" ON public.purchasing_components;
CREATE POLICY "Auth delete purchasing_components" ON public.purchasing_components
    FOR DELETE TO authenticated USING (true);

-- Policies for purchasing_expedites
DROP POLICY IF EXISTS "Auth read purchasing_expedites" ON public.purchasing_expedites;
CREATE POLICY "Auth read purchasing_expedites" ON public.purchasing_expedites
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Auth insert purchasing_expedites" ON public.purchasing_expedites;
CREATE POLICY "Auth insert purchasing_expedites" ON public.purchasing_expedites
    FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Auth update purchasing_expedites" ON public.purchasing_expedites;
CREATE POLICY "Auth update purchasing_expedites" ON public.purchasing_expedites
    FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "Auth delete purchasing_expedites" ON public.purchasing_expedites;
CREATE POLICY "Auth delete purchasing_expedites" ON public.purchasing_expedites
    FOR DELETE TO authenticated USING (true);
