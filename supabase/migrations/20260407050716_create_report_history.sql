CREATE TABLE IF NOT EXISTS public.report_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    report_type TEXT NOT NULL,
    department TEXT,
    date_start DATE,
    date_end DATE,
    format TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.report_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own report history" ON public.report_history;
CREATE POLICY "Users can read own report history" ON public.report_history
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own report history" ON public.report_history;
CREATE POLICY "Users can insert own report history" ON public.report_history
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
