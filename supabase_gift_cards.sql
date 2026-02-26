-- 1. Create zippypro table
CREATE TABLE IF NOT EXISTS public.zippypro (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  is_active BOOLEAN DEFAULT FALSE,
  months_remaining INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create gift_cards table
CREATE TABLE IF NOT EXISTS public.gift_cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  is_redeemed BOOLEAN DEFAULT FALSE,
  redeemed_by UUID REFERENCES auth.users(id),
  redeemed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  months INTEGER DEFAULT 1
);

-- 3. Insert special gift code
INSERT INTO public.gift_cards (code, months)
VALUES ('ILOV-EDAD-MUCH', 999)
ON CONFLICT (code) DO NOTHING;

-- 4. Enable RLS
ALTER TABLE public.zippypro ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gift_cards ENABLE ROW LEVEL SECURITY;

-- 5. Policies
DROP POLICY IF EXISTS "Users can view their own pro status" ON public.zippypro;
CREATE POLICY "Users can view their own pro status" 
ON public.zippypro FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own redeemed gift cards" ON public.gift_cards;
CREATE POLICY "Users can view their own redeemed gift cards" 
ON public.gift_cards FOR SELECT 
USING (auth.uid() = redeemed_by);

DROP POLICY IF EXISTS "Public can check if a code exists" ON public.gift_cards;
CREATE POLICY "Public can check if a code exists" 
ON public.gift_cards FOR SELECT 
USING (true);

-- 6. Redemption function
CREATE OR REPLACE FUNCTION redeem_gift_card(gift_code TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  card_id UUID;
  card_months INTEGER;
  user_id UUID;
BEGIN
  user_id := auth.uid();
  IF user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Find the card
  SELECT id, months INTO card_id, card_months
  FROM public.gift_cards
  WHERE code = gift_code AND is_redeemed = FALSE;

  IF card_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Mark as redeemed
  UPDATE public.gift_cards
  SET is_redeemed = TRUE,
      redeemed_by = user_id,
      redeemed_at = NOW()
  WHERE id = card_id;

  -- Update zippypro table
  INSERT INTO public.zippypro (user_id, is_active, months_remaining)
  VALUES (user_id, TRUE, card_months)
  ON CONFLICT (user_id) DO UPDATE
  SET is_active = TRUE,
      months_remaining = public.zippypro.months_remaining + EXCLUDED.months_remaining,
      updated_at = NOW();
  
  -- Also update our local preferences if they exist
  UPDATE public.user_preferences 
  SET pilot_profile = jsonb_set(pilot_profile, '{is_pro}', 'true')
  WHERE user_id = user_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
