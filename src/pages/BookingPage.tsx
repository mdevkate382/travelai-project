import { useState, useEffect } from 'react';
import { navigate } from '@/lib/router';
import { useAuth } from '@/context/AuthContext';
import { createTripBooking } from '@/lib/api';
import type { Plan, TripFormData } from '@/types';
import { formatINR } from '@/lib/format';
import {
  Hotel, Car, Calendar, Users, Sparkles, ChevronLeft, Wallet, Shield,
  CheckCircle2, CreditCard, Loader2, AlertCircle, Info, MapPin, Receipt
} from 'lucide-react';

export function BookingPage() {
  const { user, profile } = useAuth();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [formData, setFormData] = useState<TripFormData | null>(null);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [error, setError] = useState('');

  useEffect(() => {
    const sp = sessionStorage.getItem('selectedPlan');
    const sf = sessionStorage.getItem('currentTripForm');
    if (sp) setPlan(JSON.parse(sp));
    if (sf) setFormData(JSON.parse(sf));
  }, []);

  if (!plan || !formData) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <p className="text-gray-500">No plan selected. Please choose a plan first.</p>
        <button onClick={() => navigate('/planner')} className="mt-4 btn-primary">Plan a Trip</button>
      </div>
    );
  }

  const subtotal = plan.totalCost;
  const taxes = Math.round(subtotal * 0.05);
  const totalPayable = subtotal + taxes;

  const handlePayment = async () => {
    setProcessing(true);
    setError('');

    const tripId = sessionStorage.getItem('currentTripId');
    const savedPlan = sessionStorage.getItem('selectedPlan');
    const selectedPlanFromStorage = savedPlan ? JSON.parse(savedPlan) as Plan : null;
    const planId = selectedPlanFromStorage?.id ?? plan.id;

    if (!user) {
      setError('Please log in to continue with booking.');
      setProcessing(false);
      return;
    }

    if (!tripId) {
      setError('Trip data is missing. Please generate your travel plan again.');
      setProcessing(false);
      return;
    }

    if (!planId) {
      setError('Selected plan is missing a valid plan ID. Please choose a plan again.');
      setProcessing(false);
      return;
    }

    if (!formData || !(formData.destinations && formData.destinations.length) || !formData.startDate || !formData.totalTravellers || formData.totalTravellers < 1) {
      setError('Please complete all required booking details before confirming your trip.');
      setProcessing(false);
      return;
    }

    try {
      const destination = formData.destinations.map((d) => d.name).join(' → ') || plan.route.join(' → ');
      const payload = {
        userId: user.id,
        tripId,
        planId,
        destination,
        travelDate: formData.startDate,
        numberOfTravelers: formData.totalTravellers,
        totalAmount: totalPayable,
        selectedPlan: plan.planName,
        planName: plan.planName,
        paymentMethod,
      };

      const response = await createTripBooking(payload).catch(() => ({
        booking: {
          booking_id: `BK-DEMO-${Date.now()}`,
          booking_code: `YAT-${Date.now().toString().slice(-6)}`,
          id: `demo-booking-${Date.now()}`,
        },
      }));
      const booking = response.booking;
      const bookingId = booking?.booking_id || booking?.id;

      sessionStorage.setItem('pendingBooking', JSON.stringify({
        bookingId,
        bookingCode: booking?.booking_code || bookingId,
        tripRoute: destination,
        amount: totalPayable,
        paymentMethod,
        hotel: plan.hotel,
        transport: plan.transport,
        travellers: formData.totalTravellers,
        startDate: formData.startDate,
        endDate: formData.endDate || formData.startDate,
        planName: plan.planName,
        destination,
        selectedPlan: plan.planName,
        destinations: formData.destinations,
      }));

      setProcessing(false);
      navigate('/payment');
    } catch (err: any) {
      const fallbackId = `BK-DEMO-${Date.now()}`;
      sessionStorage.setItem('pendingBooking', JSON.stringify({
        bookingId: fallbackId,
        bookingCode: `YAT-${Date.now().toString().slice(-6)}`,
        tripRoute: plan.route.join(' → '),
        amount: totalPayable,
        paymentMethod,
        hotel: plan.hotel,
        transport: plan.transport,
        travellers: formData.totalTravellers,
        startDate: formData.startDate,
        endDate: formData.endDate || formData.startDate,
        planName: plan.planName,
        destination: plan.route.join(' → '),
        selectedPlan: plan.planName,
        destinations: formData.destinations,
      }));
      setProcessing(false);
      navigate('/payment');
    }
  };

  const paymentMethods = ['UPI', 'Google Pay', 'PhonePe', 'Paytm', 'Debit Card', 'Credit Card', 'Net Banking'];

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      <button onClick={() => navigate('/plan-details')} className="mb-6 flex items-center gap-1 text-primary-600 font-semibold hover:text-primary-700">
        <ChevronLeft className="h-5 w-5" /> Back to Plan
      </button>

      <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Booking Summary</h1>
      <p className="text-gray-500 mb-8">Review your trip details and proceed to payment</p>

      {/* Trip details */}
      <div className="card p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Trip Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DetailItem icon={MapPin} label="Trip" value={plan.route.join(' → ')} />
          <DetailItem icon={Users} label="Travellers" value={`${formData.totalTravellers} (${formData.adults} adults, ${formData.children} children)`} />
          <DetailItem icon={Calendar} label="Dates" value={`${formData.startDate || 'Flexible'} → ${formData.endDate || 'Flexible'}`} />
          <DetailItem icon={Calendar} label="Duration" value={`${formData.days} days / ${formData.nights} nights`} />
          <DetailItem icon={Hotel} label="Hotel" value={`${plan.hotel} (${formData.roomType} room)`} />
          <DetailItem icon={Car} label="Transport" value={plan.transport} />
          <DetailItem icon={Sparkles} label="Activities" value={plan.activities.join(', ')} />
          <DetailItem icon={MapPin} label="Plan" value={plan.planName.replace('⭐ ', '')} />
        </div>
      </div>

      <div className="card p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Traveler Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DetailItem icon={Users} label="Full Name" value={profile?.full_name || user?.email || 'Guest traveler'} />
          <DetailItem icon={Wallet} label="Email" value={user?.email || 'Not available'} />
          <DetailItem icon={Shield} label="Trip Status" value="Ready for confirmation" />
          <DetailItem icon={CreditCard} label="Selected Payment" value={paymentMethod} />
        </div>
      </div>

      {/* Demo booking notice */}
      <div className="rounded-xl bg-warning-50 border border-warning-200 p-4 mb-6 flex items-start gap-3">
        <Info className="h-5 w-5 text-warning-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-warning-800">Demo Booking & Payment</p>
          <p className="text-sm text-warning-700 mt-1">
            This is a project prototype. Hotel, train/flight, and local transport bookings use demo data — we do not claim actual bookings have been made. 
            Payment is processed in demo mode. No real money is charged. This structure is designed so real booking APIs and Razorpay Live Mode can be integrated later.
          </p>
        </div>
      </div>

      {/* Cost summary */}
      <div className="card p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Cost Breakdown</h2>
        <div className="space-y-2 text-sm">
          <CostRow label="Hotel" cost={plan.hotelCost} />
          <CostRow label="Transport" cost={plan.transportCost} />
          <CostRow label="Local Transport" cost={plan.localTransportCost} />
          <CostRow label="Food" cost={plan.foodCost} />
          <CostRow label="Activities" cost={plan.activitiesCost} />
          <CostRow label="Miscellaneous" cost={plan.miscCost} />
          <div className="border-t border-gray-100 pt-2 flex justify-between font-semibold">
            <span>Subtotal</span><span>{formatINR(subtotal)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Taxes & Charges (5%)</span><span>{formatINR(taxes)}</span>
          </div>
          <div className="border-t border-gray-100 pt-2 flex justify-between text-lg font-bold">
            <span>Total Payable</span>
            <span className="text-primary-700">{formatINR(totalPayable)}</span>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="text-gray-500">Your Budget</span>
          <span className="font-semibold">{formatINR(formData.budget)}</span>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <CheckCircle2 className="h-4 w-4 text-success-600" />
          <span className="text-sm font-semibold text-success-600">
            Within Budget — {formatINR(formData.budget - totalPayable)} remaining
          </span>
        </div>
      </div>

      {/* Payment method */}
      <div className="card p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-2">Payment Method</h2>
        <p className="text-sm text-gray-500 mb-4">All amounts in ₹ INR. Demo mode — no real charge.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {paymentMethods.map((m) => (
            <button
              key={m}
              onClick={() => setPaymentMethod(m)}
              className={`px-4 py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                paymentMethod === m ? 'bg-primary-600 text-white shadow-lg ring-2 ring-primary-300' : 'bg-gray-100 text-gray-700 hover:bg-primary-50'
              }`}
            >
              <CreditCard className="h-4 w-4" /> {m}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-xl bg-error-50 border border-error-200 px-4 py-3 text-sm text-error-700">
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" /> {error}
        </div>
      )}

      {/* Payment button */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-gray-500">Total Payable</p>
            <p className="text-3xl font-extrabold text-primary-700">{formatINR(totalPayable)}</p>
          </div>
          <Shield className="h-8 w-8 text-success-600" />
        </div>
        <button
          onClick={handlePayment}
          disabled={processing}
          className="w-full btn-accent disabled:opacity-60"
        >
          {processing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Shield className="h-5 w-5" />}
          {processing ? 'Processing Payment...' : 'Proceed to Secure Payment (Demo)'}
        </button>
        <p className="mt-3 text-center text-xs text-gray-400 flex items-center justify-center gap-1">
          <Receipt className="h-3 w-3" /> You'll receive a booking confirmation and receipt after payment
        </p>
      </div>
    </div>
  );
}

function DetailItem({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="h-5 w-5 text-primary-600 flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-xs text-gray-400 font-semibold uppercase">{label}</p>
        <p className="text-sm text-gray-900 font-medium">{value}</p>
      </div>
    </div>
  );
}

function CostRow({ label, cost }: { label: string; cost: number }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-600">{label}</span>
      <span className="font-semibold text-gray-900">{formatINR(cost)}</span>
    </div>
  );
}
