import { useState, useEffect, useRef } from 'react';
import { navigate } from '@/lib/router';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { searchDestinations, reverseGeocode, detectCurrentLocation, generatePlans } from '@/lib/api';
import type { Destination, TripFormData, Plan } from '@/types';
import {
  MapPin, Navigation, Search, Plus, X, Loader2, ChevronLeft, ChevronRight,
  Check, Plane, Users, Calendar, Wallet, Hotel, Car, Cloud, Mountain, Utensils,
  Activity, Gauge, MessageSquare, Sparkles, AlertCircle, CheckCircle2
} from 'lucide-react';

const TOTAL_STEPS = 16;

const STEP_LABELS = [
  'Starting Location', 'Destination', 'Multiple Destinations', 'Travellers', 'Travel Days',
  'Travel Date', 'Budget', 'Hotel', 'Transport', 'Weather', 'Location Type',
  'Travel Type', 'Food', 'Activities', 'Travel Pace', 'Special Requirements',
];

const OPTIONS = {
  hotel: ['Budget', '2 Star', '3 Star', '4 Star', '5 Star', 'Luxury', 'Resort', 'Hostel', 'Homestay', 'Eco Stay', 'No Preference'],
  room: ['Single', 'Double', 'Twin', 'Family', 'Suite'],
  transport: ['Flight', 'Train', 'Bus', 'Car', 'Cab', 'Bike/Scooter', 'No Preference'],
  weather: ['Sunny', 'Pleasant', 'Cold', 'Rainy', 'Snowy', 'Mountain Weather', 'Tropical', 'Spring', 'Autumn', 'No Preference'],
  locationType: ['Mountains', 'Beaches', 'Nature', 'Historical', 'Religious', 'City', 'Adventure', 'Wildlife', 'Scenic', 'Food & Culture', 'Shopping', 'Peaceful', 'Hidden Gems', 'Nightlife'],
  travelType: ['Solo', 'Couple', 'Family', 'Friends', 'Students', 'Senior Citizens', 'Group'],
  food: ['Vegetarian', 'Jain', 'Vegan', 'Non-Vegetarian', 'No Preference'],
  activities: ['Trekking', 'Adventure', 'Sightseeing', 'Shopping', 'Photography', 'Nature', 'Historical', 'Culture', 'Nightlife', 'Relaxation', 'Wildlife', 'Water Sports', 'Spiritual'],
  pace: ['Relaxed', 'Balanced', 'Fast-paced', 'Adventure-packed'],
};

const emptyForm: TripFormData = {
  startLocation: null,
  destinations: [],
  adults: 2,
  children: 0,
  totalTravellers: 2,
  days: 5,
  nights: 4,
  startDate: '',
  endDate: '',
  budget: 30000,
  hotelPreference: '3 Star',
  roomType: 'Double',
  transportPreference: 'No Preference',
  weatherPreference: 'No Preference',
  locationTypes: [],
  travelType: 'Family',
  foodPreference: 'No Preference',
  activities: [],
  travelPace: 'Balanced',
  specialRequirements: '',
};

