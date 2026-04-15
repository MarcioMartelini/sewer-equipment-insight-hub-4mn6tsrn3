-- Add salesperson_id to customers
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS salesperson_id UUID;

-- Safely add foreign key
DO $DO$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'customers_salesperson_id_fkey'
  ) THEN
    ALTER TABLE public.customers
      ADD CONSTRAINT customers_salesperson_id_fkey
      FOREIGN KEY (salesperson_id) REFERENCES public.salespersons(id) ON DELETE SET NULL;
  END IF;
END $DO$;

-- Create sequence for customer_id if not exists
CREATE SEQUENCE IF NOT EXISTS customers_id_seq START 1000;

-- Change default of customer_id to use the sequence
ALTER TABLE public.customers ALTER COLUMN customer_id SET DEFAULT ('CUST-' || nextval('customers_id_seq'::regclass)::text);
