-- 1. Update `wo_tasks` table
ALTER TABLE public.wo_tasks ADD COLUMN IF NOT EXISTS comments TEXT;
ALTER TABLE public.wo_tasks ADD COLUMN IF NOT EXISTS is_completed BOOLEAN DEFAULT false;
ALTER TABLE public.wo_tasks ADD COLUMN IF NOT EXISTS completion_date TIMESTAMPTZ;

-- 2. Create `wo_task_comments_history` table
CREATE TABLE IF NOT EXISTS public.wo_task_comments_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES public.wo_tasks(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    author_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. RLS for wo_task_comments_history
ALTER TABLE public.wo_task_comments_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Auth read wo_task_comments_history" ON public.wo_task_comments_history;
CREATE POLICY "Auth read wo_task_comments_history" ON public.wo_task_comments_history
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Auth insert wo_task_comments_history" ON public.wo_task_comments_history;
CREATE POLICY "Auth insert wo_task_comments_history" ON public.wo_task_comments_history
    FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Auth update wo_task_comments_history" ON public.wo_task_comments_history;
CREATE POLICY "Auth update wo_task_comments_history" ON public.wo_task_comments_history
    FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Auth delete wo_task_comments_history" ON public.wo_task_comments_history;
CREATE POLICY "Auth delete wo_task_comments_history" ON public.wo_task_comments_history
    FOR DELETE TO authenticated USING (true);

-- 4. Index for performance
CREATE INDEX IF NOT EXISTS wo_task_comments_history_task_id_idx ON public.wo_task_comments_history(task_id);
