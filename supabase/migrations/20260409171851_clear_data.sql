DO $$
BEGIN
  -- Removing specific Quality records as requested
  DELETE FROM public.quality_late_card_pulls;
  DELETE FROM public.quality_warranty_claims;
  
  -- Removing all Work Orders as requested
  DELETE FROM public.work_orders;
END $$;
