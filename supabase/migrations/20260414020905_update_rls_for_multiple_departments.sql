DO $$
BEGIN
  -- Update RLS policies to handle multiple departments separated by comma
  DROP POLICY IF EXISTS "Read WO by department or admin" ON public.work_orders;
  CREATE POLICY "Read WO by department or admin" ON public.work_orders
    FOR SELECT TO authenticated
    USING ((get_user_department() LIKE '%' || department || '%') OR (get_user_role() = 'admin'::text));

  DROP POLICY IF EXISTS "Update WO" ON public.work_orders;
  CREATE POLICY "Update WO" ON public.work_orders
    FOR UPDATE TO authenticated
    USING ((get_user_department() LIKE '%' || department || '%') OR (get_user_role() = 'admin'::text));

  DROP POLICY IF EXISTS "Sales can read WOs linked to quotes" ON public.work_orders;
  CREATE POLICY "Sales can read WOs linked to quotes" ON public.work_orders
    FOR SELECT TO authenticated
    USING ((quote_id IS NOT NULL) AND ((get_user_department() LIKE '%Sales%') OR (get_user_department() LIKE '%Vendas%')));
END $$;
