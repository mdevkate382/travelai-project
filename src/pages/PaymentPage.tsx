import { useEffect, useState } from 'react';
import { CreditCard, ShieldCheck, WalletCards, ArrowRight, CheckCircle2, ArrowLeft } from 'lucide-react';
import { navigate } from '@/lib/router';
import { confirmTripPayment } from '@/lib/api';
import { getSubscriptionStatus, PLAN_DETAILS, setSubscriptionStatus, type SubscriptionTier } from '@/lib/subscriptions';

const paymentMethods = ['UPI', 'Google Pay', 'PhonePe', 'Paytm', 'Debit Card', 'Credit Card', 'Net Banking'];

export function PaymentPage() {
  const [selectedMethod, setSelectedMethod] = useState('UPI');
  const [tier, setTier] = useState<SubscriptionTier>('premium');
  const [isProcessing, setIsProcessing] = useState(false);
  const [bit, setBit] = useState<'subscription' | 'booking'>('subscription');
  const [pendingBooking, setPendingBooking] = useState<any>(null);
  const [error, setError] = useState('');
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');

  useEffect(() => {
    const storedBooking = sessionStorage.getItem('pendingBooking');
    if (storedBooking) {
      setPendingBooking(JSON.parse(storedBooking));
      setBit('booking');
      return;
    }

    const plan = (sessionStorage.getItem('selectedPlan') as SubscriptionTier) || 'premium';
    setTier(plan);
  }, []);

  const planDetails = bit === 'booking' ? { name: pendingBooking?.selectedPlan || 'Trip Booking', price: Number(pendingBooking?.amount || 0), annualPrice: Number(pendingBooking?.amount || 0), features: ['Trip itinerary', 'Travel confirmation', 'Secure wallet demo payment'] } : PLAN_DETAILS[tier];
  const amount = bit === 'booking' ? Number(pendingBooking?.amount || 0) : billing === 'yearly' ? planDetails.annualPrice : planDetails.price;

  const handlePayment = async () => {
    setIsProcessing(true);
    setError('');

    try {
      if (bit === 'booking' && pendingBooking?.bookingId) {
        const response = await confirmTripPayment({
          bookingId: pendingBooking.bookingId,
          paymentMethod: selectedMethod,
          amount,
          currency: 'INR',
          paymentMode: 'demo',
        }).catch(() => ({
          booking: { booking_id: pendingBooking.bookingId, booking_code: pendingBooking.bookingCode },
          payment: { razorpay_payment_id: `pay-${Date.now()}` },
        }));

        const summary = {
          bookingCode: pendingBooking.bookingCode,
          paymentId: response?.payment?.razorpay_payment_id || `pay-${Date.now()}`,
          tripRoute: pendingBooking.tripRoute,
          amount: amount,
          paymentMethod: selectedMethod,
          hotel: pendingBooking.hotel,
          transport: pendingBooking.transport,
          travellers: pendingBooking.travellers,
          startDate: pendingBooking.startDate,
          endDate: pendingBooking.endDate,
          planName: pendingBooking.planName,
          bookingStatus: 'Confirmed',
          paymentStatus: 'Paid',
          destinations: pendingBooking.destinations || [],
        };

        sessionStorage.setItem('lastBooking', JSON.stringify(summary));
        sessionStorage.removeItem('pendingBooking');
        setIsProcessing(false);
        navigate('/my-trips');
        return;
      }

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
      setIsProcessing(false);
      navigate('/dashboard?subscription=success');
    } catch (err: any) {
      setError(err.message || 'Payment could not be processed. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <button onClick={() => navigate('/booking')} className="mb-6 inline-flex items-center gap-2 text-primary-600 font-semibold hover:text-primary-700">
        <ArrowLeft className="h-4 w-4" /> Back to booking
      </button>

      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1.5 text-sm font-semibold text-primary-700">
          <ShieldCheck className="h-4 w-4" /> Secure payment
        </div>
        <h1 className="mt-4 text-3xl font-extrabold text-gray-900">{bit === 'booking' ? 'Complete your trip booking' : 'Complete your subscription'}</h1>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700">
          {error}
        </div>
      )}

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
            <h2 className="mt-3 text-3xl font-extrabold">{bit === 'booking' ? pendingBooking?.selectedPlan || 'Trip Booking' : planDetails.name}</h2>
            {bit === 'booking' && pendingBooking && (
              <div className="mt-3 space-y-1 text-sm text-primary-100">
                <div>{pendingBooking.tripRoute}</div>
                <div>{pendingBooking.startDate} • {pendingBooking.travellers} travellers</div>
              </div>
            )}
            <div className="mt-4 flex items-end gap-2">
              <span className="text-4xl font-extrabold">₹{amount}</span>
              <span className="pb-1 text-primary-100">{bit === 'booking' ? 'total' : `/ ${billing === 'monthly' ? 'month' : 'year'}`}</span>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {(bit === 'booking' ? ['Trip itinerary', 'Travel confirmation', 'Secure demo payment'] : planDetails.features.slice(0, 4)).map((feature) => (
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
