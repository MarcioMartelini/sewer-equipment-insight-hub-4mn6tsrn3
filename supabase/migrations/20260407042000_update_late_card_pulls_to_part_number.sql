-- Drop dependent policies just in case
DROP POLICY IF EXISTS "Auth delete quality_late_card_pulls" ON public.quality_late_card_pulls;
DROP POLICY IF EXISTS "Auth insert quality_late_card_pulls" ON public.quality_late_card_pulls;
DROP POLICY IF EXISTS "Auth read quality_late_card_pulls" ON public.quality_late_card_pulls;
DROP POLICY IF EXISTS "Auth update quality_late_card_pulls" ON public.quality_late_card_pulls;

-- Alter table structure
ALTER TABLE public.quality_late_card_pulls DROP CONSTRAINT IF EXISTS quality_late_card_pulls_wo_id_fkey;
ALTER TABLE public.quality_late_card_pulls DROP COLUMN IF EXISTS wo_id;
ALTER TABLE public.quality_late_card_pulls ADD COLUMN IF NOT EXISTS part_number TEXT;

-- Recreate RLS policies
CREATE POLICY "Auth delete quality_late_card_pulls" ON public.quality_late_card_pulls
  FOR DELETE TO authenticated USING (true);

CREATE POLICY "Auth insert quality_late_card_pulls" ON public.quality_late_card_pulls
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Auth read quality_late_card_pulls" ON public.quality_late_card_pulls
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Auth update quality_late_card_pulls" ON public.quality_late_card_pulls
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Provide a default part number for existing mock data if any
UPDATE public.quality_late_card_pulls SET part_number = 'PN-1001' WHERE part_number IS NULL;
