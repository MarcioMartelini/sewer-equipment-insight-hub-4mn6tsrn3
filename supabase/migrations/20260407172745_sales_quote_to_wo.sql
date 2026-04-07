DO $$
BEGIN
  -- Drop existing check constraint if exists
  ALTER TABLE public.quotes DROP CONSTRAINT IF EXISTS quotes_status_check;
  
  -- Add new constraint allowing 'converted'
  ALTER TABLE public.quotes ADD CONSTRAINT quotes_status_check 
  CHECK (status = ANY (ARRAY['draft', 'sent', 'approved', 'rejected', 'expired', 'converted']));

  -- Add columns to work_orders to match quotes payload
  ALTER TABLE public.work_orders ADD COLUMN IF NOT EXISTS machine_model text;
  ALTER TABLE public.work_orders ADD COLUMN IF NOT EXISTS price numeric;
  ALTER TABLE public.work_orders ADD COLUMN IF NOT EXISTS profit_margin numeric;
END $$;
