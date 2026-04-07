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
      '{"name": "Marcio Martelini", "department": "Sales"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );

    INSERT INTO public.users (id, email, full_name, department, role)
    VALUES (new_user_id, 'marcio_martelini@hotmail.com', 'Marcio Martelini', 'Sales', 'admin')
    ON CONFLICT (id) DO UPDATE SET department = 'Sales', role = 'admin';
  END IF;
END $$;

-- Seed Quotes
INSERT INTO public.quotes (id, quote_number, customer_name, product_type, quote_value, profit_margin_percentage, status, sent_date, expiration_date)
VALUES 
  ('11111111-1111-1111-1111-111111111111'::uuid, 'Q-1001', 'Acme Corp', 'Industrial Pump', 15000.00, 25.0, 'draft', NOW(), NOW() + INTERVAL '30 days'),
  ('22222222-2222-2222-2222-222222222222'::uuid, 'Q-1002', 'Globex', 'Conveyor Belt', 8500.00, 20.0, 'approved', NOW() - INTERVAL '5 days', NOW() + INTERVAL '25 days'),
  ('33333333-3333-3333-3333-333333333333'::uuid, 'Q-1003', 'Stark Industries', 'Generator', 42000.00, 30.0, 'sent', NOW() - INTERVAL '2 days', NOW() + INTERVAL '28 days')
ON CONFLICT (quote_number) DO NOTHING;

-- Seed Work Orders (linked to quotes)
INSERT INTO public.work_orders (id, wo_number, customer_name, product_type, status, department, due_date, progress, quote_id)
VALUES 
  ('44444444-4444-4444-4444-444444444444'::uuid, 'WO-90001', 'Globex', 'Conveyor Belt', 'On track', 'Production', CURRENT_DATE + INTERVAL '15 days', 35, '22222222-2222-2222-2222-222222222222'::uuid),
  ('55555555-5555-5555-5555-555555555555'::uuid, 'WO-90002', 'Wayne Enterprises', 'Turbine', 'Not started', 'Engineering', CURRENT_DATE + INTERVAL '10 days', 0, NULL),
  ('66666666-6666-6666-6666-666666666666'::uuid, 'WO-90003', 'Cyberdyne', 'Motor', 'Delayed', 'Delivery', CURRENT_DATE - INTERVAL '2 days', 90, NULL)
ON CONFLICT (wo_number) DO NOTHING;
