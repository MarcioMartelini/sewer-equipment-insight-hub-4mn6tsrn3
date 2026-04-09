DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'late_card_pulls') THEN
    CREATE TABLE public.late_card_pulls (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      date DATE,
      part_number TEXT,
      area_supervisor TEXT,
      occurrence_description TEXT,
      status TEXT DEFAULT 'pending',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
    );
  END IF;
END $$;

ALTER TABLE public.warranty_claims 
  ADD COLUMN IF NOT EXISTS date DATE,
  ADD COLUMN IF NOT EXISTS product_family TEXT,
  ADD COLUMN IF NOT EXISTS machine_model TEXT,
  ADD COLUMN IF NOT EXISTS occurrence_description TEXT,
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Enable RLS
ALTER TABLE public.warranty_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.late_card_pulls ENABLE ROW LEVEL SECURITY;

-- Policies for warranty_claims
DROP POLICY IF EXISTS "warranty_claims_select" ON public.warranty_claims;
CREATE POLICY "warranty_claims_select" ON public.warranty_claims FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "warranty_claims_insert" ON public.warranty_claims;
CREATE POLICY "warranty_claims_insert" ON public.warranty_claims FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "warranty_claims_update" ON public.warranty_claims;
CREATE POLICY "warranty_claims_update" ON public.warranty_claims FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "warranty_claims_delete" ON public.warranty_claims;
CREATE POLICY "warranty_claims_delete" ON public.warranty_claims FOR DELETE TO authenticated USING (true);

-- Policies for late_card_pulls
DROP POLICY IF EXISTS "late_card_pulls_select" ON public.late_card_pulls;
CREATE POLICY "late_card_pulls_select" ON public.late_card_pulls FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "late_card_pulls_insert" ON public.late_card_pulls;
CREATE POLICY "late_card_pulls_insert" ON public.late_card_pulls FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "late_card_pulls_update" ON public.late_card_pulls;
CREATE POLICY "late_card_pulls_update" ON public.late_card_pulls FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "late_card_pulls_delete" ON public.late_card_pulls;
CREATE POLICY "late_card_pulls_delete" ON public.late_card_pulls FOR DELETE TO authenticated USING (true);
