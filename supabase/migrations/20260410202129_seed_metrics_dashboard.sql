DO $BODY$
DECLARE
  v_sales_1_id uuid := gen_random_uuid();
  v_sales_2_id uuid := gen_random_uuid();
  v_prod_1_id uuid := gen_random_uuid();
  v_prod_2_id uuid := gen_random_uuid();
  v_hr_1_id uuid := gen_random_uuid();
  v_hr_2_id uuid := gen_random_uuid();
  v_qual_1_id uuid := gen_random_uuid();
  v_qual_2_id uuid := gen_random_uuid();
  
  i int;
  curr_date date;
  val numeric;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.metrics_definitions LIMIT 1) THEN
    
    -- Insert Definitions
    INSERT INTO public.metrics_definitions (id, department, metric_name, metric_type, threshold_min, threshold_max, unit, description) VALUES
    (v_sales_1_id, 'Sales', 'Monthly Revenue', 'financial', 500000, NULL, '$', 'Total revenue generated in the month'),
    (v_sales_2_id, 'Sales', 'Conversion Rate', 'percentage', 20, 100, '%', 'Quote to order conversion rate'),
    
    (v_prod_1_id, 'Production', 'Cycle Time', 'time', NULL, 15, 'days', 'Average time to complete a work order'),
    (v_prod_2_id, 'Production', 'Throughput', 'count', 10, NULL, 'units/week', 'Number of units produced per week'),
    
    (v_hr_1_id, 'HR', 'Employee Satisfaction', 'score', 8, 10, '/ 10', 'Monthly employee satisfaction survey score'),
    (v_hr_2_id, 'HR', 'Absenteeism Rate', 'percentage', NULL, 5, '%', 'Percentage of scheduled work days lost to absence'),
    
    (v_qual_1_id, 'Quality', 'Defect Rate', 'percentage', NULL, 2, '%', 'Percentage of products with defects'),
    (v_qual_2_id, 'Quality', 'First Pass Yield', 'percentage', 95, 100, '%', 'Percentage of products passing quality on first attempt');

    -- Insert Trackings for last 90 days to cover all filter periods
    FOR i IN 0..90 LOOP
      curr_date := CURRENT_DATE - i;
      
      -- Sales 1: Revenue (Random between 400k and 600k)
      val := 400000 + (random() * 200000);
      INSERT INTO public.metrics_tracking (department, metric_name, metric_value, recorded_date) VALUES ('Sales', 'Monthly Revenue', val, curr_date);
      
      -- Sales 2: Conversion (Random 15 to 35)
      val := 15 + (random() * 20);
      INSERT INTO public.metrics_tracking (department, metric_name, metric_value, recorded_date) VALUES ('Sales', 'Conversion Rate', val, curr_date);
      
      -- Prod 1: Cycle Time (10 to 18)
      val := 10 + (random() * 8);
      INSERT INTO public.metrics_tracking (department, metric_name, metric_value, recorded_date) VALUES ('Production', 'Cycle Time', val, curr_date);
      
      -- Prod 2: Throughput (8 to 15)
      val := 8 + (random() * 7);
      INSERT INTO public.metrics_tracking (department, metric_name, metric_value, recorded_date) VALUES ('Production', 'Throughput', val, curr_date);
      
      -- HR 1: Satisfaction (7 to 9.5)
      val := 7 + (random() * 2.5);
      INSERT INTO public.metrics_tracking (department, metric_name, metric_value, recorded_date) VALUES ('HR', 'Employee Satisfaction', val, curr_date);
      
      -- HR 2: Absenteeism (1 to 6)
      val := 1 + (random() * 5);
      INSERT INTO public.metrics_tracking (department, metric_name, metric_value, recorded_date) VALUES ('HR', 'Absenteeism Rate', val, curr_date);
      
      -- Quality 1: Defect Rate (0.5 to 3)
      val := 0.5 + (random() * 2.5);
      INSERT INTO public.metrics_tracking (department, metric_name, metric_value, recorded_date) VALUES ('Quality', 'Defect Rate', val, curr_date);
      
      -- Quality 2: FPY (90 to 99)
      val := 90 + (random() * 9);
      INSERT INTO public.metrics_tracking (department, metric_name, metric_value, recorded_date) VALUES ('Quality', 'First Pass Yield', val, curr_date);
      
    END LOOP;
  END IF;
END $BODY$;
