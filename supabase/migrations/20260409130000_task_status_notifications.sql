-- Trigger for task status changes to Delayed or At Risk
CREATE OR REPLACE FUNCTION public.notify_task_status_change()
RETURNS trigger AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    IF NEW.status = 'delayed'::public.task_status_enum THEN
      IF NEW.assigned_to IS NOT NULL THEN
        INSERT INTO public.notifications (user_id, type, message, related_entity_id, related_entity_type)
        VALUES (NEW.assigned_to, 'System', 'A tarefa "' || NEW.task_name || '" foi marcada como Delayed.', NEW.id, 'wo_tasks');
      END IF;
    ELSIF NEW.status = 'at_risk'::public.task_status_enum THEN
      IF NEW.assigned_to IS NOT NULL THEN
        INSERT INTO public.notifications (user_id, type, message, related_entity_id, related_entity_type)
        VALUES (NEW.assigned_to, 'System', 'A tarefa "' || NEW.task_name || '" foi marcada como At Risk.', NEW.id, 'wo_tasks');
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_task_status_change ON public.wo_tasks;
CREATE TRIGGER on_task_status_change
  AFTER UPDATE ON public.wo_tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_task_status_change();
