DO $$
DECLARE
  v_wo_id uuid := gen_random_uuid();
BEGIN
  -- Insert a dummy Work Order to attach engineering tasks to
  IF NOT EXISTS (SELECT 1 FROM public.work_orders WHERE wo_number = 'WO-ENG-001') THEN
    INSERT INTO public.work_orders (id, wo_number, customer_name, status, department, created_by)
    VALUES (v_wo_id, 'WO-ENG-001', 'Tech Innovations Inc', 'Em andamento', 'Engineering', NULL);

    -- Seed Layouts
    INSERT INTO public.engineering_layouts (wo_id, layout_name, status)
    VALUES (v_wo_id, 'Main Floor Assembly Layout', 'on track');

    -- Seed BOMs
    INSERT INTO public.engineering_boms (wo_id, bom_name, status)
    VALUES (v_wo_id, 'Electrical Components BOM v2', 'not started');

    -- Seed Travelers
    INSERT INTO public.engineering_travelers (wo_id, traveler_name, status)
    VALUES (v_wo_id, 'Welding Station Traveler', 'parked');

    -- Seed Accessories
    INSERT INTO public.engineering_accessories (wo_id, accessories_list_name, status)
    VALUES (v_wo_id, 'Mounting Brackets Kit', 'complete');
  END IF;

  -- Add a second WO to demonstrate filtering
  v_wo_id := gen_random_uuid();
  IF NOT EXISTS (SELECT 1 FROM public.work_orders WHERE wo_number = 'WO-ENG-002') THEN
    INSERT INTO public.work_orders (id, wo_number, customer_name, status, department, created_by)
    VALUES (v_wo_id, 'WO-ENG-002', 'Global Manufacturing', 'Não iniciado', 'Engineering', NULL);

    INSERT INTO public.engineering_layouts (wo_id, layout_name, status)
    VALUES (v_wo_id, 'HVAC System Layout', 'delayed');
    
    INSERT INTO public.engineering_boms (wo_id, bom_name, status)
    VALUES (v_wo_id, 'Piping BOM Initial', 'at risk');
  END IF;
END $$;