export function Planner() {
  const { user } = useAuth();
  const [form, setForm] = useState<TripFormData>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [autoDestination, setAutoDestination] = useState(false);
  const [startQuery, setStartQuery] = useState('');
  const [startResults, setStartResults] = useState<Destination[]>([]);
  const [startSearching, setStartSearching] = useState(false);
  const [destinationQuery, setDestinationQuery] = useState('');
  const [destinationResults, setDestinationResults] = useState<Destination[]>([]);
  const [destinationSearching, setDestinationSearching] = useState(false);
  const [manualLocation, setManualLocation] = useState(false);
  const [manualCity, setManualCity] = useState('');

  const startSearchTimer = useRef<ReturnType<typeof setTimeout>>();
  const destinationSearchTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const reelDestination = sessionStorage.getItem('reelDestination');
    if (!reelDestination) return;

    const metadata = sessionStorage.getItem('reelDestinationMeta');
    const parsedMeta = metadata ? JSON.parse(metadata) : {};

    const destination: Destination = {
      name: reelDestination,
      city: reelDestination,
      state: '',
      country: 'India',
      country_code: 'IN',
      latitude: null,
      longitude: null,
      place_id: `reel-${reelDestination.toLowerCase().replace(/\s+/g, '-')}`,
    };

    setForm((prev) => ({
      ...prev,
      destinations: [destination],
      locationTypes: parsedMeta.category ? [parsedMeta.category] : prev.locationTypes,
    }));

    sessionStorage.removeItem('reelDestination');
    sessionStorage.removeItem('reelDestinationMeta');
  }, []);

  const updateForm = (partial: Partial<TripFormData>) => {
    setForm((prev) => ({ ...prev, ...partial }));
  };

  const recommendedDestinations = [
    'Himachal Pradesh',
    'Goa',
    'Rajasthan',
    'Kerala',
    'Meghalaya',
    'Bali',
  ].filter((dest) => {
    if (!form.startLocation) return true;
    if (form.weatherPreference === 'Cold') return dest.includes('Himachal') || dest.includes('Rajasthan');
    if (form.weatherPreference === 'Rainy') return dest.includes('Kerala') || dest.includes('Meghalaya');
    if (form.weatherPreference === 'Warm') return dest.includes('Goa') || dest.includes('Kerala');
    return true;
  });

  const handleDetectLocation = async () => {
    setError('');
    try {
      const { lat, lng } = await detectCurrentLocation();
      const location = await reverseGeocode(lat, lng);
      if (location) {
        updateForm({ startLocation: location });
      } else {
        setManualLocation(true);
      }
    } catch (err: any) {
      setError(err.message || 'Could not determine your location.');
      setManualLocation(true);
    }
  };

  const handleStartSearch = (query: string) => {
    setStartQuery(query);
    if (startSearchTimer.current) clearTimeout(startSearchTimer.current);
    if (query.trim().length < 2) {
      setStartResults([]);
      return;
    }
    setStartSearching(true);
    startSearchTimer.current = setTimeout(async () => {
      const results = await searchDestinations(query);
      setStartResults(results);
      setStartSearching(false);
    }, 300);
  };

  const handleDestinationSearch = (query: string) => {
    setDestinationQuery(query);
    if (destinationSearchTimer.current) clearTimeout(destinationSearchTimer.current);
    if (query.trim().length < 2) {
      setDestinationResults([]);
      return;
    }
    setDestinationSearching(true);
    destinationSearchTimer.current = setTimeout(async () => {
      const results = await searchDestinations(query);
      setDestinationResults(results);
      setDestinationSearching(false);
    }, 300);
  };

  const handleAddDestination = (dest: Destination) => {
    setDestinationQuery('');
    setDestinationResults([]);
    setForm((prev) => {
      const exists = prev.destinations.some((value) => value.name === dest.name && value.country === dest.country);
      if (exists) return prev;
      return { ...prev, destinations: [...prev.destinations, dest] };
    });
  };

  const handleRemoveDestination = (index: number) => {
    setForm((prev) => ({
      ...prev,
      destinations: prev.destinations.filter((_, idx) => idx !== index),
    }));
  };

  const handleManualLocationSubmit = () => {
    if (!manualCity.trim()) return;
    updateForm({
      startLocation: {
        name: manualCity,
        city: manualCity,
        state: '',
        country: '',
        country_code: '',
        latitude: null,
        longitude: null,
        place_id: '',
      },
    });
    setManualLocation(false);
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError('');

    try {
      if (!form.startLocation) {
        throw new Error('Please select your starting location first.');
      }
      if (!autoDestination && form.destinations.length === 0) {
        throw new Error('Please select a destination or enable AI destination recommendation.');
      }
      if (form.adults < 1) {
        throw new Error('At least one adult traveler is required.');
      }
      if (form.days < 1) {
        throw new Error('Please choose a valid trip duration.');
      }
      if (form.budget < 1) {
        throw new Error('Please enter a valid travel budget.');
      }

      const nights = Math.max(1, form.days - 1);
      const totalTravellers = form.adults + form.children;
      const finalForm = { ...form, nights, totalTravellers };

      const primaryDestination = form.destinations[0] ?? null;
      const isInternational = primaryDestination ? primaryDestination.country_code !== 'IN' : false;

      const { data: tripData, error: tripError } = await supabase.from('trips').insert({
        user_id: user?.id,
        title: `${form.destinations.map((d) => d.name).join(' → ') || 'AI Recommended Trip'}`,
        start_name: form.startLocation?.name || '',
        start_city: form.startLocation?.city || '',
        start_state: form.startLocation?.state || '',
        start_country: form.startLocation?.country || '',
        start_country_code: form.startLocation?.country_code || '',
        start_latitude: form.startLocation?.latitude || null,
        start_longitude: form.startLocation?.longitude || null,
        start_place_id: form.startLocation?.place_id || '',
        destinations: form.destinations,
        primary_country: primaryDestination?.country || '',
        primary_country_code: primaryDestination?.country_code || '',
        is_international: isInternational,
        adults: form.adults,
        children: form.children,
        total_travellers: totalTravellers,
        days: form.days,
        nights,
        start_date: form.startDate || null,
        end_date: form.endDate || null,
        budget: form.budget,
        hotel_preference: form.hotelPreference,
        room_type: form.roomType,
        transport_preference: form.transportPreference,
        weather_preference: form.weatherPreference,
        location_types: form.locationTypes,
        travel_type: form.travelType,
        food_preference: form.foodPreference,
        activities: form.activities,
        travel_pace: form.travelPace,
        special_requirements: form.specialRequirements,
        status: 'planning',
      }).select('id').single();

      if (tripError) throw new Error(tripError.message);

      sessionStorage.setItem('currentTripId', tripData.id);
      sessionStorage.setItem('currentTripForm', JSON.stringify(finalForm));
      navigate('/plans');
    } catch (err: any) {
      setError(err.message || 'Failed to generate travel plans.');
    } finally {
      setLoading(false);
    }
  };

  const summaryItems = [
    { label: 'Start', value: form.startLocation ? `${form.startLocation.city}${form.startLocation.country ? ', ' + form.startLocation.country : ''}` : 'Not selected' },
    { label: 'Destination', value: form.destinations.length > 0 ? form.destinations.map((d) => d.name).join(', ') : (autoDestination ? 'AI will decide' : 'Not selected') },
    { label: 'Duration', value: `${form.days} days` },
    { label: 'Travelers', value: `${form.adults + form.children} travelers` },
    { label: 'Budget', value: `₹${new Intl.NumberFormat('en-IN').format(form.budget)}` },
    { label: 'Hotel', value: form.hotelPreference },
    { label: 'Transport', value: form.transportPreference },
    { label: 'Weather', value: form.weatherPreference },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary-600">YatraAI travel planner</p>
        <h1 className="mt-3 text-3xl font-extrabold text-gray-900 md:text-5xl">✈️ Plan Your Perfect Trip</h1>
        <p className="mt-3 text-lg text-gray-600">Tell YatraAI about your travel preferences and our AI will create the best personalized trip plans for you.</p>
      </div>

      {error && (
        <div className="mb-6 flex items-start gap-2 rounded-2xl border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <section className="card p-5 md:p-6">
            <SectionHeader icon={Users} title="👤 Traveler Details" />
            <div className="grid gap-4 md:grid-cols-2">
              <CounterCard label="Adults" value={form.adults} onChange={(v) => updateForm({ adults: Math.max(1, v), totalTravellers: Math.max(1, v) + form.children })} min={1} max={20} />
              <CounterCard label="Children" value={form.children} onChange={(v) => updateForm({ children: Math.max(0, v), totalTravellers: form.adults + Math.max(0, v) })} min={0} max={20} />
            </div>

            <div className="mt-5">
              <label className="mb-2 block text-sm font-semibold text-gray-700">Starting City / Current Location</label>
              <button onClick={handleDetectLocation} className="mb-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-3 font-semibold text-white shadow-lg transition hover:bg-primary-700">
                <Navigation className="h-4 w-4" /> 📍 Use My Current Location
              </button>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  value={startQuery}
                  onChange={(e) => handleStartSearch(e.target.value)}
                  className="input-field pl-11"
                  placeholder="Search your current city"
                />
                {startSearching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-gray-400" />}
              </div>

              {startResults.length > 0 && (
                <div className="mt-3 space-y-2">
                  {startResults.map((dest, idx) => (
                    <button key={idx} onClick={() => { updateForm({ startLocation: dest }); setStartQuery(''); setStartResults([]); }} className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-left text-sm hover:border-primary-300 hover:bg-primary-50">
                      <p className="font-semibold text-gray-900">{dest.name}</p>
                      <p className="text-gray-500">{dest.city}, {dest.country}</p>
                    </button>
                  ))}
                </div>
              )}

              {manualLocation && (
                <div className="mt-4 rounded-xl border border-warning-200 bg-warning-50 p-4">
                  <p className="mb-2 text-sm text-warning-800">Location permission was denied. Enter city manually:</p>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <input value={manualCity} onChange={(e) => setManualCity(e.target.value)} className="input-field" placeholder="Enter city name" />
                    <button onClick={handleManualLocationSubmit} className="btn-primary">Set</button>
                  </div>
                </div>
              )}

              {form.startLocation && (
                <div className="mt-4 rounded-xl border border-success-200 bg-success-50 p-3 text-sm text-success-700">
                  <strong>Selected:</strong> {form.startLocation.city}{form.startLocation.state ? `, ${form.startLocation.state}` : ''}{form.startLocation.country ? `, ${form.startLocation.country}` : ''}
                </div>
              )}
            </div>
          </section>

          <section className="card p-5 md:p-6">
            <SectionHeader icon={MapPin} title="📍 Where Do You Want to Go?" />
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  value={destinationQuery}
                  onChange={(e) => handleDestinationSearch(e.target.value)}
                  className="input-field pl-11"
                  placeholder="Search for a destination"
                />
                {destinationSearching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-gray-400" />}
              </div>

              {destinationResults.length > 0 && (
                <div className="space-y-2">
                  {destinationResults.map((dest, idx) => (
                    <button key={idx} onClick={() => handleAddDestination(dest)} className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-left text-sm hover:border-primary-300 hover:bg-primary-50">
                      <p className="font-semibold text-gray-900">{dest.name}</p>
                      <p className="text-gray-500">{dest.city}, {dest.country}</p>
                    </button>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap gap-2 text-sm">
                <label className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-2 font-medium text-gray-700">
                  <input type="checkbox" checked={autoDestination} onChange={(e) => setAutoDestination(e.target.checked)} className="h-4 w-4 text-primary-600" />
                  ✨ Let YatraAI choose the best destination for me
                </label>
              </div>

              <div className="rounded-2xl border border-dashed border-primary-200 bg-primary-50 p-4">
                <p className="mb-2 text-sm font-semibold text-primary-700">Country selection</p>
                <div className="flex flex-wrap gap-2">
                  {['India', 'International'].map((option) => (
                    <button key={option} onClick={() => updateForm({ destinations: form.destinations })} className={`rounded-full px-3 py-2 text-sm font-semibold ${option === 'India' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700'}`}>
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              {form.destinations.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-gray-700">Selected destinations</p>
                  {form.destinations.map((dest, idx) => (
                    <div key={`${dest.name}-${idx}`} className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-3">
                      <div>
                        <p className="font-semibold text-gray-900">{dest.name}</p>
                        <p className="text-sm text-gray-500">{dest.city}, {dest.country}</p>
                      </div>
                      <button onClick={() => handleRemoveDestination(idx)} className="text-error-600 hover:text-error-700">Remove</button>
                    </div>
                  ))}
                </div>
              )}

              {autoDestination && (
                <div className="rounded-2xl border border-accent-200 bg-accent-50 p-4">
                  <p className="text-sm font-semibold text-accent-700">Based on your preferences, YatraAI recommends:</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {recommendedDestinations.map((place) => (
                      <button key={place} onClick={() => handleAddDestination({ name: place, city: place, state: '', country: 'India', country_code: 'IN', latitude: null, longitude: null, place_id: '' })} className="rounded-full bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:text-primary-700">
                        {place}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          <section className="card p-5 md:p-6">
            <SectionHeader icon={Calendar} title="📅 When Are You Traveling?" />
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">Start Date</label>
                <input type="date" value={form.startDate} onChange={(e) => { const value = e.target.value; updateForm({ startDate: value }); if (value) { const d = new Date(value); d.setDate(d.getDate() + form.days - 1); updateForm({ endDate: d.toISOString().split('T')[0] }); } }} className="input-field" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">End Date</label>
                <input type="date" value={form.endDate} readOnly className="input-field bg-gray-50" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">Number of Days</label>
                <input type="number" min={1} max={90} value={form.days} onChange={(e) => { const value = Math.max(1, Number(e.target.value || 1)); updateForm({ days: value, nights: value - 1 }); if (form.startDate) { const d = new Date(form.startDate); d.setDate(d.getDate() + value - 1); updateForm({ endDate: d.toISOString().split('T')[0] }); } }} className="input-field" />
              </div>
            </div>
          </section>

          <section className="card p-5 md:p-6">
            <SectionHeader icon={Wallet} title="💰 Your Travel Budget" />
            <div className="space-y-4">
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-semibold text-gray-700">Total Budget</label>
                  <span className="text-2xl font-extrabold text-primary-600">₹{new Intl.NumberFormat('en-IN').format(form.budget)}</span>
                </div>
                <input type="range" min={5000} max={300000} step={5000} value={form.budget} onChange={(e) => updateForm({ budget: Number(e.target.value) })} className="w-full accent-primary-600" />
              </div>

              <div className="flex flex-wrap gap-2">
                {['Low Budget', 'Medium Budget', 'Premium', 'Luxury'].map((budgetType) => (
                  <button key={budgetType} onClick={() => updateForm({ budget: budgetType === 'Low Budget' ? 15000 : budgetType === 'Medium Budget' ? 30000 : budgetType === 'Premium' ? 60000 : 100000 })} className="rounded-full bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-primary-50 hover:text-primary-700">
                    {budgetType}
                  </button>
                ))}
              </div>

              <p className="rounded-xl border border-primary-200 bg-primary-50 p-3 text-sm text-primary-700">Your maximum budget: ₹{new Intl.NumberFormat('en-IN').format(form.budget)}</p>
            </div>
          </section>

          <section className="card p-5 md:p-6">
            <SectionHeader icon={Hotel} title="🏨 Hotel Preference" />
            <OptionGrid options={OPTIONS.hotel} value={form.hotelPreference} onChange={(v) => updateForm({ hotelPreference: v })} columns={3} />
            <div className="mt-4">
              <label className="mb-2 block text-sm font-semibold text-gray-700">Room Type</label>
              <OptionGrid options={OPTIONS.room} value={form.roomType} onChange={(v) => updateForm({ roomType: v })} columns={3} />
            </div>
          </section>

          <section className="card p-5 md:p-6">
            <SectionHeader icon={Car} title="🚆 How Do You Want to Travel?" />
            <OptionGrid options={OPTIONS.transport} value={form.transportPreference} onChange={(v) => updateForm({ transportPreference: v })} columns={2} />
          </section>

          <section className="card p-5 md:p-6">
            <SectionHeader icon={Cloud} title="🌤️ What Kind of Weather Do You Prefer?" />
            <OptionGrid options={OPTIONS.weather} value={form.weatherPreference} onChange={(v) => updateForm({ weatherPreference: v })} columns={3} />
          </section>

          <section className="card p-5 md:p-6">
            <SectionHeader icon={Sparkles} title="🎒 What Type of Trip Do You Like?" />
            <MultiSelectGrid options={OPTIONS.locationType} selected={form.locationTypes} onChange={(v) => updateForm({ locationTypes: v })} columns={3} />
          </section>

          <section className="card p-5 md:p-6">
            <SectionHeader icon={Gauge} title="⏱️ What Travel Pace Do You Prefer?" />
            <OptionGrid options={OPTIONS.pace} value={form.travelPace} onChange={(v) => updateForm({ travelPace: v })} columns={3} />
          </section>

          <section className="card p-5 md:p-6">
            <SectionHeader icon={MessageSquare} title="📝 Additional Requirements" />
            <textarea value={form.specialRequirements} onChange={(e) => updateForm({ specialRequirements: e.target.value })} className="input-field min-h-[120px] resize-y" placeholder="Tell us anything else about your trip..." />
            <div className="mt-4 flex flex-wrap gap-2">
              {['I want less crowded places.', 'I want local food.', 'I want family-friendly activities.', 'I want hidden destinations.', 'I want photography locations.'].map((example) => (
                <button key={example} onClick={() => updateForm({ specialRequirements: form.specialRequirements ? `${form.specialRequirements} ${example}` : example })} className="rounded-full bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-primary-50 hover:text-primary-700">{example}</button>
              ))}
            </div>
          </section>

          <button onClick={handleGenerate} disabled={loading} className="btn-accent w-full py-4 text-lg">
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
            {loading ? 'Generating My Travel Plans...' : '🤖 Generate My Travel Plans'}
          </button>
        </div>

        <aside className="lg:sticky lg:top-24 h-fit">
          <div className="card p-5 md:p-6">
            <p className="mb-4 text-lg font-extrabold text-gray-900">Your Trip Summary</p>
            <div className="space-y-3">
              {summaryItems.map((item) => (
                <div key={item.label} className="flex items-center justify-between gap-3 rounded-xl bg-gray-50 px-3 py-2">
                  <span className="text-sm font-medium text-gray-500">{item.label}</span>
                  <span className="text-right text-sm font-semibold text-gray-800">{item.value}</span>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-2xl bg-gradient-to-br from-primary-600 to-accent-500 p-4 text-white">
              <p className="text-sm uppercase tracking-[0.2em] text-primary-100">AI Insight</p>
              <p className="mt-2 text-lg font-bold">{form.startLocation ? `${form.startLocation.city} → ${form.destinations[0]?.name || 'AI Recommended Destination'}` : 'Select your starting point'}</p>
              <p className="mt-2 text-sm text-primary-50">{form.travelPace} pace · {form.hotelPreference} stay · {form.transportPreference} travel</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function SectionHeader({ icon: Icon, title }: { icon: any; title: string }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100 text-primary-700">
        <Icon className="h-5 w-5" />
      </div>
      <h2 className="text-xl font-bold text-gray-900">{title}</h2>
    </div>
  );
}

function CounterCard({ label, value, onChange, min, max }: { label: string; value: number; onChange: (v: number) => void; min: number; max: number }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
      <p className="mb-3 text-sm font-semibold text-gray-700">{label}</p>
      <div className="flex items-center justify-center gap-4">
        <button type="button" onClick={() => onChange(value - 1)} disabled={value <= min} className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-xl font-bold text-gray-700 shadow-sm disabled:opacity-40">−</button>
        <span className="w-10 text-center text-3xl font-extrabold text-primary-600">{value}</span>
        <button type="button" onClick={() => onChange(value + 1)} disabled={value >= max} className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-xl font-bold text-primary-700 disabled:opacity-40">+</button>
      </div>
    </div>
  );
}

function OptionGrid({ options, value, onChange, columns = 3 }: { options: string[]; value: string; onChange: (v: string) => void; columns?: number }) {
  const gridCols = columns === 2 ? 'sm:grid-cols-2' : columns === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-4';

  return (
    <div className={`grid grid-cols-2 ${gridCols} gap-3`}>
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={`rounded-xl px-3 py-3 text-sm font-semibold transition ${value === option ? 'bg-primary-600 text-white shadow-lg ring-2 ring-primary-200' : 'bg-gray-100 text-gray-700 hover:bg-primary-50 hover:text-primary-700'}`}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

function MultiSelectGrid({ options, selected, onChange, columns = 3 }: { options: string[]; selected: string[]; onChange: (v: string[]) => void; columns?: number }) {
  const gridCols = columns === 2 ? 'sm:grid-cols-2' : columns === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-4';

  const toggle = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter((item) => item !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  return (
    <div className={`grid grid-cols-2 ${gridCols} gap-3`}>
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => toggle(option)}
          className={`flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold transition ${selected.includes(option) ? 'bg-primary-600 text-white shadow-lg ring-2 ring-primary-200' : 'bg-gray-100 text-gray-700 hover:bg-primary-50 hover:text-primary-700'}`}
        >
          {selected.includes(option) && <Check className="h-4 w-4" />} {option}
        </button>
      ))}
    </div>
  );
}
