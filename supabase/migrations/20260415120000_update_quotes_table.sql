DO $$
BEGIN
  ALTER TABLE public.quotes 
    ADD COLUMN IF NOT EXISTS division TEXT,
    ADD COLUMN IF NOT EXISTS customer_email TEXT,
    ADD COLUMN IF NOT EXISTS customer_phone TEXT,
    ADD COLUMN IF NOT EXISTS customer_contact TEXT,
    ADD COLUMN IF NOT EXISTS customer_address TEXT,
    ADD COLUMN IF NOT EXISTS customer_country TEXT;
END $$;

UPDATE public.quotes 
SET division = product_family,
    product_family = NULL
WHERE product_family IN ('Plumbing', 'Municipal', 'Industrial');
