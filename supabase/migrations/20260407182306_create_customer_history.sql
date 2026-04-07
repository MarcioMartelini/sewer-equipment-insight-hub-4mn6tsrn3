CREATE TABLE IF NOT EXISTS public.customer_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    field_changed TEXT NOT NULL,
    old_value TEXT,
    new_value TEXT,
    action TEXT,
    notes TEXT,
    changed_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.customer_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Auth insert customer_history" ON public.customer_history;
CREATE POLICY "Auth insert customer_history" ON public.customer_history
    FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Auth read customer_history" ON public.customer_history;
CREATE POLICY "Auth read customer_history" ON public.customer_history
    FOR SELECT TO authenticated USING (true);

CREATE OR REPLACE FUNCTION public.log_customer_changes()
RETURNS trigger AS $function$
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
                INSERT INTO public.customer_history (customer_id, user_id, field_changed, old_value, new_value)
                VALUES (NEW.id, v_user_id, v_key, v_old_json->>v_key, v_new_json->>v_key);
            END IF;
        END IF;
    END LOOP;
    
    RETURN NEW;
END;
$function$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_customer_update ON public.customers;
CREATE TRIGGER on_customer_update
    AFTER UPDATE ON public.customers
    FOR EACH ROW EXECUTE FUNCTION public.log_customer_changes();
