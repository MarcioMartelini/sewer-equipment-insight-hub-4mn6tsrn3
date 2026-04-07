DO $$
DECLARE
  v_metric_def_1 uuid := '11111111-1111-1111-1111-111111111111'::uuid;
  v_metric_def_2 uuid := '22222222-2222-2222-2222-222222222222'::uuid;
  v_metric_def_3 uuid := '33333333-3333-3333-3333-333333333333'::uuid;
  v_rule_1 uuid := '44444444-4444-4444-4444-444444444444'::uuid;
  v_rule_2 uuid := '55555555-5555-5555-5555-555555555555'::uuid;
  
  v_wo_id uuid;
  v_user_id uuid;
BEGIN
  -- Get a user
  SELECT id INTO v_user_id FROM auth.users LIMIT 1;
  
  -- Get a work order
  SELECT id INTO v_wo_id FROM public.work_orders LIMIT 1;

  -- Create work order if it doesn't exist
  IF v_wo_id IS NULL THEN
    v_wo_id := gen_random_uuid();
    INSERT INTO public.work_orders (id, wo_number, customer_name, status, department)
    VALUES (v_wo_id, 'WO-9999', 'Customer Demo', 'Em andamento', 'Production')
    ON CONFLICT DO NOTHING;
  END IF;

  -- Insert Metrics Definitions
  INSERT INTO public.metrics_definitions (id, department, metric_name, metric_type, threshold_min, threshold_max, unit, description)
  VALUES 
    (v_metric_def_1, 'Production', 'Cycle Time', 'number', 10, 20, 'hours', 'Time to complete a unit'),
    (v_metric_def_2, 'Quality', 'Defect Rate', 'percentage', 0, 5, '%', 'Percentage of defective units'),
    (v_metric_def_3, 'Sales', 'Conversion Rate', 'percentage', 20, 100, '%', 'Lead conversion rate')
  ON CONFLICT (id) DO NOTHING;

  -- Insert Metrics Tracking (using fixed UUIDs for idempotency)
  INSERT INTO public.metrics_tracking (id, wo_id, department, metric_name, metric_value, recorded_date)
  VALUES 
    ('88888888-8888-8888-8888-888888888881'::uuid, v_wo_id, 'Production', 'Cycle Time', 15, CURRENT_DATE - INTERVAL '6 days'),
    ('88888888-8888-8888-8888-888888888882'::uuid, v_wo_id, 'Production', 'Cycle Time', 16, CURRENT_DATE - INTERVAL '5 days'),
    ('88888888-8888-8888-8888-888888888883'::uuid, v_wo_id, 'Production', 'Cycle Time', 14, CURRENT_DATE - INTERVAL '4 days'),
    ('88888888-8888-8888-8888-888888888884'::uuid, v_wo_id, 'Production', 'Cycle Time', 19, CURRENT_DATE - INTERVAL '3 days'),
    ('88888888-8888-8888-8888-888888888885'::uuid, v_wo_id, 'Production', 'Cycle Time', 22, CURRENT_DATE - INTERVAL '2 days'),
    ('88888888-8888-8888-8888-888888888886'::uuid, v_wo_id, 'Production', 'Cycle Time', 21, CURRENT_DATE - INTERVAL '1 days'),
    ('88888888-8888-8888-8888-888888888887'::uuid, v_wo_id, 'Production', 'Cycle Time', 18, CURRENT_DATE),
    
    ('88888888-8888-8888-8888-888888888888'::uuid, v_wo_id, 'Quality', 'Defect Rate', 2, CURRENT_DATE - INTERVAL '6 days'),
    ('88888888-8888-8888-8888-888888888889'::uuid, v_wo_id, 'Quality', 'Defect Rate', 3, CURRENT_DATE - INTERVAL '4 days'),
    ('88888888-8888-8888-8888-88888888888a'::uuid, v_wo_id, 'Quality', 'Defect Rate', 6, CURRENT_DATE - INTERVAL '1 days'),
    
    ('88888888-8888-8888-8888-88888888888b'::uuid, v_wo_id, 'Sales', 'Conversion Rate', 25, CURRENT_DATE - INTERVAL '5 days'),
    ('88888888-8888-8888-8888-88888888888c'::uuid, v_wo_id, 'Sales', 'Conversion Rate', 22, CURRENT_DATE - INTERVAL '2 days')
  ON CONFLICT (id) DO NOTHING;

  -- Insert Alert Rules
  INSERT INTO public.alert_rules (id, metric_id, alert_condition, assigned_users, alert_enabled)
  VALUES 
    (v_rule_1, v_metric_def_1, 'above_max', NULL, true),
    (v_rule_2, v_metric_def_2, 'above_max', NULL, true)
  ON CONFLICT (id) DO NOTHING;

  -- Insert Alerts Log
  INSERT INTO public.alerts_log (id, alert_rule_id, wo_id, metric_value, alert_message, alert_status, assigned_to)
  VALUES 
    ('66666666-6666-6666-6666-666666666666'::uuid, v_rule_1, v_wo_id, 22, 'Cycle Time exceeded maximum threshold (20)', 'pending', v_user_id),
    ('77777777-7777-7777-7777-777777777777'::uuid, v_rule_2, v_wo_id, 6, 'Defect Rate exceeded maximum threshold (5)', 'pending', v_user_id)
  ON CONFLICT (id) DO NOTHING;

END $$;
