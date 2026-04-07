DROP POLICY IF EXISTS "Creator can read WO" ON public.work_orders;
CREATE POLICY "Creator can read WO" ON public.work_orders
  FOR SELECT TO authenticated USING (created_by = auth.uid());

DROP POLICY IF EXISTS "Sales can read WOs linked to quotes" ON public.work_orders;
CREATE POLICY "Sales can read WOs linked to quotes" ON public.work_orders
  FOR SELECT TO authenticated USING (
    quote_id IS NOT NULL 
    AND (public.get_user_department() = 'Sales' OR public.get_user_department() = 'Vendas')
  );
