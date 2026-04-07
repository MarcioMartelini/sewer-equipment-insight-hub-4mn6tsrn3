-- Create quotes table
CREATE TABLE IF NOT EXISTS public.quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_number TEXT NOT NULL UNIQUE,
    customer_name TEXT NOT NULL,
    product_type TEXT,
    quote_value NUMERIC,
    profit_margin_percentage NUMERIC,
    status TEXT NOT NULL DEFAULT 'draft',
    sent_date TIMESTAMPTZ,
    approval_date TIMESTAMPTZ,
    expiration_date TIMESTAMPTZ,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'quotes_status_check'
    ) THEN
        ALTER TABLE public.quotes ADD CONSTRAINT quotes_status_check CHECK (status IN ('draft', 'sent', 'approved', 'rejected', 'expired'));
    END IF;
END $$;

-- Enable RLS on quotes
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for quotes
DROP POLICY IF EXISTS "Auth read quotes" ON public.quotes;
CREATE POLICY "Auth read quotes" ON public.quotes
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Insert quotes" ON public.quotes;
CREATE POLICY "Insert quotes" ON public.quotes
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Update quotes" ON public.quotes;
CREATE POLICY "Update quotes" ON public.quotes
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Delete quotes" ON public.quotes;
CREATE POLICY "Delete quotes" ON public.quotes
  FOR DELETE TO authenticated USING (true);

-- Update work_orders table to link to quotes
ALTER TABLE public.work_orders ADD COLUMN IF NOT EXISTS quote_id UUID REFERENCES public.quotes(id) ON DELETE SET NULL;
