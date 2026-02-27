-- Create the leaderboard table
CREATE TABLE IF NOT EXISTS public.leaderboard (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT NOT NULL,
    score INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow everyone to read the leaderboard
CREATE POLICY "Allow public read access" ON public.leaderboard
    FOR SELECT USING (true);

-- Allow users to insert/update their own score (this might be handled via a function for security, but for now direct access)
-- Actually, for security, it's better if users can only update their own row.
CREATE POLICY "Allow users to insert their own row" ON public.leaderboard
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to update their own row" ON public.leaderboard
    FOR UPDATE USING (auth.uid() = user_id);

-- Create a function to update the leaderboard score safely
CREATE OR REPLACE FUNCTION update_leaderboard_score(p_user_id UUID, p_username TEXT, p_score_increment INTEGER)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.leaderboard (user_id, username, score, updated_at)
    VALUES (p_user_id, p_username, p_score_increment, NOW())
    ON CONFLICT (user_id)
    DO UPDATE SET
        score = public.leaderboard.score + p_score_increment,
        username = p_username, -- Update username in case it changed
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
