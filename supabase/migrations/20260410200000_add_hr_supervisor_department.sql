ALTER TABLE public.hr_injuries ADD COLUMN IF NOT EXISTS supervisor text;
ALTER TABLE public.hr_injuries ADD COLUMN IF NOT EXISTS department text;

ALTER TABLE public.hr_absences ADD COLUMN IF NOT EXISTS supervisor text;
ALTER TABLE public.hr_absences ADD COLUMN IF NOT EXISTS department text;
