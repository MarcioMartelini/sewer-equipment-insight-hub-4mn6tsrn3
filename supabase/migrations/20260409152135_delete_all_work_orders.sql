-- Remove all existing work orders
-- The ON DELETE CASCADE constraints will automatically remove all related tasks, history, etc.
DELETE FROM public.work_orders;
