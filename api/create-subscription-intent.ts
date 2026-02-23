import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

const stripe = new Stripe('sk_test_51T2vpI0AlKSl27CKhQHW9reGxQz9s9Yt4elIt7jOGGGjAELY0BaGMZ8GPpzcG7sRuSVGjM4ALMhd0lBMiOnXTGL1002bRLLS1Z', {
  apiVersion: '2025-01-27.acacia' as any,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  try {
    // Create a Customer
    const customer = await stripe.customers.create();

    // Create a Subscription
    // Since we don't have a Price ID, we'll create a Price on the fly for a "Pro Plan"
    // In a real app, you'd create this once in the dashboard and use the ID
    const price = await stripe.prices.create({
      unit_amount: 500, // $5.00
      currency: 'usd',
      recurring: { interval: 'month' },
      product_data: {
        name: 'ZippyType Pro Subscription',
      },
    });

    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{
        price: price.id,
      }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
    });

    const invoice = subscription.latest_invoice as any;
    const paymentIntent = invoice.payment_intent as unknown as Stripe.PaymentIntent;

    res.status(200).json({
      subscriptionId: subscription.id,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error: any) {
    console.error('Stripe error:', error);
    res.status(400).json({ error: { message: error.message } });
  }
}
