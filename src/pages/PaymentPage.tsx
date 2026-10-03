import { useEffect, useState } from 'react';
import { CreditCard, ShieldCheck, WalletCards, Smartphone, ArrowRight, CheckCircle2, Banknote, ChevronRight, Landmark } from 'lucide-react';
import { navigate } from '@/lib/router';
import { getSubscriptionStatus, PLAN_DETAILS, setSubscriptionStatus, type SubscriptionTier } from '@/lib/subscriptions';

const paymentMethods = ['UPI', 'Google Pay', 'PhonePe', 'Paytm', 'Debit Card', 'Credit Card', 'Net Banking'];

export function PaymentPage() {
  const [selectedMethod, setSelectedMethod] = useState('UPI');
  const [tier, setTier] = useState<SubscriptionTier>('premium');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paid, setPaid] = useState(false);
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');

  useEffect(() => {
    const plan = (sessionStorage.getItem('selectedPlan') as SubscriptionTier) || 'premium';
    setTier(plan);
  }, []);

  const planDetails = PLAN_DETAILS[tier];
  const amount = billing === 'yearly' ? planDetails.annualPrice : planDetails.price;

  const handlePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const expiry = new Date();
      expiry.setMonth(expiry.getMonth() + 1);
      setSubscriptionStatus({
        plan: tier,
        price: amount,
        status: 'active',
        startDate: new Date().toISOString(),
        expiryDate: expiry.toISOString(),
        paymentId: `pay-${Date.now()}`,
        billingCycle: billing,
      });
      setPaid(true);
      setIsProcessing(false);
      navigate('/dashboard?subscription=success');
    }, 1200);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1.5 text-sm font-semibold text-primary-700">
          <ShieldCheck className="h-4 w-4" /> Secure payment
        </div>
        <h1 className="mt-4 text-3xl font-extrabold text-gray-900">Complete your subscription</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="card p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Choose payment method</h2>
            <div className="rounded-full bg-success-50 px-2.5 py-1 text-xs font-semibold text-success-700">Demo mode</div>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {paymentMethods.map((method) => (
              <button
                key={method}
                onClick={() => setSelectedMethod(method)}
                className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${selectedMethod === method ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 bg-white text-gray-700 hover:border-primary-200'}`}
              >
                {method}
              </button>
            ))}
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">Selected method</label>
              <input value={selectedMethod} readOnly className="input-field bg-gray-50" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">UPI ID / Mobile number</label>
              <input placeholder={selectedMethod === 'UPI' ? 'name@ybl' : 'Enter wallet or mobile number'} className="input-field" />
            </div>
            {selectedMethod.includes('Card') || selectedMethod === 'Net Banking' ? (
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Card Number</label>
                  <input placeholder="1234 5678 9012 3456" className="input-field" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-700">Expiry</label>
                    <input placeholder="MM/YY" className="input-field" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-700">CVV</label>
                    <input placeholder="***" className="input-field" />
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="card p-6">
          <div className="rounded-2xl bg-gradient-to-br from-primary-600 to-accent-500 p-5 text-white">
            <p className="text-sm uppercase tracking-[0.2em] text-primary-100">Order summary</p>
            <h2 className="mt-3 text-3xl font-extrabold">{planDetails.name}</h2>
            <div className="mt-4 flex items-end gap-2">
              <span className="text-4xl font-extrabold">₹{amount}</span>
              <span className="pb-1 text-primary-100">/ {billing === 'monthly' ? 'month' : 'year'}</span>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {planDetails.features.slice(0, 4).map((feature) => (
              <div key={feature} className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle2 className="h-4 w-4 text-success-600" />
                <span>{feature}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center gap-2 rounded-xl bg-gray-50 p-3 text-sm text-gray-600">
            <WalletCards className="h-5 w-5 text-primary-600" />
            Secure payment via encrypted Indian payment options.
          </div>

          <button onClick={handlePayment} disabled={isProcessing} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-5 py-3 font-bold text-white shadow-lg shadow-primary-600/25 disabled:opacity-60">
            {isProcessing ? 'Processing Payment...' : <>Pay ₹{amount} <ArrowRight className="h-4 w-4" /></>}
          </button>
        </div>
      </div>
    </div>
  );
}
