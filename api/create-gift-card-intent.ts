import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_51T2vpI0AlKSl27CKhQHW9reGxQz9s9Yt4elIt7jOGGGjAELY0BaGMZ8GPpzcG7sRuSVGjM4ALMhd0lBMiOnXTGL1002bRLLS1Z', {
  apiVersion: '2025-01-27.acacia' as any,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const { userId, months } = req.body;
  const numMonths = parseInt(months || '1');
  
  // Pricing: $5.00 base, 10% discount per extra month, capped at 50%
  const discount = Math.min(0.5, (numMonths - 1) * 0.1);
  const amount = Math.round(numMonths * 500 * (1 - discount));

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      metadata: { type: 'gift_card', months: numMonths.toString(), userId: userId || '' },
    });

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error: any) {
    console.error('Stripe error:', error);
    res.status(400).json({ error: { message: error.message } });
  }
}
