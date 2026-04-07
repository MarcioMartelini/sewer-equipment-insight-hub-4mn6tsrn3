DO $$
DECLARE
  v_wo_id_1 uuid;
  v_wo_id_2 uuid;
BEGIN
  -- We need to ensure there are work orders
  IF NOT EXISTS (SELECT 1 FROM work_orders WHERE wo_number = 'WO-1001') THEN
    INSERT INTO work_orders (wo_number, customer_name, status) VALUES ('WO-1001', 'Test Customer 1', 'Em andamento') RETURNING id INTO v_wo_id_1;
  ELSE
    SELECT id INTO v_wo_id_1 FROM work_orders WHERE wo_number = 'WO-1001';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM work_orders WHERE wo_number = 'WO-1002') THEN
    INSERT INTO work_orders (wo_number, customer_name, status) VALUES ('WO-1002', 'Test Customer 2', 'Em andamento') RETURNING id INTO v_wo_id_2;
  ELSE
    SELECT id INTO v_wo_id_2 FROM work_orders WHERE wo_number = 'WO-1002';
  END IF;

  -- Seed purchasing components
  IF NOT EXISTS (SELECT 1 FROM purchasing_components WHERE component_name = 'Test Engine A') THEN
    INSERT INTO purchasing_components (wo_id, component_type, component_name, status, order_date, expected_delivery_date)
    VALUES (v_wo_id_1, 'Engine', 'Test Engine A', 'on track', '2025-01-10', '2025-02-15');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM purchasing_components WHERE component_name = 'Test Hydraulics B') THEN
    INSERT INTO purchasing_components (wo_id, component_type, component_name, status, order_date, expected_delivery_date)
    VALUES (v_wo_id_2, 'Hydraulics', 'Test Hydraulics B', 'at risk', '2025-01-12', '2025-01-30');
  END IF;

  -- Seed purchasing expedites
  IF NOT EXISTS (SELECT 1 FROM purchasing_expedites WHERE expedite_reason = 'Critical production delay') THEN
    INSERT INTO purchasing_expedites (wo_id, component_type, expedite_reason, expedite_date, status)
    VALUES (v_wo_id_2, 'Hydraulics', 'Critical production delay', '2025-01-20', 'delayed');
  END IF;
END $$;
