-- Add notification preference columns to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS system_notifications BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS critical_alerts BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS daily_summary BOOLEAN DEFAULT false;

-- Add policy to allow users to update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
