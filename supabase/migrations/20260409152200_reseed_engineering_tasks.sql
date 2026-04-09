DO $$
DECLARE
  v_wo_id uuid;
  v_user_id uuid;
BEGIN
  -- Delete existing engineering tasks to clean up as requested by the user
  DELETE FROM public.wo_tasks WHERE department = 'Engineering' OR department = 'Engenharia';

  -- Get a work order id to attach new mock tasks to (so the dashboard is not completely empty)
  SELECT id INTO v_wo_id FROM public.work_orders LIMIT 1;
  
  -- Get an engineer user id
  SELECT id INTO v_user_id FROM auth.users LIMIT 1;

  -- Insert some fresh tasks so the user can verify the dashboard is working end-to-end
  IF v_wo_id IS NOT NULL THEN
    INSERT INTO public.wo_tasks (
      wo_id, department, task_name, status, is_completed, assigned_to, start_date, finish_date, was_delayed
    ) VALUES
    (v_wo_id, 'Engineering', 'Create 3D Layout', 'complete', true, v_user_id, CURRENT_DATE - INTERVAL '10 days', CURRENT_DATE - INTERVAL '5 days', false),
    (v_wo_id, 'Engineering', 'Generate BOM', 'on_track', false, v_user_id, CURRENT_DATE - INTERVAL '2 days', CURRENT_DATE + INTERVAL '5 days', false),
    (v_wo_id, 'Engineering', 'Prepare Traveler', 'delayed', false, v_user_id, CURRENT_DATE - INTERVAL '15 days', CURRENT_DATE - INTERVAL '1 day', true),
    (v_wo_id, 'Engineering', 'Review Accessories', 'at_risk', false, v_user_id, CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE + INTERVAL '1 day', false)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;
