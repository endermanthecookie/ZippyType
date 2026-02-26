import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_51T2vpI0AlKSl27CKhQHW9reGxQz9s9Yt4elIt7jOGGGjAELY0BaGMZ8GPpzcG7sRuSVGjM4ALMhd0lBMiOnXTGL1002bRLLS1Z', {
  apiVersion: '2025-01-27.acacia' as any,
});

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const { paymentIntentId } = req.body;
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (paymentIntent.status === 'succeeded' && paymentIntent.metadata.type === 'gift_card') {
      const months = parseInt(paymentIntent.metadata.months || '1');
      const code = Math.random().toString(36).substring(2, 14).toUpperCase().match(/.{1,4}/g)?.join('-') || 'ZIPPY-GIFT';
      
      // Insert into Supabase
      const { data, error } = await supabaseAdmin
        .from('gift_cards')
        .insert({
          code,
          months,
          created_by: paymentIntent.metadata.userId || null
        })
        .select()
        .single();

      if (error) throw error;
      res.status(200).json({ code, months });
    } else {
      res.status(400).json({ error: 'Payment not successful or invalid' });
    }
  } catch (error: any) {
    console.error('Confirm gift card error:', error);
    res.status(500).json({ error: error.message });
  }
}
