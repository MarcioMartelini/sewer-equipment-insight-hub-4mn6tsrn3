DO $$
DECLARE
  v_wo_id uuid;
  v_user_id uuid;
  v_task_id uuid;
BEGIN
  -- We just need to find one WO and one user to attach dummy data to
  SELECT id INTO v_wo_id FROM public.work_orders LIMIT 1;
  SELECT id INTO v_user_id FROM public.users LIMIT 1;

  IF v_wo_id IS NOT NULL AND v_user_id IS NOT NULL THEN
    -- Seed Task 1
    v_task_id := gen_random_uuid();
    INSERT INTO public.purchasing_tasks (
      id, wo_id, component_name, supplier, quantity, unit_price, total_price,
      start_date, finish_date, status, assigned_to, comments, is_completed, completion_date
    ) VALUES (
      v_task_id, v_wo_id, 'Hydraulic Pump Assembly', 'Parker Hannifin', 2, 1250.00, 2500.00,
      CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE + INTERVAL '5 days', 'on_track', v_user_id, 'Standard order, no rush needed.', false, null
    ) ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.purchasing_task_comments_history (id, task_id, comment, author)
    VALUES (gen_random_uuid(), v_task_id, 'Supplier confirmed receipt of order.', v_user_id)
    ON CONFLICT DO NOTHING;

    -- Seed Task 2
    v_task_id := gen_random_uuid();
    INSERT INTO public.purchasing_tasks (
      id, wo_id, component_name, supplier, quantity, unit_price, total_price,
      start_date, finish_date, status, assigned_to, comments, is_completed, completion_date
    ) VALUES (
      v_task_id, v_wo_id, 'Debris Body Steel Plates', 'US Steel', 10, 450.00, 4500.00,
      CURRENT_DATE - INTERVAL '15 days', CURRENT_DATE - INTERVAL '2 days', 'delayed', v_user_id, 'Supplier facing material shortages.', false, null
    ) ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.purchasing_task_comments_history (id, task_id, comment, author)
    VALUES (gen_random_uuid(), v_task_id, 'Called supplier, delay of 3 more days expected.', v_user_id)
    ON CONFLICT DO NOTHING;

    -- Seed Task 3
    v_task_id := gen_random_uuid();
    INSERT INTO public.purchasing_tasks (
      id, wo_id, component_name, supplier, quantity, unit_price, total_price,
      start_date, finish_date, status, assigned_to, comments, is_completed, completion_date
    ) VALUES (
      v_task_id, v_wo_id, 'Control Panel Electronics', 'Siemens', 5, 800.00, 4000.00,
      CURRENT_DATE - INTERVAL '20 days', CURRENT_DATE - INTERVAL '10 days', 'complete', v_user_id, 'Parts received and inspected.', true, CURRENT_DATE - INTERVAL '12 days'
    ) ON CONFLICT (id) DO NOTHING;

    -- Seed Task 4
    v_task_id := gen_random_uuid();
    INSERT INTO public.purchasing_tasks (
      id, wo_id, component_name, supplier, quantity, unit_price, total_price,
      start_date, finish_date, status, assigned_to, comments, is_completed, completion_date
    ) VALUES (
      v_task_id, v_wo_id, 'Engine Cooling Fan', 'Cummins', 1, 350.00, 350.00,
      CURRENT_DATE, CURRENT_DATE + INTERVAL '2 days', 'at_risk', v_user_id, 'Short timeline for delivery.', false, null
    ) ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;
