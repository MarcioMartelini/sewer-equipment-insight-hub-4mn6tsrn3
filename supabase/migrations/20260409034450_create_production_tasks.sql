DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'production_task_status_enum') THEN
    CREATE TYPE public.production_task_status_enum AS ENUM ('not_started', 'parked', 'on_track', 'at_risk', 'delayed', 'complete');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.production_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wo_id UUID NOT NULL REFERENCES public.work_orders(id) ON DELETE CASCADE,
  department TEXT,
  sub_department TEXT,
  task_name TEXT NOT NULL,
  start_date DATE,
  finish_date DATE,
  status public.production_task_status_enum DEFAULT 'not_started',
  assigned_to UUID REFERENCES public.users(id) ON DELETE SET NULL,
  comments TEXT,
  is_completed BOOLEAN DEFAULT false,
  completion_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.production_task_comments_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.production_tasks(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  author_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  status public.production_task_status_enum,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.production_task_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.production_tasks(id) ON DELETE CASCADE,
  field_changed TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  changed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  changed_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE public.production_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_task_comments_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_task_audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Auth read production_tasks" ON public.production_tasks;
CREATE POLICY "Auth read production_tasks" ON public.production_tasks FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Auth insert production_tasks" ON public.production_tasks;
CREATE POLICY "Auth insert production_tasks" ON public.production_tasks FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Auth update production_tasks" ON public.production_tasks;
CREATE POLICY "Auth update production_tasks" ON public.production_tasks FOR UPDATE TO authenticated USING (true);
DROP POLICY IF EXISTS "Auth delete production_tasks" ON public.production_tasks;
CREATE POLICY "Auth delete production_tasks" ON public.production_tasks FOR DELETE TO authenticated USING (true);

DROP POLICY IF EXISTS "Auth read production_task_comments_history" ON public.production_task_comments_history;
CREATE POLICY "Auth read production_task_comments_history" ON public.production_task_comments_history FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Auth insert production_task_comments_history" ON public.production_task_comments_history;
CREATE POLICY "Auth insert production_task_comments_history" ON public.production_task_comments_history FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Auth update production_task_comments_history" ON public.production_task_comments_history;
CREATE POLICY "Auth update production_task_comments_history" ON public.production_task_comments_history FOR UPDATE TO authenticated USING (true);
DROP POLICY IF EXISTS "Auth delete production_task_comments_history" ON public.production_task_comments_history;
CREATE POLICY "Auth delete production_task_comments_history" ON public.production_task_comments_history FOR DELETE TO authenticated USING (true);

DROP POLICY IF EXISTS "Auth read production_task_audit_log" ON public.production_task_audit_log;
CREATE POLICY "Auth read production_task_audit_log" ON public.production_task_audit_log FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Auth insert production_task_audit_log" ON public.production_task_audit_log;
CREATE POLICY "Auth insert production_task_audit_log" ON public.production_task_audit_log FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Auth update production_task_audit_log" ON public.production_task_audit_log;
CREATE POLICY "Auth update production_task_audit_log" ON public.production_task_audit_log FOR UPDATE TO authenticated USING (true);
DROP POLICY IF EXISTS "Auth delete production_task_audit_log" ON public.production_task_audit_log;
CREATE POLICY "Auth delete production_task_audit_log" ON public.production_task_audit_log FOR DELETE TO authenticated USING (true);

CREATE OR REPLACE FUNCTION public.log_production_task_changes()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
                INSERT INTO public.production_task_audit_log (task_id, changed_by, field_changed, old_value, new_value)
                VALUES (NEW.id, v_user_id, v_key, v_old_json->>v_key, v_new_json->>v_key);
            END IF;
        END IF;
    END LOOP;
    
    RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS on_production_task_update ON public.production_tasks;
CREATE TRIGGER on_production_task_update
  AFTER UPDATE ON public.production_tasks
  FOR EACH ROW EXECUTE FUNCTION public.log_production_task_changes();

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_production_task_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS on_production_task_updated_at ON public.production_tasks;
CREATE TRIGGER on_production_task_updated_at
  BEFORE UPDATE ON public.production_tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_production_task_updated_at();

-- Seed data for testing
DO $$
DECLARE
  v_wo_id UUID;
BEGIN
  SELECT id INTO v_wo_id FROM public.work_orders LIMIT 1;
  
  IF v_wo_id IS NOT NULL THEN
    INSERT INTO public.production_tasks (wo_id, department, sub_department, task_name, status)
    VALUES
      (v_wo_id, 'Production', 'Weld Shop', 'Weld main chassis', 'not_started'),
      (v_wo_id, 'Production', 'Paint', 'Prime paint chassis', 'parked'),
      (v_wo_id, 'Production', 'Sub Assembly', 'Assemble engine', 'on_track')
    ON CONFLICT DO NOTHING;
  END IF;
END $$;
