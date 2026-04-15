CREATE TABLE IF NOT EXISTS public.quote_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_id UUID REFERENCES public.quotes(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL DEFAULT 1,
    quote_data JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL
);

-- Drop policies if exists
DROP POLICY IF EXISTS "Auth read quote_versions" ON public.quote_versions;
DROP POLICY IF EXISTS "Auth insert quote_versions" ON public.quote_versions;

-- Enable RLS
ALTER TABLE public.quote_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Auth read quote_versions" ON public.quote_versions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth insert quote_versions" ON public.quote_versions FOR INSERT TO authenticated WITH CHECK (true);

-- Function to save quote version
CREATE OR REPLACE FUNCTION public.save_quote_version()
RETURNS trigger AS $function$
DECLARE
    v_version_number INT;
BEGIN
    SELECT COALESCE(MAX(version_number), 0) + 1 INTO v_version_number
    FROM public.quote_versions
    WHERE quote_id = NEW.id;

    INSERT INTO public.quote_versions (quote_id, version_number, quote_data, created_by)
    VALUES (NEW.id, v_version_number, to_jsonb(NEW), auth.uid());
    
    RETURN NEW;
END;
$function$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for INSERT
DROP TRIGGER IF EXISTS on_quote_insert_version ON public.quotes;
CREATE TRIGGER on_quote_insert_version
    AFTER INSERT ON public.quotes
    FOR EACH ROW
    EXECUTE FUNCTION public.save_quote_version();

-- Trigger for UPDATE
DROP TRIGGER IF EXISTS on_quote_update_version ON public.quotes;
CREATE TRIGGER on_quote_update_version
    AFTER UPDATE ON public.quotes
    FOR EACH ROW
    WHEN (OLD.* IS DISTINCT FROM NEW.*)
    EXECUTE FUNCTION public.save_quote_version();

-- Seed initial versions for existing quotes
DO $DO$
DECLARE
    q RECORD;
BEGIN
    FOR q IN SELECT * FROM public.quotes LOOP
        IF NOT EXISTS (SELECT 1 FROM public.quote_versions WHERE quote_id = q.id) THEN
            INSERT INTO public.quote_versions (quote_id, version_number, quote_data, created_by)
            VALUES (q.id, 1, to_jsonb(q), q.created_by);
        END IF;
    END LOOP;
END $DO$;
