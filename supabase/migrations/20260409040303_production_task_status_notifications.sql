-- Create trigger for production_tasks status changes to notify assigned users
CREATE OR REPLACE FUNCTION public.notify_production_task_status_change()
RETURNS trigger AS $function$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    IF NEW.status = 'delayed'::public.production_task_status_enum THEN
      IF NEW.assigned_to IS NOT NULL THEN
        INSERT INTO public.notifications (user_id, type, message, related_entity_id, related_entity_type)
        VALUES (NEW.assigned_to, 'System', 'A tarefa de produção "' || NEW.task_name || '" foi marcada como Delayed.', NEW.id, 'production_tasks');
      END IF;
    ELSIF NEW.status = 'at_risk'::public.production_task_status_enum THEN
      IF NEW.assigned_to IS NOT NULL THEN
        INSERT INTO public.notifications (user_id, type, message, related_entity_id, related_entity_type)
        VALUES (NEW.assigned_to, 'System', 'A tarefa de produção "' || NEW.task_name || '" foi marcada como At Risk.', NEW.id, 'production_tasks');
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$function$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_production_task_status_change ON public.production_tasks;
CREATE TRIGGER on_production_task_status_change
  AFTER UPDATE ON public.production_tasks
  FOR EACH ROW EXECUTE FUNCTION public.notify_production_task_status_change();
