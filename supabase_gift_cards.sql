-- 1. Create zippypro table
CREATE TABLE IF NOT EXISTS public.zippypro (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  is_active BOOLEAN DEFAULT FALSE,
  months_remaining INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create gift_cards table with multi-use support
CREATE TABLE IF NOT EXISTS public.gift_cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  max_uses INTEGER DEFAULT 1,
  uses_count INTEGER DEFAULT 0,
  months INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- 2.5 Create gift_card_redemptions table to track who redeemed what
CREATE TABLE IF NOT EXISTS public.gift_card_redemptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  gift_card_id UUID REFERENCES public.gift_cards(id),
  user_id UUID REFERENCES auth.users(id),
  redeemed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(gift_card_id, user_id)
);

-- 3. Insert special gift codes
INSERT INTO public.gift_cards (code, months, max_uses)
VALUES 
  ('ILOV-EDAD-MUCH', 999, 1),
  ('ILOV-FAMI-LY12', 999, 10)
ON CONFLICT (code) DO UPDATE SET max_uses = EXCLUDED.max_uses, months = EXCLUDED.months;

-- 4. Enable RLS
ALTER TABLE public.zippypro ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gift_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gift_card_redemptions ENABLE ROW LEVEL SECURITY;

-- 5. Policies
DROP POLICY IF EXISTS "Users can view their own pro status" ON public.zippypro;
CREATE POLICY "Users can view their own pro status" 
ON public.zippypro FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own redemptions" ON public.gift_card_redemptions;
CREATE POLICY "Users can view their own redemptions" 
ON public.gift_card_redemptions FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Public can check if a code exists" ON public.gift_cards;
CREATE POLICY "Public can check if a code exists" 
ON public.gift_cards FOR SELECT 
USING (true);

-- 6. Redemption function
CREATE OR REPLACE FUNCTION redeem_gift_card(gift_code TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_card_id UUID;
  v_card_months INTEGER;
  v_user_id UUID;
  v_already_redeemed BOOLEAN;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Find the card and check uses
  SELECT id, months INTO v_card_id, v_card_months
  FROM public.gift_cards
  WHERE code = gift_code AND uses_count < max_uses;

  IF v_card_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Check if user already redeemed this specific card
  SELECT EXISTS (
    SELECT 1 FROM public.gift_card_redemptions 
    WHERE gift_card_id = v_card_id AND user_id = v_user_id
  ) INTO v_already_redeemed;

  IF v_already_redeemed THEN
    RAISE EXCEPTION 'You have already redeemed this gift card';
  END IF;

  -- Record redemption
  INSERT INTO public.gift_card_redemptions (gift_card_id, user_id)
  VALUES (v_card_id, v_user_id);

  -- Increment uses count
  UPDATE public.gift_cards
  SET uses_count = uses_count + 1
  WHERE id = v_card_id;

  -- Update zippypro table
  INSERT INTO public.zippypro (user_id, is_active, months_remaining)
  VALUES (v_user_id, TRUE, v_card_months)
  ON CONFLICT (user_id) DO UPDATE
  SET is_active = TRUE,
      months_remaining = public.zippypro.months_remaining + EXCLUDED.months_remaining,
      updated_at = NOW();
  
  -- Also update our local preferences if they exist
  UPDATE public.user_preferences 
  SET pilot_profile = jsonb_set(pilot_profile, '{is_pro}', 'true')
  WHERE user_id = v_user_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
