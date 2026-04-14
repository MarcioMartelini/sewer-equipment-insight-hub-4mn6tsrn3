-- Fix the notify triggers to use English instead of Portuguese

CREATE OR REPLACE FUNCTION public.notify_production_task_status_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    IF NEW.status = 'delayed'::public.production_task_status_enum THEN
      IF NEW.assigned_to IS NOT NULL THEN
        INSERT INTO public.notifications (user_id, type, message, related_entity_id, related_entity_type)
        VALUES (NEW.assigned_to, 'System', 'The production task "' || NEW.task_name || '" has been marked as Delayed.', NEW.id, 'production_tasks');
      END IF;
    ELSIF NEW.status = 'at_risk'::public.production_task_status_enum THEN
      IF NEW.assigned_to IS NOT NULL THEN
        INSERT INTO public.notifications (user_id, type, message, related_entity_id, related_entity_type)
        VALUES (NEW.assigned_to, 'System', 'The production task "' || NEW.task_name || '" has been marked as At Risk.', NEW.id, 'production_tasks');
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.notify_task_status_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    IF NEW.status = 'delayed'::public.task_status_enum THEN
      IF NEW.assigned_to IS NOT NULL THEN
        INSERT INTO public.notifications (user_id, type, message, related_entity_id, related_entity_type)
        VALUES (NEW.assigned_to, 'System', 'The task "' || NEW.task_name || '" has been marked as Delayed.', NEW.id, 'wo_tasks');
      END IF;
    ELSIF NEW.status = 'at_risk'::public.task_status_enum THEN
      IF NEW.assigned_to IS NOT NULL THEN
        INSERT INTO public.notifications (user_id, type, message, related_entity_id, related_entity_type)
        VALUES (NEW.assigned_to, 'System', 'The task "' || NEW.task_name || '" has been marked as At Risk.', NEW.id, 'wo_tasks');
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;
