-- Create github_tokens table
CREATE TABLE IF NOT EXISTS public.github_tokens (
  id SERIAL PRIMARY KEY,
  token_name TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'active'
);

-- Insert the 10 tokens
INSERT INTO public.github_tokens (token_name) VALUES
('Github_tok_1'),
('Github_tok_2'),
('Github_tok_3'),
('Github_tok_4'),
('Github_tok_5'),
('Github_tok_6'),
('Github_tok_7'),
('Github_tok_8'),
('Github_tok_9'),
('Github_tok_10')
ON CONFLICT (token_name) DO NOTHING;

-- Add custom text usage tracking to user_credits
ALTER TABLE public.user_credits ADD COLUMN IF NOT EXISTS custom_text_usage INT DEFAULT 0;
ALTER TABLE public.user_credits ADD COLUMN IF NOT EXISTS custom_text_last_reset DATE DEFAULT CURRENT_DATE;

-- Function to increment custom text usage
CREATE OR REPLACE FUNCTION increment_custom_text_usage(user_id_arg UUID)
RETURNS INT AS $$
DECLARE
  current_usage INT;
  last_reset DATE;
BEGIN
  -- Get current usage and last reset date
  SELECT custom_text_usage, custom_text_last_reset INTO current_usage, last_reset
  FROM public.user_credits WHERE user_id = user_id_arg;

  -- If no record exists, create one
  IF current_usage IS NULL THEN
    INSERT INTO public.user_credits (user_id, credits, custom_text_usage, custom_text_last_reset)
    VALUES (user_id_arg, 5, 1, CURRENT_DATE);
    RETURN 1;
  END IF;

  -- Reset if it's a new day
  IF last_reset < CURRENT_DATE THEN
    current_usage := 0;
    -- Update credits to 1 as requested
    UPDATE public.user_credits SET credits = 1 WHERE user_id = user_id_arg;
  END IF;

  -- Check limit
  IF current_usage >= 25 THEN
    RETURN -1; -- Limit reached
  END IF;

  -- Increment usage
  UPDATE public.user_credits
  SET custom_text_usage = current_usage + 1,
      custom_text_last_reset = CURRENT_DATE
  WHERE user_id = user_id_arg;

  RETURN current_usage + 1;
END;
$$ LANGUAGE plpgsql;
