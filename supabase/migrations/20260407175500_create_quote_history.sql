CREATE TABLE IF NOT EXISTS public.quote_history (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_id uuid REFERENCES public.quotes(id) ON DELETE CASCADE,
    user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
    changed_at timestamptz DEFAULT now(),
    field_changed text NOT NULL,
    old_value text,
    new_value text
);

DROP POLICY IF EXISTS "Auth read quote_history" ON public.quote_history;
CREATE POLICY "Auth read quote_history" ON public.quote_history
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Auth insert quote_history" ON public.quote_history;
CREATE POLICY "Auth insert quote_history" ON public.quote_history
    FOR INSERT TO authenticated WITH CHECK (true);

ALTER TABLE public.quote_history ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.log_quote_changes()
RETURNS trigger AS $$
DECLARE
    v_old_json jsonb := to_jsonb(OLD);
    v_new_json jsonb := to_jsonb(NEW);
    v_key text;
    v_user_id uuid;
BEGIN
    v_user_id := auth.uid();
    
    FOR v_key IN SELECT * FROM jsonb_object_keys(v_new_json)
    LOOP
        IF v_key NOT IN ('updated_at', 'created_at', 'id') THEN
            IF v_old_json->>v_key IS DISTINCT FROM v_new_json->>v_key THEN
                INSERT INTO public.quote_history (quote_id, user_id, field_changed, old_value, new_value)
                VALUES (NEW.id, v_user_id, v_key, v_old_json->>v_key, v_new_json->>v_key);
            END IF;
        END IF;
    END LOOP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_quote_update ON public.quotes;
CREATE TRIGGER on_quote_update
AFTER UPDATE ON public.quotes
FOR EACH ROW EXECUTE FUNCTION public.log_quote_changes();
