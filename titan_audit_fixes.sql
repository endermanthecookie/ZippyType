-- Fix [CRITICAL] RLS_DISABLED on public.github_tokens
ALTER TABLE public.github_tokens ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow read access to all users" ON public.github_tokens;
CREATE POLICY "Allow read access to all users" ON public.github_tokens FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow update access to all users" ON public.github_tokens;
CREATE POLICY "Allow update access to all users" ON public.github_tokens FOR UPDATE USING (true);

-- Fix [WARNING] UNINDEXED_FK
CREATE INDEX IF NOT EXISTS idx_ip_sessions_user_id ON public.ip_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_rooms_host_id ON public.rooms(host_id);
CREATE INDEX IF NOT EXISTS idx_room_participants_user_id ON public.room_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_history_user_id ON public.history(user_id);

-- Fix [WARNING] POLICY_PERF
-- user_preferences
DROP POLICY IF EXISTS "Users can only view their own preferences" ON public.user_preferences;
CREATE POLICY "Users can only view their own preferences" ON public.user_preferences FOR SELECT USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can only modify their own preferences" ON public.user_preferences;
CREATE POLICY "Users can only modify their own preferences" ON public.user_preferences FOR UPDATE USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "User select" ON public.user_preferences;
CREATE POLICY "User select" ON public.user_preferences FOR SELECT USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "User modify" ON public.user_preferences;
CREATE POLICY "User modify" ON public.user_preferences FOR UPDATE USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "User delete" ON public.user_preferences;
CREATE POLICY "User delete" ON public.user_preferences FOR DELETE USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can manage their own preferences" ON public.user_preferences;
CREATE POLICY "Users can manage their own preferences" ON public.user_preferences FOR ALL USING (user_id = (select auth.uid()));

-- ip_sessions
DROP POLICY IF EXISTS "Allow authenticated users to manage their ip_sessions" ON public.ip_sessions;
CREATE POLICY "Allow authenticated users to manage their ip_sessions" ON public.ip_sessions FOR ALL USING (user_id = (select auth.uid()));

-- rooms
DROP POLICY IF EXISTS "Hosts can update their rooms" ON public.rooms;
CREATE POLICY "Hosts can update their rooms" ON public.rooms FOR UPDATE USING (host_id = (select auth.uid()));

-- room_participants
DROP POLICY IF EXISTS "Users can update their own status" ON public.room_participants;
CREATE POLICY "Users can update their own status" ON public.room_participants FOR UPDATE USING (user_id = (select auth.uid()));

-- user_credits
DROP POLICY IF EXISTS "Users can view their own credits" ON public.user_credits;
CREATE POLICY "Users can view their own credits" ON public.user_credits FOR SELECT USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update their own credits" ON public.user_credits;
CREATE POLICY "Users can update their own credits" ON public.user_credits FOR UPDATE USING (user_id = (select auth.uid()));

-- history
DROP POLICY IF EXISTS "Users can view their own history" ON public.history;
CREATE POLICY "Users can view their own history" ON public.history FOR SELECT USING (user_id = (select auth.uid()));

-- Fix [CRITICAL] INSECURE_FUNCTION
-- decrement_credits
CREATE OR REPLACE FUNCTION public.decrement_credits(user_id_arg uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.user_credits
  SET credits = credits - 1
  WHERE user_id = user_id_arg AND credits > 0;
END;
$$;

-- clean_anonymous_runs
CREATE OR REPLACE FUNCTION public.clean_anonymous_runs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.history
  WHERE user_id IS NULL
    AND created_at < NOW() - INTERVAL '24 hours';
END;
$$;
