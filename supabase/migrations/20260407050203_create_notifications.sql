CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('Sales', 'Engineering', 'Purchasing', 'Production', 'Quality', 'HR', 'System')),
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    related_entity_id UUID,
    related_entity_type TEXT
);

CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON public.notifications(user_id);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own notifications" ON public.notifications;
CREATE POLICY "Users can read own notifications" ON public.notifications
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications" ON public.notifications
    FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;
CREATE POLICY "System can insert notifications" ON public.notifications
    FOR INSERT TO authenticated WITH CHECK (true);

DO $$
DECLARE
    u RECORD;
BEGIN
    FOR u IN SELECT id FROM public.users LOOP
        -- Check if user already has notifications to avoid duplicate seeding on rerun
        IF NOT EXISTS (SELECT 1 FROM public.notifications WHERE user_id = u.id) THEN
            INSERT INTO public.notifications (user_id, type, message, is_read, created_at) VALUES
            (u.id, 'System', 'Welcome to the new Insight HUB! Your system is fully operational.', false, now() - interval '1 hour'),
            (u.id, 'Production', 'Work Order #WO-1025 has moved to Final Assembly.', false, now() - interval '2 hours'),
            (u.id, 'Quality', 'Alert: Quality check failed on Work Order #WO-1024.', true, now() - interval '1 day'),
            (u.id, 'Sales', 'New quote #QT-2048 has been approved.', false, now() - interval '3 hours');
        END IF;
    END LOOP;
END $$;
