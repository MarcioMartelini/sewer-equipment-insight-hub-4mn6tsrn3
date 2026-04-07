-- Add new fields to work_orders table
ALTER TABLE public.work_orders ADD COLUMN IF NOT EXISTS special_custom TEXT;
ALTER TABLE public.work_orders ADD COLUMN IF NOT EXISTS truck_information TEXT;
ALTER TABLE public.work_orders ADD COLUMN IF NOT EXISTS truck_supplier TEXT;

-- Add tracking columns to wo_history table
ALTER TABLE public.wo_history ADD COLUMN IF NOT EXISTS field_changed TEXT;
ALTER TABLE public.wo_history ADD COLUMN IF NOT EXISTS old_value TEXT;
ALTER TABLE public.wo_history ADD COLUMN IF NOT EXISTS new_value TEXT;
