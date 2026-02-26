-- Table for tracking daily usage (races and custom topics)
CREATE TABLE IF NOT EXISTS public.daily_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ip_address TEXT,
  race_count INTEGER DEFAULT 0,
  custom_topic_count INTEGER DEFAULT 0,
  day DATE DEFAULT CURRENT_DATE,
  UNIQUE(user_id, day),
  UNIQUE(ip_address, day)
);

-- Enable RLS
ALTER TABLE public.daily_usage ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Allow public to manage their own daily_usage by IP" ON public.daily_usage;
CREATE POLICY "Allow public to manage their own daily_usage by IP" 
ON public.daily_usage FOR ALL 
USING (true) 
WITH CHECK (true);

-- Function to increment usage and check limits
CREATE OR REPLACE FUNCTION increment_usage(
  user_id_arg UUID, 
  ip_address_arg TEXT, 
  is_pro_arg BOOLEAN, 
  is_custom_topic_arg BOOLEAN
) RETURNS INTEGER AS $$
DECLARE
  current_race_count INTEGER;
  current_custom_count INTEGER;
  limit_race INTEGER;
  limit_custom INTEGER;
  target_id UUID;
BEGIN
  -- Set limits
  IF is_pro_arg THEN
    limit_race := 200;
    limit_custom := 200; -- Pro has no separate custom limit, just the 200 total
  ELSE
    limit_race := 25;
    limit_custom := 2;
  END IF;

  -- Get or create record
  IF user_id_arg IS NOT NULL THEN
    INSERT INTO public.daily_usage (user_id, day)
    VALUES (user_id_arg, CURRENT_DATE)
    ON CONFLICT (user_id, day) DO NOTHING;
    
    SELECT race_count, custom_topic_count INTO current_race_count, current_custom_count
    FROM public.daily_usage
    WHERE user_id = user_id_arg AND day = CURRENT_DATE;
  ELSE
    INSERT INTO public.daily_usage (ip_address, day)
    VALUES (ip_address_arg, CURRENT_DATE)
    ON CONFLICT (ip_address, day) DO NOTHING;
    
    SELECT race_count, custom_topic_count INTO current_race_count, current_custom_count
    FROM public.daily_usage
    WHERE ip_address = ip_address_arg AND day = CURRENT_DATE;
  END IF;

  -- Check limits
  IF is_custom_topic_arg AND NOT is_pro_arg AND current_custom_count >= limit_custom THEN
    RETURN -2; -- Custom topic limit reached (Free)
  END IF;

  IF current_race_count >= limit_race THEN
    IF is_pro_arg THEN
      RETURN -3; -- Race limit reached (Pro)
    ELSE
      RETURN -1; -- Race limit reached (Free)
    END IF;
  END IF;

  -- Increment
  IF user_id_arg IS NOT NULL THEN
    UPDATE public.daily_usage
    SET race_count = race_count + 1,
        custom_topic_count = CASE WHEN is_custom_topic_arg THEN custom_topic_count + 1 ELSE custom_topic_count END
    WHERE user_id = user_id_arg AND day = CURRENT_DATE;
  ELSE
    UPDATE public.daily_usage
    SET race_count = race_count + 1,
        custom_topic_count = CASE WHEN is_custom_topic_arg THEN custom_topic_count + 1 ELSE custom_topic_count END
    WHERE ip_address = ip_address_arg AND day = CURRENT_DATE;
  END IF;

  RETURN 1; -- Success
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
