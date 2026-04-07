CREATE TABLE IF NOT EXISTS public.metrics_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department TEXT,
  metric_name TEXT NOT NULL,
  metric_type TEXT,
  threshold_min NUMERIC,
  threshold_max NUMERIC,
  unit TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.metrics_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wo_id UUID REFERENCES public.work_orders(id) ON DELETE CASCADE,
  department TEXT,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC,
  recorded_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.alert_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_id UUID REFERENCES public.metrics_definitions(id) ON DELETE CASCADE,
  alert_condition TEXT CHECK (alert_condition IN ('below_min', 'above_max', 'both')),
  assigned_users UUID[],
  alert_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.alerts_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_rule_id UUID REFERENCES public.alert_rules(id) ON DELETE CASCADE,
  wo_id UUID REFERENCES public.work_orders(id) ON DELETE CASCADE,
  metric_value NUMERIC,
  alert_message TEXT,
  alert_status TEXT CHECK (alert_status IN ('pending', 'acknowledged', 'resolved')) DEFAULT 'pending',
  assigned_to UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

ALTER TABLE public.metrics_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metrics_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alert_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Auth read metrics_definitions" ON public.metrics_definitions;
CREATE POLICY "Auth read metrics_definitions" ON public.metrics_definitions FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Auth insert metrics_definitions" ON public.metrics_definitions;
CREATE POLICY "Auth insert metrics_definitions" ON public.metrics_definitions FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Auth update metrics_definitions" ON public.metrics_definitions;
CREATE POLICY "Auth update metrics_definitions" ON public.metrics_definitions FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "Auth delete metrics_definitions" ON public.metrics_definitions;
CREATE POLICY "Auth delete metrics_definitions" ON public.metrics_definitions FOR DELETE TO authenticated USING (true);

DROP POLICY IF EXISTS "Auth read metrics_tracking" ON public.metrics_tracking;
CREATE POLICY "Auth read metrics_tracking" ON public.metrics_tracking FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Auth insert metrics_tracking" ON public.metrics_tracking;
CREATE POLICY "Auth insert metrics_tracking" ON public.metrics_tracking FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Auth update metrics_tracking" ON public.metrics_tracking;
CREATE POLICY "Auth update metrics_tracking" ON public.metrics_tracking FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "Auth delete metrics_tracking" ON public.metrics_tracking;
CREATE POLICY "Auth delete metrics_tracking" ON public.metrics_tracking FOR DELETE TO authenticated USING (true);

DROP POLICY IF EXISTS "Auth read alert_rules" ON public.alert_rules;
CREATE POLICY "Auth read alert_rules" ON public.alert_rules FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Auth insert alert_rules" ON public.alert_rules;
CREATE POLICY "Auth insert alert_rules" ON public.alert_rules FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Auth update alert_rules" ON public.alert_rules;
CREATE POLICY "Auth update alert_rules" ON public.alert_rules FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "Auth delete alert_rules" ON public.alert_rules;
CREATE POLICY "Auth delete alert_rules" ON public.alert_rules FOR DELETE TO authenticated USING (true);

DROP POLICY IF EXISTS "Auth read alerts_log" ON public.alerts_log;
CREATE POLICY "Auth read alerts_log" ON public.alerts_log FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Auth insert alerts_log" ON public.alerts_log;
CREATE POLICY "Auth insert alerts_log" ON public.alerts_log FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Auth update alerts_log" ON public.alerts_log;
CREATE POLICY "Auth update alerts_log" ON public.alerts_log FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "Auth delete alerts_log" ON public.alerts_log;
CREATE POLICY "Auth delete alerts_log" ON public.alerts_log FOR DELETE TO authenticated USING (true);
