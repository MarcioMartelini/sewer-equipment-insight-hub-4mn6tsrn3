DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'purchasing_task_status_enum') THEN
        CREATE TYPE purchasing_task_status_enum AS ENUM ('not_started', 'parked', 'on_track', 'at_risk', 'delayed', 'complete');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'expedite_status_enum') THEN
        CREATE TYPE expedite_status_enum AS ENUM ('pending', 'in_progress', 'completed');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'priority_enum') THEN
        CREATE TYPE priority_enum AS ENUM ('low', 'medium', 'high');
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.purchasing_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wo_id UUID NOT NULL REFERENCES public.work_orders(id) ON DELETE CASCADE,
    component_name TEXT NOT NULL,
    supplier TEXT,
    quantity NUMERIC,
    unit_price NUMERIC,
    total_price NUMERIC,
    start_date DATE,
    finish_date DATE,
    status purchasing_task_status_enum DEFAULT 'not_started',
    assigned_to UUID REFERENCES public.users(id) ON DELETE SET NULL,
    comments TEXT,
    is_completed BOOLEAN DEFAULT false,
    completion_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.purchasing_task_comments_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES public.purchasing_tasks(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    author UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.purchasing_task_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES public.purchasing_tasks(id) ON DELETE CASCADE,
    field_changed TEXT NOT NULL,
    old_value TEXT,
    new_value TEXT,
    changed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    changed_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.purchasing_expedites 
    ADD COLUMN IF NOT EXISTS task_id UUID REFERENCES public.purchasing_tasks(id) ON DELETE CASCADE,
    ADD COLUMN IF NOT EXISTS expedite_cost NUMERIC,
    ADD COLUMN IF NOT EXISTS priority priority_enum;

UPDATE public.purchasing_expedites 
SET status = 'pending' 
WHERE status NOT IN ('pending', 'in_progress', 'completed') OR status IS NULL;

DROP POLICY IF EXISTS "Auth delete purchasing_expedites" ON public.purchasing_expedites;
DROP POLICY IF EXISTS "Auth insert purchasing_expedites" ON public.purchasing_expedites;
DROP POLICY IF EXISTS "Auth read purchasing_expedites" ON public.purchasing_expedites;
DROP POLICY IF EXISTS "Auth update purchasing_expedites" ON public.purchasing_expedites;

ALTER TABLE public.purchasing_expedites ALTER COLUMN status DROP DEFAULT;
ALTER TABLE public.purchasing_expedites ALTER COLUMN status TYPE expedite_status_enum USING status::expedite_status_enum;
ALTER TABLE public.purchasing_expedites ALTER COLUMN status SET DEFAULT 'pending'::expedite_status_enum;

CREATE POLICY "Auth delete purchasing_expedites" ON public.purchasing_expedites FOR DELETE TO authenticated USING (true);
CREATE POLICY "Auth insert purchasing_expedites" ON public.purchasing_expedites FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth read purchasing_expedites" ON public.purchasing_expedites FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth update purchasing_expedites" ON public.purchasing_expedites FOR UPDATE TO authenticated USING (true);

ALTER TABLE public.purchasing_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchasing_task_comments_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchasing_task_audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Auth read purchasing_tasks" ON public.purchasing_tasks;
CREATE POLICY "Auth read purchasing_tasks" ON public.purchasing_tasks FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Auth insert purchasing_tasks" ON public.purchasing_tasks;
CREATE POLICY "Auth insert purchasing_tasks" ON public.purchasing_tasks FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Auth update purchasing_tasks" ON public.purchasing_tasks;
CREATE POLICY "Auth update purchasing_tasks" ON public.purchasing_tasks FOR UPDATE TO authenticated USING (true);
DROP POLICY IF EXISTS "Auth delete purchasing_tasks" ON public.purchasing_tasks;
CREATE POLICY "Auth delete purchasing_tasks" ON public.purchasing_tasks FOR DELETE TO authenticated USING (true);

DROP POLICY IF EXISTS "Auth read purchasing_task_comments_history" ON public.purchasing_task_comments_history;
CREATE POLICY "Auth read purchasing_task_comments_history" ON public.purchasing_task_comments_history FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Auth insert purchasing_task_comments_history" ON public.purchasing_task_comments_history;
CREATE POLICY "Auth insert purchasing_task_comments_history" ON public.purchasing_task_comments_history FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Auth update purchasing_task_comments_history" ON public.purchasing_task_comments_history;
CREATE POLICY "Auth update purchasing_task_comments_history" ON public.purchasing_task_comments_history FOR UPDATE TO authenticated USING (true);
DROP POLICY IF EXISTS "Auth delete purchasing_task_comments_history" ON public.purchasing_task_comments_history;
CREATE POLICY "Auth delete purchasing_task_comments_history" ON public.purchasing_task_comments_history FOR DELETE TO authenticated USING (true);

DROP POLICY IF EXISTS "Auth read purchasing_task_audit_log" ON public.purchasing_task_audit_log;
CREATE POLICY "Auth read purchasing_task_audit_log" ON public.purchasing_task_audit_log FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Auth insert purchasing_task_audit_log" ON public.purchasing_task_audit_log;
CREATE POLICY "Auth insert purchasing_task_audit_log" ON public.purchasing_task_audit_log FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Auth update purchasing_task_audit_log" ON public.purchasing_task_audit_log;
CREATE POLICY "Auth update purchasing_task_audit_log" ON public.purchasing_task_audit_log FOR UPDATE TO authenticated USING (true);
DROP POLICY IF EXISTS "Auth delete purchasing_task_audit_log" ON public.purchasing_task_audit_log;
CREATE POLICY "Auth delete purchasing_task_audit_log" ON public.purchasing_task_audit_log FOR DELETE TO authenticated USING (true);

CREATE OR REPLACE FUNCTION public.update_purchasing_task_updated_at()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_purchasing_task_updated_at ON public.purchasing_tasks;
CREATE TRIGGER on_purchasing_task_updated_at
    BEFORE UPDATE ON public.purchasing_tasks
    FOR EACH ROW EXECUTE FUNCTION public.update_purchasing_task_updated_at();

CREATE OR REPLACE FUNCTION public.log_purchasing_task_changes()
RETURNS trigger AS $$
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
                INSERT INTO public.purchasing_task_audit_log (task_id, changed_by, field_changed, old_value, new_value)
                VALUES (NEW.id, v_user_id, v_key, v_old_json->>v_key, v_new_json->>v_key);
            END IF;
        END IF;
    END LOOP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_purchasing_task_update ON public.purchasing_tasks;
CREATE TRIGGER on_purchasing_task_update
    AFTER UPDATE ON public.purchasing_tasks
    FOR EACH ROW EXECUTE FUNCTION public.log_purchasing_task_changes();
