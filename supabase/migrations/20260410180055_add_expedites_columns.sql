ALTER TABLE public.purchasing_expedites ADD COLUMN IF NOT EXISTS pn_number text;
ALTER TABLE public.purchasing_expedites ADD COLUMN IF NOT EXISTS pn_description text;
ALTER TABLE public.purchasing_expedites ADD COLUMN IF NOT EXISTS vendor text;
ALTER TABLE public.purchasing_expedites ADD COLUMN IF NOT EXISTS area_supervisor text;
