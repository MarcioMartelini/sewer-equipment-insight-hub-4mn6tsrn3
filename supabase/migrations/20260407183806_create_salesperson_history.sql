CREATE TABLE IF NOT EXISTS public.salesperson_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    salesperson_id UUID REFERENCES public.salespersons(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    field_changed TEXT NOT NULL,
    old_value TEXT,
    new_value TEXT,
    action TEXT,
    notes TEXT,
    changed_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.salesperson_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Auth read salesperson_history" ON public.salesperson_history;
CREATE POLICY "Auth read salesperson_history" ON public.salesperson_history
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Auth insert salesperson_history" ON public.salesperson_history;
CREATE POLICY "Auth insert salesperson_history" ON public.salesperson_history
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.log_salesperson_changes()
RETURNS TRIGGER AS $$
DECLARE
    v_old_json JSONB := to_jsonb(OLD);
    v_new_json JSONB := to_jsonb(NEW);
    v_key TEXT;
    v_user_id UUID;
BEGIN
    v_user_id := auth.uid();
    
    FOR v_key IN SELECT * FROM jsonb_object_keys(v_new_json)
    LOOP
        IF v_key NOT IN ('updated_at', 'created_at', 'id') THEN
            IF v_old_json->>v_key IS DISTINCT FROM v_new_json->>v_key THEN
                INSERT INTO public.salesperson_history (salesperson_id, user_id, field_changed, old_value, new_value, action)
                VALUES (NEW.id, v_user_id, v_key, v_old_json->>v_key, v_new_json->>v_key, 'update');
            END IF;
        END IF;
    END LOOP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_salesperson_update ON public.salespersons;
CREATE TRIGGER on_salesperson_update
    AFTER UPDATE ON public.salespersons
    FOR EACH ROW
    EXECUTE FUNCTION public.log_salesperson_changes();
