DO $$
DECLARE
  v_gross_rev_id uuid := gen_random_uuid();
  v_avg_profit_id uuid := gen_random_uuid();
  v_conv_rate_id uuid := gen_random_uuid();
  v_sales_cycle_id uuid := gen_random_uuid();
  v_clv_id uuid := gen_random_uuid();
  v_avg_purchase_id uuid := gen_random_uuid();
  v_num_purchases_id uuid := gen_random_uuid();
  i int;
  curr_date date;
BEGIN
  -- Delete old Sales metrics
  DELETE FROM public.metrics_definitions WHERE department = 'Sales';
  DELETE FROM public.metrics_tracking WHERE department = 'Sales';

  -- Insert Definitions
  INSERT INTO public.metrics_definitions (id, department, metric_name, metric_type, unit, description) VALUES
  (v_gross_rev_id, 'Sales', 'Gross Revenue', 'financial', '$', 'Total gross revenue generated'),
  (v_avg_profit_id, 'Sales', 'Average Profit Margin', 'percentage', '%', 'Average profit margin across all sales'),
  (v_conv_rate_id, 'Sales', 'Sales conversion rate', 'percentage', '%', 'Quote to order conversion rate'),
  (v_sales_cycle_id, 'Sales', 'Average sales cycle', 'time', 'days', 'Average days to close a sale'),
  (v_clv_id, 'Sales', 'Customer lifetime value', 'financial', '$', 'Average revenue per customer'),
  (v_avg_purchase_id, 'Sales', 'Average Purchase Value', 'financial', '$', 'Average value per work order'),
  (v_num_purchases_id, 'Sales', 'Number of purchases', 'count', 'units', 'Total number of work orders generated');

  -- Insert Trackings for last 90 days
  FOR i IN 0..90 LOOP
    curr_date := CURRENT_DATE - i;
    
    INSERT INTO public.metrics_tracking (department, metric_name, metric_value, recorded_date) VALUES 
    ('Sales', 'Gross Revenue', 400000 + (random() * 200000), curr_date),
    ('Sales', 'Average Profit Margin', 15 + (random() * 10), curr_date),
    ('Sales', 'Sales conversion rate', 20 + (random() * 15), curr_date),
    ('Sales', 'Average sales cycle', 30 + (random() * 10), curr_date),
    ('Sales', 'Customer lifetime value', 150000 + (random() * 50000), curr_date),
    ('Sales', 'Average Purchase Value', 25000 + (random() * 5000), curr_date),
    ('Sales', 'Number of purchases', floor(2 + (random() * 5)), curr_date);
  END LOOP;
END $$;
