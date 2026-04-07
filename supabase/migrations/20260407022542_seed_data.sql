DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Seed user
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'marcio_martelini@hotmail.com') THEN
    new_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      new_user_id,
      '00000000-0000-0000-0000-000000000000',
      'marcio_martelini@hotmail.com',
      crypt('Skip@Pass', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Marcio Martelini"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );

    INSERT INTO public.users (id, email, full_name, department, role)
    VALUES (new_user_id, 'marcio_martelini@hotmail.com', 'Marcio Martelini', 'High Management', 'admin')
    ON CONFLICT (id) DO NOTHING;
  END IF;

  -- Departments
  INSERT INTO public.departments (name) VALUES 
    ('Sales'), ('Engineering'), ('Purchasing'), ('Production'), 
    ('Quality'), ('Delivery'), ('Warranty'), ('High Management')
  ON CONFLICT (name) DO NOTHING;

  -- Insert some test work orders
  INSERT INTO public.work_orders (wo_number, customer_name, product_type, status, department, due_date, progress)
  VALUES 
    ('WO-1001', 'Acme Corp', 'Widget A', 'On track', 'Production', CURRENT_DATE + INTERVAL '5 days', 45),
    ('WO-1002', 'Globex', 'Widget B', 'Delayed', 'Engineering', CURRENT_DATE - INTERVAL '2 days', 20),
    ('WO-1003', 'Soylent', 'Widget C', 'Not started', 'Sales', CURRENT_DATE + INTERVAL '15 days', 0),
    ('WO-1004', 'Initech', 'Widget A', 'Complete', 'Delivery', CURRENT_DATE - INTERVAL '1 days', 100),
    ('WO-1005', 'Umbrella', 'Widget B', 'At risk', 'Purchasing', CURRENT_DATE + INTERVAL '1 days', 60),
    ('WO-1006', 'Stark Ind.', 'Widget C', 'Parked', 'Quality', CURRENT_DATE + INTERVAL '10 days', 80)
  ON CONFLICT (wo_number) DO NOTHING;
END $$;
