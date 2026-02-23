-- SQL Script for ZippyType Pro Settings and Preferences
-- Run this in your Supabase SQL Editor

-- 1. Update user_preferences table with new settings
ALTER TABLE user_preferences 
ADD COLUMN IF NOT EXISTS sound_profile TEXT DEFAULT 'classic',
ADD COLUMN IF NOT EXISTS keyboard_layout TEXT DEFAULT 'ansi';

-- 2. Ensure pilot_profile (jsonb) can store is_pro
-- No changes needed if it's already jsonb, but let's make sure the table exists
CREATE TABLE IF NOT EXISTS user_preferences (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    ai_provider TEXT DEFAULT 'gemini',
    github_token TEXT,
    pilot_profile JSONB DEFAULT '{"username": "Guest Player", "avatar": "😊", "accentColor": "indigo", "is_pro": false}',
    pomodoro_settings JSONB DEFAULT '{"enabled": true, "defaultMinutes": 25, "size": "medium"}',
    ai_opponent_count INTEGER DEFAULT 1,
    ai_opponent_difficulty TEXT DEFAULT 'medium',
    calibrated_keys TEXT[] DEFAULT '{}',
    key_mappings JSONB DEFAULT '{}',
    sound_profile TEXT DEFAULT 'classic',
    keyboard_layout TEXT DEFAULT 'ansi',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Table for IP-based sessions (already exists but for completeness)
CREATE TABLE IF NOT EXISTS ip_sessions (
    ip_address TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Table for anonymous usage tracking
CREATE TABLE IF NOT EXISTS anonymous_runs (
    ip_address TEXT PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Table for daily challenges
CREATE TABLE IF NOT EXISTS daily (
    id SERIAL PRIMARY KEY,
    daily TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Enable RLS (Row Level Security)
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE ip_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE anonymous_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily ENABLE ROW LEVEL SECURITY;

-- 7. Policies
CREATE POLICY "Users can manage their own preferences" 
ON user_preferences FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Public can read daily challenge" 
ON daily FOR SELECT 
USING (true);
