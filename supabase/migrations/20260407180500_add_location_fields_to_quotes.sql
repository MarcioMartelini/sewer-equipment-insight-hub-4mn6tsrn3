ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS customer_city TEXT;
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS customer_state TEXT;
