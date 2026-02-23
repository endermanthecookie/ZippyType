import React, { useState, useEffect, useMemo } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { stripeAppearance } from './StripeConfig';
import { X, Loader2, CheckCircle2 } from 'lucide-react';

// Replace with your publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51T2vpI0AlKSl27CKYtFrULhI1NMYDeKod77bdYN3DapHAonav40c9aBzpUl5fhyKm2bejqfl92WPrQPpOubpiGs300xj9fJ2Lr');

interface CheckoutFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!stripe) return;

    const clientSecret = new URLSearchParams(window.location.search).get(
      "payment_intent_client_secret"
    );

    if (!clientSecret) return;

    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      switch (paymentIntent?.status) {
        case "succeeded":
          setMessage("Payment succeeded!");
          onSuccess();
          break;
        case "processing":
          setMessage("Your payment is processing.");
          break;
        case "requires_payment_method":
          setMessage("Your payment was not successful, please try again.");
          break;
        default:
          setMessage("Something went wrong.");
          break;
      }
    });
  }, [stripe, onSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Make sure to change this to your payment completion page
        return_url: window.location.href,
      },
      redirect: 'if_required',
    });

    if (error) {
      if (error.type === "card_error" || error.type === "validation_error") {
        setMessage(error.message || "An unexpected error occurred.");
      } else {
        setMessage("An unexpected error occurred.");
      }
    } else {
      setMessage("Payment succeeded!");
      onSuccess();
    }

    setIsLoading(false);
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement id="payment-element" options={{ layout: "tabs" }} />
      
      {message && (
        <div className={`p-3 rounded-lg text-xs font-medium ${message.includes("succeeded") ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/20 text-rose-400 border border-rose-500/20"}`}>
          {message}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading || !stripe || !elements}
          className="flex-1 py-3 px-4 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition-colors text-xs font-black uppercase tracking-widest"
        >
          Cancel
        </button>
        <button
          disabled={isLoading || !stripe || !elements}
          id="submit"
          className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-colors text-xs font-black uppercase tracking-widest shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? <Loader2 className="animate-spin" size={16} /> : "Pay Now"}
        </button>
      </div>
    </form>
  );
};

interface StripeCheckoutProps {
  clientSecret: string;
  onSuccess: () => void;
  onClose: () => void;
}

export const StripeCheckout: React.FC<StripeCheckoutProps> = ({ clientSecret, onSuccess, onClose }) => {
  const [memberCount, setMemberCount] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/member-count')
      .then(res => res.json())
      .then(data => setMemberCount(data.count))
      .catch(() => setMemberCount(1242));
  }, []);

  const getOrdinal = (n: number) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  const options = useMemo(() => ({
    clientSecret,
    appearance: stripeAppearance,
  }), [clientSecret]);

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="w-full max-w-md my-auto bg-[#0f172a] border border-white/10 rounded-3xl shadow-2xl relative animate-in zoom-in-95 duration-300">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500 rounded-t-3xl" />
        
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-black text-white tracking-tight">Secure Checkout</h3>
            {memberCount !== null && (
              <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">
                You will be our {getOrdinal(memberCount + 1)} member!
              </p>
            )}
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-full text-slate-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {clientSecret ? (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
              <Elements key={clientSecret} options={options} stripe={stripePromise}>
                <CheckoutForm onSuccess={onSuccess} onCancel={onClose} />
              </Elements>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 gap-4 text-slate-500">
              <Loader2 className="animate-spin" size={32} />
              <p className="text-xs font-black uppercase tracking-widest">Initializing Secure Payment...</p>
            </div>
          )}
        </div>
        
        <div className="p-4 bg-black/20 border-t border-white/5 flex items-center justify-center gap-2 text-[10px] text-slate-500 font-medium">
          <CheckCircle2 size={12} className="text-emerald-500" />
          Powered by Stripe &bull; SSL Encrypted
        </div>
      </div>
    </div>
  );
};
