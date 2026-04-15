DO $$
BEGIN
  -- Adiciona a coluna division na tabela salespersons
  ALTER TABLE public.salespersons ADD COLUMN IF NOT EXISTS division TEXT;

  -- Cria uma sequence para o auto incremento do salesperson_id
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'salespersons_id_seq') THEN
    CREATE SEQUENCE public.salespersons_id_seq START 10000;
  END IF;

  -- Define o valor padrão para usar a sequence
  ALTER TABLE public.salespersons ALTER COLUMN salesperson_id SET DEFAULT 'SP-' || nextval('public.salespersons_id_seq')::text;
END $$;
