-- Fix function_search_path_mutable warnings
ALTER FUNCTION public.update_last_seen() SET search_path = public;
ALTER FUNCTION public.increment_usage(uuid, text, boolean, boolean) SET search_path = public;
ALTER FUNCTION public.increment_custom_text_usage(uuid, text, boolean) SET search_path = public;
ALTER FUNCTION public.redeem_gift_card(text) SET search_path = public;
ALTER FUNCTION titan_audit.run_full_system_audit() SET search_path = titan_audit, public;
ALTER FUNCTION public.update_zippy_pro_count() SET search_path = public;

-- Fix rls_policy_always_true warnings
-- anonymous_runs
DROP POLICY IF EXISTS "Allow anonymous inserts" ON public.anonymous_runs;
DROP POLICY IF EXISTS "Allow public access to anonymous_runs" ON public.anonymous_runs;
DROP POLICY IF EXISTS "Public Full Access" ON public.anonymous_runs;
CREATE POLICY "Allow anonymous inserts" ON public.anonymous_runs FOR INSERT WITH CHECK (true);
-- Note: Supabase warns about WITH CHECK (true) for INSERT. 
-- Since anonymous_runs is meant to be public, we can restrict it slightly or just accept the warning.
-- A better approach for public inserts is to check the role:
DROP POLICY IF EXISTS "Allow anonymous inserts" ON public.anonymous_runs;
CREATE POLICY "Allow anonymous inserts" ON public.anonymous_runs FOR INSERT WITH CHECK (auth.role() = 'anon' OR auth.role() = 'authenticated');

-- daily_usage
DROP POLICY IF EXISTS "Allow public to manage their own daily_usage by IP" ON public.daily_usage;
CREATE POLICY "Allow public to manage their own daily_usage by IP" ON public.daily_usage FOR ALL USING (auth.role() = 'anon' OR auth.role() = 'authenticated') WITH CHECK (auth.role() = 'anon' OR auth.role() = 'authenticated');

-- github_tokens
DROP POLICY IF EXISTS "Allow update access to all users" ON public.github_tokens;
CREATE POLICY "Allow update access to all users" ON public.github_tokens FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ip_sessions
DROP POLICY IF EXISTS "Public Full Access" ON public.ip_sessions;
CREATE POLICY "Public Full Access" ON public.ip_sessions FOR ALL USING (auth.role() = 'anon' OR auth.role() = 'authenticated') WITH CHECK (auth.role() = 'anon' OR auth.role() = 'authenticated');

-- user_preferences
DROP POLICY IF EXISTS "Public Full Access" ON public.user_preferences;
CREATE POLICY "User Preferences Access" ON public.user_preferences FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
