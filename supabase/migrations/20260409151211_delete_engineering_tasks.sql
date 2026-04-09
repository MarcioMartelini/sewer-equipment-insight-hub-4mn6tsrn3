-- Delete all existing tasks for the Engineering department
DELETE FROM public.wo_tasks
WHERE department = 'Engineering';
