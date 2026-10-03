import { useEffect, useState } from 'react';
import { Check, CreditCard, ShieldCheck, Sparkles, Star, ArrowRight, Crown, WalletCards, CheckCircle2 } from 'lucide-react';
import { navigate, useRouter } from '@/lib/router';
import { getSubscriptionStatus, PLAN_DETAILS, setSubscriptionStatus, type SubscriptionTier } from '@/lib/subscriptions';

const plans: SubscriptionTier[] = ['free', 'premium', 'pro'];
const paymentMethods = ['UPI', 'Google Pay', 'PhonePe', 'Paytm', 'Debit Card', 'Credit Card', 'Net Banking'];

export function SubscriptionPage() {
  const route = useRouter();
  const current = getSubscriptionStatus();
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionTier>(current.plan || 'premium');
  const [showPayment, setShowPayment] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState('UPI');
  const [processing, setProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState(route.params.success === '1');

  useEffect(() => {
    setSelectedPlan(current.plan || 'premium');
  }, [current.plan]);

  const getPrice = (tier: SubscriptionTier) => {
    const plan = PLAN_DETAILS[tier];
    return billing === 'yearly' ? plan.annualPrice : plan.price;
  };

  const handleUpgrade = (tier: SubscriptionTier) => {
    setSelectedPlan(tier);
    setShowPayment(true);
  };

  const handlePayment = () => {
    setProcessing(true);
    setTimeout(() => {
      const expiry = new Date();
      expiry.setMonth(expiry.getMonth() + 1);
      setSubscriptionStatus({
        plan: selectedPlan,
        price: getPrice(selectedPlan),
        status: 'active',
        startDate: new Date().toISOString(),
        expiryDate: expiry.toISOString(),
        paymentId: `pay-${Date.now()}`,
        billingCycle: billing,
      });
      setSuccessMessage(true);
      setShowPayment(false);
      setProcessing(false);
      navigate('/dashboard');
    }, 1200);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1.5 text-sm font-semibold text-primary-700">
          <Crown className="h-4 w-4" /> Choose Your YatraAI Plan
        </div>
        <h1 className="mt-4 text-3xl md:text-5xl font-extrabold text-gray-900">Flexible plans for every kind of traveler</h1>
        <p className="mt-3 text-lg text-gray-600">From free planning to premium AI-assisted adventures, there’s a plan for your next trip.</p>
      </div>

      <div className="mb-10 flex justify-center">
        <div className="inline-flex rounded-full border border-gray-200 bg-white p-1 shadow-sm">
          {(['monthly', 'yearly'] as const).map((cycle) => (
            <button
              key={cycle}
              onClick={() => setBilling(cycle)}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition ${billing === cycle ? 'bg-primary-600 text-white shadow' : 'text-gray-600 hover:text-primary-700'}`}
            >
              {cycle === 'monthly' ? 'Monthly' : 'Yearly'}
            </button>
          ))}
        </div>
      </div>

      {successMessage && (
        <div className="mb-8 rounded-2xl border border-success-200 bg-success-50 px-5 py-4 text-success-700 shadow-sm">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-6 w-6" />
            <div>
              <p className="font-bold">Payment Successful ✓</p>
              <p className="text-sm">Your subscription has been activated successfully.</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {plans.map((tier) => {
          const plan = PLAN_DETAILS[tier];
          const currentTier = current.plan === tier;
          const isPremiumRecommended = tier === 'premium';
          const price = getPrice(tier);

          return (
            <div
              key={tier}
              className={`relative rounded-3xl border p-6 shadow-sm transition ${
                isPremiumRecommended ? 'border-primary-200 bg-gradient-to-br from-primary-50 via-white to-accent-50 shadow-xl ring-2 ring-primary-200' : 'border-gray-200 bg-white'
              } ${currentTier ? 'ring-2 ring-success-200' : ''}`}
            >
              {isPremiumRecommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary-600 px-3 py-1 text-xs font-bold text-white shadow-md">
                  Recommended
                </div>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xl font-extrabold text-gray-900">{plan.name}</p>
                  <p className="text-sm text-gray-500">{plan.tag}</p>
                </div>
                {currentTier && <span className="rounded-full bg-success-100 px-2.5 py-1 text-xs font-bold text-success-700">Current Plan</span>}
              </div>

              <div className="mt-6 flex items-end gap-2">
                <span className="text-4xl font-extrabold text-gray-900">₹{price}</span>
                <span className="pb-1 text-sm text-gray-500">/ {billing === 'monthly' ? 'month' : 'year'}</span>
              </div>

              <p className="mt-3 text-sm text-gray-600">{plan.description}</p>

              <ul className="mt-6 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-gray-700">
                    <Check className="mt-0.5 h-4 w-4 text-success-600" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-7 space-y-3">
                {tier === 'free' ? (
                  <button onClick={() => navigate('/dashboard')} className="w-full rounded-xl bg-gray-900 px-4 py-3 font-semibold text-white">Current Plan</button>
                ) : (
                  <button onClick={() => handleUpgrade(tier)} className={`w-full rounded-xl px-4 py-3 font-semibold ${isPremiumRecommended ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/25' : 'bg-accent-500 text-white'}`}>
                    Upgrade to {plan.name}
                  </button>
                )}
                {billing === 'yearly' && price > 0 && (
                  <p className="text-center text-xs text-primary-700 font-medium">Save up to 20% with yearly billing.</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showPayment && (
        <div className="mt-12 rounded-3xl border border-primary-200 bg-white p-6 shadow-xl">
          <div className="mb-6 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-primary-700">Secure checkout</p>
              <h2 className="mt-2 text-2xl font-extrabold text-gray-900">Upgrade to {PLAN_DETAILS[selectedPlan].name}</h2>
            </div>
            <button onClick={() => setShowPayment(false)} className="rounded-full border border-gray-200 px-3 py-1.5 text-sm font-semibold text-gray-600">Close</button>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-5">
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">Choose payment method</label>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                  {paymentMethods.map((method) => (
                    <button
                      key={method}
                      onClick={() => setSelectedMethod(method)}
                      className={`rounded-2xl border px-3 py-3 text-sm font-semibold transition ${selectedMethod === method ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 bg-white text-gray-700 hover:border-primary-200'}`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">Selected method</label>
                <input value={selectedMethod} readOnly className="input-field bg-gray-50" />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">UPI ID / Mobile number</label>
                <input placeholder={selectedMethod === 'UPI' ? 'name@ybl' : 'Enter wallet or mobile number'} className="input-field" />
              </div>
            </div>

            <div className="rounded-3xl bg-gradient-to-br from-primary-600 to-accent-500 p-5 text-white shadow-lg">
              <p className="text-sm uppercase tracking-[0.2em] text-primary-100">Order summary</p>
              <h3 className="mt-3 text-3xl font-extrabold">{PLAN_DETAILS[selectedPlan].name}</h3>
              <div className="mt-4 flex items-end gap-2">
                <span className="text-4xl font-extrabold">₹{getPrice(selectedPlan)}</span>
                <span className="pb-1 text-primary-100">/ {billing === 'monthly' ? 'month' : 'year'}</span>
              </div>

              <div className="mt-6 space-y-3">
                {PLAN_DETAILS[selectedPlan].features.slice(0, 4).map((feature) => (
                  <div key={feature} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-white" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <button onClick={handlePayment} disabled={processing} className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 font-bold text-primary-700 shadow-lg disabled:opacity-60">
                {processing ? 'Processing payment...' : <>Pay ₹{getPrice(selectedPlan)} <ArrowRight className="h-4 w-4" /></>}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-10 rounded-3xl border border-primary-200 bg-gradient-to-r from-primary-600 to-accent-500 p-6 text-white">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-primary-100">Premium benefit</p>
            <h2 className="mt-2 text-2xl font-extrabold">Unlock advanced planning and travel community tools</h2>
          </div>
          <button onClick={() => handleUpgrade('premium')} className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 font-bold text-primary-700 shadow-lg">
            <Star className="h-4 w-4" /> Upgrade to Premium
          </button>
        </div>
      </div>
    </div>
  );
}
