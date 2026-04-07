DO $$
BEGIN
  INSERT INTO public.departments (name, description) 
  VALUES ('High Management', 'Departamento de Alta Gestão')
  ON CONFLICT (name) DO NOTHING;
END $$;
