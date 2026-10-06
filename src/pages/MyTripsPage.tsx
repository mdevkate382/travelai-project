import { useEffect, useMemo, useState } from 'react';
import { navigate } from '@/lib/router';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { formatINR, formatDate } from '@/lib/format';
import { LiveMapWeather } from '@/components/LiveMapWeather';
import type { Booking, Payment, Destination } from '@/types';
import {
  Calendar, MapPin, Users, Hotel, Car, CheckCircle2, CreditCard, Receipt,
  Plane, AlertCircle, Loader2, Download, ShieldAlert, Bell, Clock3, Siren, Check,
  XCircle
} from 'lucide-react';
import {
  tripHelpCategories,
  buildDisruptionScenario,
  buildAlternativeOptions,
  demoNotifications,
  getEmergencyGuidance,
  getStatusBadgeColor,
  type NotificationItem,
  type TripHelpCategory,
} from '@/lib/tripHelp';

const demoActiveTrip: Booking & { payment?: Payment } = {
  id: 'demo-trip-1',
  user_id: 'demo-user',
  trip_id: 'demo-trip',
  plan_id: 'demo-plan',
  booking_code: 'YAT-TRIP-2026',
  trip_route: 'Bengaluru → Goa',
  travellers: 2,
  start_date: '2026-10-08',
  end_date: '2026-10-12',
  hotel: 'Blue Horizon Resort',
  transport: 'Flight + Cab',
  activities: ['Beach day', 'Island tour'],
  subtotal: 18000,
  taxes: 2500,
  total_payable: 20500,
  status: 'Confirmed',
  created_at: new Date().toISOString(),
  payment: {
    id: 'demo-payment-1',
    booking_id: 'demo-trip-1',
    razorpay_order_id: 'demo-order',
    razorpay_payment_id: 'demo-payment',
    amount: 20500,
    currency: 'INR',
    payment_method: 'UPI',
    payment_status: 'Paid',
    payment_mode: 'UPI',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
};

export function MyTripsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<(Booking & { payment?: Payment })[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastBooking, setLastBooking] = useState<any>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>(demoNotifications);
  const [helpOpen, setHelpOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<(Booking & { payment?: Payment }) | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<TripHelpCategory | null>(null);
  const [selectedAlternative, setSelectedAlternative] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('Emergency');
  const [tripAlerts, setTripAlerts] = useState<Record<string, { status: string; message: string }>>({});
  const [lastNotification, setLastNotification] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const lb = sessionStorage.getItem('lastBooking');
      if (lb) {
        setLastBooking(JSON.parse(lb));
        sessionStorage.removeItem('lastBooking');
      }

      const storedDemoBookings = JSON.parse(sessionStorage.getItem('demoBookings') || '[]');
      if (!user) {
        if (storedDemoBookings.length > 0) {
          setBookings(storedDemoBookings);
        }
        setLoading(false);
        return;
      }

      const { data: bookingData, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) { setLoading(false); return; }

      const bookingsWithPayments = await Promise.all(
        (bookingData || []).map(async (b: Booking) => {
          const { data: payment } = await supabase
            .from('payments')
            .select('*')
            .eq('booking_id', b.id)
            .maybeSingle();
          return { ...b, payment: payment as Payment | undefined };
        })
      );
      setBookings(bookingsWithPayments);
      setLoading(false);
    })();
  }, [user]);

  const visibleBookings = bookings.length > 0 ? bookings : [demoActiveTrip];
  const notificationCount = useMemo(() => notifications.filter((n) => !n.isRead).length, [notifications]);

  const liveTripDestinations = useMemo<Destination[]>(() => {
    if (Array.isArray(lastBooking?.destinations) && lastBooking.destinations.length > 0) {
      return lastBooking.destinations as Destination[];
    }

    try {
      const rawTripForm = sessionStorage.getItem('currentTripForm');
      if (rawTripForm) {
        const parsed = JSON.parse(rawTripForm);
        if (Array.isArray(parsed.destinations) && parsed.destinations.length > 0) {
          return parsed.destinations as Destination[];
        }
      }
    } catch {
      // Ignore invalid session values and fall back to the route label below.
    }

    const primaryRoute = visibleBookings[0]?.trip_route || 'Destination';
    const routeParts = primaryRoute.split('→').map((part) => part.trim()).filter(Boolean);

    if (routeParts.length === 0) {
      return [{
        name: 'Destination',
        city: 'Destination',
        state: '',
        country: 'India',
        country_code: 'IN',
        latitude: null,
        longitude: null,
        place_id: 'trip-demo-destination',
      }];
    }

    return routeParts.map((part, index) => ({
      name: part,
      city: part,
      state: '',
      country: 'India',
      country_code: 'IN',
      latitude: null,
      longitude: null,
      place_id: `trip-route-${index}-${part.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    }));
  }, [lastBooking, visibleBookings]);

  const openHelp = (booking: Booking & { payment?: Payment }) => {
    setSelectedBooking(booking);
    setSelectedCategory(null);
    setSelectedAlternative(null);
    setCancelReason('Emergency');
    setHelpOpen(true);
  };

  const addNotification = (title: string, message: string, type: NotificationItem['type'] = 'info') => {
    const newItem: NotificationItem = {
      id: `${Date.now()}`,
      title,
      message,
      type,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [newItem, ...prev]);
    setLastNotification(`${title}: ${message}`);
  };

  const applyDisruption = (category: TripHelpCategory, booking: Booking & { payment?: Payment }) => {
    const scenario = buildDisruptionScenario(category, booking.trip_route);
    const nextStatus = category === 'cancel' ? 'Cancelled' : 'Action Required';
    setTripAlerts((prev) => ({
      ...prev,
      [booking.id]: {
        status: nextStatus,
        message: scenario.title + ': ' + scenario.description,
      },
    }));

    addNotification(
      scenario.title,
      scenario.description,
      category === 'cancel' ? 'danger' : 'warning'
    );
  };

  const handleSelectAlternative = (booking: Booking & { payment?: Payment }, alternativeLabel: string) => {
    setSelectedAlternative(alternativeLabel);
    setTripAlerts((prev) => ({
      ...prev,
      [booking.id]: {
        status: 'Delayed',
        message: `Selected alternative: ${alternativeLabel}. Updated itinerary and hotel timing are being reviewed.`,
      },
    }));
    addNotification('Option selected', `Selected ${alternativeLabel} for ${booking.trip_route}.`, 'success');
  };

  const handleCancelTrip = (booking: Booking & { payment?: Payment }) => {
    const charge = Math.round(booking.total_payable * 0.08);
    const refund = Math.max(booking.total_payable - charge, 0);
    const confirmed = window.confirm('This will mark this trip as cancelled. Continue?');

    if (!confirmed) return;

    setBookings((prev) => prev.map((item) => item.id === booking.id ? { ...item, status: 'Cancelled' } : item));
    setTripAlerts((prev) => ({
      ...prev,
      [booking.id]: {
        status: 'Cancelled',
        message: `Trip cancelled. Estimated cancellation charge: ₹${charge.toLocaleString('en-IN')}. Estimated refund: ₹${refund.toLocaleString('en-IN')}.`,
      },
    }));
    addNotification('Trip cancellation confirmed', `Trip ${booking.trip_route} has been marked as cancelled. Estimated refund: ₹${refund.toLocaleString('en-IN')}.`, 'danger');
    setHelpOpen(false);
  };

  const currentScenario = selectedBooking && selectedCategory ? buildDisruptionScenario(selectedCategory, selectedBooking.trip_route) : null;
  const currentAlternatives = selectedBooking && selectedCategory ? buildAlternativeOptions(selectedCategory, selectedBooking.trip_route) : [];

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-2">My Trips</h1>
      <p className="text-gray-500 mb-8">View your booked trips, trip status, and emergency support</p>

      {lastBooking && (
        <div className="mb-6 rounded-2xl bg-gradient-to-br from-success-500 to-success-600 p-6 text-white shadow-xl animate-fade-up">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 text-4xl">🎉</div>
            <div className="flex-1">
              <h2 className="text-xl font-bold">Payment Successful!</h2>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div><span className="text-success-100">Payment ID:</span> <span className="font-mono font-semibold">{lastBooking.paymentId}</span></div>
                <div><span className="text-success-100">Booking ID:</span> <span className="font-mono font-semibold">{lastBooking.bookingCode}</span></div>
                <div><span className="text-success-100">Trip:</span> <span className="font-semibold">{lastBooking.tripRoute}</span></div>
                <div><span className="text-success-100">Amount Paid:</span> <span className="font-semibold">{formatINR(lastBooking.amount)}</span></div>
                <div><span className="text-success-100">Payment Method:</span> <span className="font-semibold">{lastBooking.paymentMethod}</span></div>
                <div><span className="text-success-100">Status:</span> <span className="font-bold">CONFIRMED</span></div>
              </div>
              <div className="mt-4 flex gap-3">
                <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-success-700 hover:bg-success-50 transition-all">
                  <Download className="h-4 w-4" /> Download Receipt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm border border-gray-100">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100 text-primary-700">
            <Bell className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-400">Notifications</p>
            <p className="text-sm font-semibold text-gray-900">{notificationCount} unread</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="badge bg-green-100 text-green-700">🟢 Trip Confirmed</span>
          <span className="badge bg-yellow-100 text-yellow-700">🟡 Delayed</span>
          <span className="badge bg-red-100 text-red-700">🔴 Cancelled</span>
          <span className="badge bg-orange-100 text-orange-700">🟠 Action Required</span>
        </div>
      </div>

      {lastNotification && (
        <div className="mb-6 rounded-2xl border border-primary-100 bg-primary-50 px-4 py-3 text-sm text-primary-800 shadow-sm">
          <span className="font-semibold">Latest update:</span> {lastNotification}
        </div>
      )}

      <div className="mb-8">        <div className="mb-3 flex justify-end">
          <button
            onClick={() => navigate('/map-weather')}
            className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
          >
            Map & Weather
          </button>
        </div>        <LiveMapWeather destinations={liveTripDestinations} showUserLocation title="Map & Weather" />
      </div>

      {bookings.length === 0 ? (
        <div className="mb-6 rounded-2xl border border-dashed border-primary-200 bg-primary-50 p-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-700">Demo trip loaded</p>
          <p className="mt-2 text-gray-600">No live bookings are connected in this environment, so a sample active trip is shown to demonstrate the emergency workflow.</p>
        </div>
      ) : null}

      <div className="space-y-4">
          {visibleBookings.map((b) => {
            const alert = tripAlerts[b.id];
            const status = b.status === 'Cancelled' ? 'Cancelled' : alert?.status || 'Confirmed';
            const statusClass = getStatusBadgeColor(status);

            return (
              <div key={b.id} className="card p-6">
                {alert && (
                  <div className="mb-4 rounded-2xl border border-yellow-200 bg-yellow-50 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-yellow-700">⚠️ Trip Alert</p>
                        <h3 className="mt-2 text-lg font-bold text-yellow-900">{alert.message}</h3>
                      </div>
                      <button
                        onClick={() => openHelp(b)}
                        className="btn-secondary px-3 py-2 text-sm bg-white"
                      >
                        View Solution
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className={`badge ${statusClass}`}>
                        {status === 'Confirmed' ? '🟢 Trip Confirmed' : status === 'Delayed' ? '🟡 Delayed' : status === 'Cancelled' ? '🔴 Cancelled' : '🟠 Action Required'}
                      </span>
                      <span className="text-xs text-gray-400">·</span>
                      <span className="text-xs font-mono text-gray-500">{b.booking_code}</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">{b.trip_route}</h3>
                    <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                      <div className="flex items-center gap-1.5 text-gray-600"><Users className="h-4 w-4 text-primary-600" /> {b.travellers} travellers</div>
                      <div className="flex items-center gap-1.5 text-gray-600"><Calendar className="h-4 w-4 text-primary-600" /> {formatDate(b.start_date)}</div>
                      <div className="flex items-center gap-1.5 text-gray-600"><Hotel className="h-4 w-4 text-primary-600" /> {b.hotel}</div>
                      <div className="flex items-center gap-1.5 text-gray-600"><Car className="h-4 w-4 text-primary-600" /> {b.transport}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-2xl font-extrabold text-primary-700">{formatINR(b.total_payable)}</p>
                    {b.payment && (
                      <p className="text-xs text-gray-500 mt-1">{b.payment.payment_method} · {b.payment.payment_mode} mode</p>
                    )}
                    <div className="mt-3 flex flex-wrap justify-end gap-2">
                      <button onClick={() => openHelp(b)} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-md hover:shadow-lg">
                        <ShieldAlert className="h-4 w-4" /> Trip Help / Emergency Assistance
                      </button>
                      <button onClick={() => window.print()} className="inline-flex items-center gap-1 text-sm font-semibold text-primary-600 hover:text-primary-700">
                        <Receipt className="h-4 w-4" /> Receipt
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      {helpOpen && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[28px] bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary-600">Trip Help / Emergency Assistance</p>
                <h2 className="mt-2 text-2xl font-extrabold text-gray-900">{selectedBooking.trip_route}</h2>
              </div>
              <button onClick={() => setHelpOpen(false)} className="rounded-full bg-gray-100 p-2 text-gray-600 hover:bg-gray-200">
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            {!selectedCategory ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {tripHelpCategories.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => {
                      setSelectedCategory(option.id);
                      applyDisruption(option.id, selectedBooking);
                    }}
                    className="rounded-2xl border border-gray-200 bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-lg"
                  >
                    <div className="mb-3 text-3xl">{option.emoji}</div>
                    <h3 className="text-lg font-bold text-gray-900">{option.label}</h3>
                    <p className="mt-2 text-sm text-gray-500">{option.description}</p>
                  </button>
                ))}
              </div>
            ) : currentScenario ? (
              <div className="space-y-6">
                <div className="rounded-2xl bg-gradient-to-r from-primary-600 to-accent-500 p-5 text-white">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-primary-100">{currentScenario.title}</p>
                      <h3 className="mt-2 text-2xl font-bold">{selectedBooking.trip_route}</h3>
                    </div>
                    <div className="rounded-full bg-white/10 p-3">
                      {selectedCategory === 'emergency' ? <Siren className="h-6 w-6" /> : <AlertCircle className="h-6 w-6" />}
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-primary-50">{currentScenario.description}</p>
                </div>

                {(selectedCategory === 'flight' || selectedCategory === 'train') && (
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-500">Original</p>
                      <p className="mt-2 text-lg font-bold text-gray-900">{currentScenario.originalTime}</p>
                    </div>
                    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-500">Updated</p>
                      <p className="mt-2 text-lg font-bold text-gray-900">{currentScenario.updatedTime}</p>
                    </div>
                    <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-4">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-yellow-700">Delay Duration</p>
                      <p className="mt-2 text-lg font-bold text-yellow-900">{currentScenario.delayDuration}</p>
                    </div>
                    <div className="rounded-2xl border border-primary-200 bg-primary-50 p-4">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary-700">Destination</p>
                      <p className="mt-2 text-lg font-bold text-primary-900">{currentScenario.destination}</p>
                    </div>
                  </div>
                )}

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl border border-gray-200 bg-white p-4">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Hotel className="h-4 w-4 text-primary-600" />
                      <span className="text-sm font-semibold">Hotel check-in impact</span>
                    </div>
                    <p className="mt-3 text-sm text-gray-600">{currentScenario.hotelCheckInImpact}</p>
                  </div>
                  <div className="rounded-2xl border border-gray-200 bg-white p-4">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Car className="h-4 w-4 text-primary-600" />
                      <span className="text-sm font-semibold">Transport impact</span>
                    </div>
                    <p className="mt-3 text-sm text-gray-600">{currentScenario.transportImpact}</p>
                  </div>
                  <div className="rounded-2xl border border-gray-200 bg-white p-4">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Clock3 className="h-4 w-4 text-primary-600" />
                      <span className="text-sm font-semibold">Suggested next actions</span>
                    </div>
                    <ul className="mt-3 space-y-2 text-sm text-gray-600">
                      {currentScenario.actions.map((item) => (
                        <li key={item}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {selectedCategory === 'cancel' && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
                    <div className="flex items-center gap-3 text-red-700">
                      <ShieldAlert className="h-5 w-5" />
                      <h3 className="text-lg font-bold">Cancellation Policy</h3>
                    </div>
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <div className="rounded-xl bg-white p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-gray-500">Trip Amount</p>
                        <p className="mt-2 text-2xl font-extrabold text-gray-900">₹{selectedBooking.total_payable.toLocaleString('en-IN')}</p>
                      </div>
                      <div className="rounded-xl bg-white p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-gray-500">Estimated Cancellation Charge</p>
                        <p className="mt-2 text-2xl font-extrabold text-red-600">₹{Math.round(selectedBooking.total_payable * 0.08).toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                    <div className="mt-4 rounded-xl bg-white p-4">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Why do you want to cancel?</label>
                      <select value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} className="input-field">
                        <option>Emergency</option>
                        <option>Personal Reason</option>
                        <option>Medical/Family Emergency</option>
                        <option>Change of Plans</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div className="mt-5 flex flex-wrap gap-3">
                      <button onClick={() => handleCancelTrip(selectedBooking)} className="btn-primary bg-red-600 hover:bg-red-700">
                        <Check className="h-4 w-4" /> Confirm Cancellation
                      </button>
                      <button onClick={() => setHelpOpen(false)} className="btn-secondary">Keep My Trip</button>
                    </div>
                  </div>
                )}

                {selectedCategory === 'emergency' && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
                    <div className="flex items-center gap-3 text-red-700">
                      <Siren className="h-5 w-5" />
                      <h3 className="text-lg font-bold">Local Emergency Support</h3>
                    </div>
                    <ul className="mt-4 space-y-3 text-sm text-red-700">
                      {getEmergencyGuidance().map((item) => (
                        <li key={item}>• {item}</li>
                      ))}
                    </ul>
                    <div className="mt-5 flex gap-3">
                      <button onClick={() => { addNotification('Immediate help guidance', 'Emergency guidance reviewed for your trip.', 'warning'); setHelpOpen(false); }} className="btn-primary bg-red-600 hover:bg-red-700">
                        Review Assistance
                      </button>
                      <button onClick={() => setHelpOpen(false)} className="btn-secondary">Close</button>
                    </div>
                  </div>
                )}

                {(selectedCategory === 'flight' || selectedCategory === 'train' || selectedCategory === 'hotel') && currentAlternatives.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-gray-900">
                      <AlertCircle className="h-5 w-5 text-primary-600" />
                      <h3 className="text-lg font-bold">Suggested alternatives</h3>
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                      {currentAlternatives.map((alt) => (
                        <div key={alt.id} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                          <div className="flex items-center justify-between gap-3">
                            <span className="rounded-full bg-primary-50 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-primary-700">{alt.provider}</span>
                            <span className="text-xs text-gray-500">{alt.status === 'demo' ? 'Demo/Estimated Option' : 'Estimated'}</span>
                          </div>
                          <h4 className="mt-3 text-lg font-bold text-gray-900">{alt.optionType}</h4>
                          <p className="mt-2 text-sm text-gray-600">{alt.summary}</p>
                          <div className="mt-4 space-y-2 text-sm text-gray-600">
                            <p><strong>Departure:</strong> {alt.departureTime}</p>
                            <p><strong>Arrival:</strong> {alt.arrivalTime}</p>
                            <p><strong>Cost:</strong> ₹{alt.estimatedCost.toLocaleString('en-IN')}</p>
                          </div>
                          <button
                            onClick={() => handleSelectAlternative(selectedBooking, alt.optionType)}
                            className="mt-4 w-full rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
                          >
                            Select
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedAlternative && (
                  <div className="rounded-2xl border border-success-200 bg-success-50 p-4 text-success-800">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="font-semibold">Selected alternative: {selectedAlternative}</span>
                    </div>
                    <p className="mt-2 text-sm">Your itinerary has been updated and a notification has been sent.</p>
                  </div>
                )}

                {selectedCategory !== 'cancel' && selectedCategory !== 'emergency' && (
                  <div className="flex flex-wrap gap-3">
                    <button onClick={() => handleSelectAlternative(selectedBooking, 'Updated My Trip')} className="btn-primary">
                      <Check className="h-4 w-4" /> Update My Trip
                    </button>
                    <button onClick={() => setHelpOpen(false)} className="btn-secondary">Close</button>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
