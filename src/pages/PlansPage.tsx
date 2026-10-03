import { useEffect, useState } from 'react';
import { navigate } from '@/lib/router';
import { generatePlans } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import type { TripFormData, Plan } from '@/types';
import { formatINR } from '@/lib/format';
import { getDestImage } from '@/data/destImages';
import { Loader2, Sparkles, AlertCircle, Star, MapPin, Calendar, Wallet, Hotel, Car, TrendingUp, ChevronRight, CheckCircle2, XCircle } from 'lucide-react';

export function PlansPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [plans, setPlans] = useState<Plan[]>([]);
  const [formData, setFormData] = useState<TripFormData | null>(null);
  const [tripId, setTripId] = useState<string>('');

  useEffect(() => {
    (async () => {
      const stored = sessionStorage.getItem('currentTripForm');
      const storedTripId = sessionStorage.getItem('currentTripId');
      if (!stored || !storedTripId) {
        navigate('/planner');
        return;
      }
      const form = JSON.parse(stored) as TripFormData;
      setFormData(form);
      setTripId(storedTripId);

      try {
        const generatedPlans = await generatePlans(form);
        const savedPlans: Plan[] = [];

        // Save plans to database and keep their generated IDs for booking
        for (const plan of generatedPlans) {
          const { data } = await supabase.from('plans').insert({
            trip_id: storedTripId,
            user_id: user?.id,
            plan_name: plan.planName,
            description: plan.description,
            route: plan.route,
            num_locations: plan.numLocations,
            num_nights: plan.numNights,
            hotel: plan.hotel,
            transport: plan.transport,
            activities: plan.activities,
            weather: plan.weather,
            match_score: plan.matchScore,
            hotel_cost: plan.hotelCost,
            transport_cost: plan.transportCost,
            local_transport_cost: plan.localTransportCost,
            food_cost: plan.foodCost,
            activities_cost: plan.activitiesCost,
            misc_cost: plan.miscCost,
            total_cost: plan.totalCost,
            budget_remaining: plan.budgetRemaining,
            within_budget: plan.withinBudget,
            why_matches: plan.whyMatches,
          }).select('id').single();

          const savedPlan = data ? { ...plan, id: data.id } : plan;
          savedPlans.push(savedPlan);

          if (data) {
            for (const day of plan.itinerary) {
              await supabase.from('itinerary_days').insert({
                plan_id: data.id,
                user_id: user?.id,
                day_number: day.dayNumber,
                day_title: day.dayTitle,
                location: day.location,
                morning: day.morning,
                afternoon: day.afternoon,
                evening: day.evening,
                food: day.food,
                transport: day.transport,
                hotel: day.hotel,
                activities: day.activities,
                daily_cost: day.dailyCost,
                travel_tips: day.travelTips,
              });
            }
          }
        }

        // Store plans for other pages
        sessionStorage.setItem('generatedPlans', JSON.stringify(savedPlans));
        setPlans(savedPlans);
        setLoading(false);
      } catch (err: any) {
        setError(err.message || 'Failed to generate plans');
        setLoading(false);
      }
    })();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="relative">
          <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center shadow-xl">
            <Sparkles className="h-12 w-12 text-white animate-pulse" />
          </div>
          <Loader2 className="absolute -inset-2 h-28 w-28 animate-spin text-primary-300" style={{ animationDuration: '3s' }} />
        </div>
        <h2 className="mt-6 text-2xl font-bold text-gray-900">Generating Your AI Travel Plans...</h2>
        <p className="mt-2 text-gray-500 max-w-md text-center">Our AI engine is analyzing your destination, budget, and preferences to create 7 personalized plans with day-wise itineraries.</p>
        <div className="mt-6 space-y-2 text-sm text-gray-400">
          <p>✓ Detecting destination country</p>
          <p>✓ Applying country filter</p>
          <p>✓ Calculating budget breakdown</p>
          <p>✓ Generating day-wise itineraries</p>
          <p>✓ Validating plans against your budget</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <AlertCircle className="h-16 w-16 text-error-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Failed to Generate Plans</h2>
        <p className="text-gray-500 mt-2">{error}</p>
        <button onClick={() => navigate('/planner')} className="mt-6 btn-primary">Try Again</button>
      </div>
    );
  }

  if (!formData) return null;

  const isInternational = formData.destinations[0]?.country_code !== 'IN';

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Summary header */}
      <div className="mb-8 rounded-3xl bg-gradient-to-br from-primary-700 to-primary-600 p-6 md:p-8 shadow-xl text-white">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-5 w-5" />
          <span className="font-semibold text-primary-100">7 AI-Generated Travel Plans</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold">
          {formData.destinations.map((d) => d.name).join(' → ')}
        </h1>
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {isInternational ? 'International Trip' : 'India Trip'}</span>
          <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> {formData.days} Days / {formData.nights} Nights</span>
          <span className="flex items-center gap-1.5"><Wallet className="h-4 w-4" /> Budget: {formatINR(formData.budget)}</span>
          <span className="flex items-center gap-1.5"><Star className="h-4 w-4" /> {formData.totalTravellers} Travellers</span>
        </div>
        {isInternational ? (
          <p className="mt-3 text-sm text-primary-100">🌍 International destination — all plans are relevant to {formData.destinations[0]?.country} and nearby international destinations.</p>
        ) : (
          <p className="mt-3 text-sm text-primary-100">🇮🇳 Indian destination — all plans remain within India. No international destinations shown.</p>
        )}
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {plans.map((plan, idx) => (
          <PlanCard key={idx} plan={plan} budget={formData.budget} planNumber={idx + 1} onSelect={() => {
            sessionStorage.setItem('selectedPlan', JSON.stringify(plan));
            navigate('/plan-details');
          }} />
        ))}
      </div>

      {/* Compare CTA */}
      <div className="mt-8 text-center">
        <button onClick={() => navigate('/compare')} className="btn-secondary">
          <TrendingUp className="h-5 w-5" /> Compare All Plans
        </button>
      </div>
    </div>
  );
}

function PlanCard({ plan, budget, planNumber, onSelect }: { plan: Plan; budget: number; planNumber: number; onSelect: () => void }) {
  const isBest = plan.planName.startsWith('⭐');
  const withinBudget = plan.withinBudget;
  const heroDest = plan.route[0];
  const title = plan.planCategory || `Plan ${planNumber} – ${plan.route[0]}`;

  return (
    <div className={`card overflow-hidden relative ${isBest ? 'ring-2 ring-accent-400 shadow-lg' : ''} hover:-translate-y-1 transition-transform`}>
      {isBest && (
        <div className="absolute top-3 left-3 z-10 rounded-full bg-accent-500 px-3 py-1 text-xs font-bold text-white shadow-lg">
          ⭐ Best Match for You
        </div>
      )}
      <div className="relative h-40 overflow-hidden">
        <img src={getDestImage(heroDest)} alt={heroDest} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
          <div>
            <h3 className="text-lg font-bold text-white drop-shadow-lg">{title}</h3>
            <div className="flex items-center gap-1 text-white/90 text-xs mt-0.5">
              <MapPin className="h-3 w-3" /> {plan.route.join(' → ')}
            </div>
          </div>
          <div className="text-right">
            <div className={`text-2xl font-extrabold drop-shadow-lg ${plan.matchScore >= 85 ? 'text-success-400' : plan.matchScore >= 70 ? 'text-primary-300' : 'text-warning-300'}`}>
              {plan.matchScore}%
            </div>
            <p className="text-xs text-white/70">AI Match</p>
          </div>
        </div>
      </div>
      <div className="p-6">
        <p className="text-sm text-gray-500 mb-3">{plan.description}</p>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className="badge bg-primary-50 text-primary-700"><MapPin className="h-3 w-3" /> {plan.route.join(' → ')}</span>
          <span className="badge bg-gray-100 text-gray-700">{plan.numLocations} {plan.numLocations > 1 ? 'destinations' : 'destination'}</span>
          <span className="badge bg-gray-100 text-gray-700">{plan.numNights} nights</span>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Hotel className="h-4 w-4 text-primary-600" /> {plan.hotel}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Car className="h-4 w-4 text-primary-600" /> {plan.transport}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4 text-primary-600" /> {plan.weather}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Sparkles className="h-4 w-4 text-primary-600" /> {plan.activities.slice(0, 2).join(', ')}
          </div>
        </div>

        <div className="rounded-xl bg-gray-50 p-4 mb-4">
          <div className="space-y-1.5 text-sm">
            <BudgetRow label="Hotel" cost={plan.hotelCost} />
            <BudgetRow label="Transport" cost={plan.transportCost} />
            <BudgetRow label="Local Transport" cost={plan.localTransportCost} />
            <BudgetRow label="Food" cost={plan.foodCost} />
            <BudgetRow label="Activities" cost={plan.activitiesCost} />
            <BudgetRow label="Miscellaneous" cost={plan.miscCost} />
            <div className="border-t border-gray-200 pt-2 flex justify-between font-bold">
              <span>Total</span>
              <span className={withinBudget ? 'text-success-700' : 'text-error-600'}>{formatINR(plan.totalCost)}</span>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="text-gray-500">Budget: {formatINR(budget)}</span>
            {withinBudget ? (
              <span className="flex items-center gap-1 font-semibold text-success-600"><CheckCircle2 className="h-4 w-4" /> Within Budget ({formatINR(plan.budgetRemaining)} left)</span>
            ) : (
              <span className="flex items-center gap-1 font-semibold text-error-600"><XCircle className="h-4 w-4" /> Over Budget</span>
            )}
          </div>
        </div>

        <p className="text-xs text-gray-500 mb-4 italic">Why this matches: {plan.whyMatches}</p>

        <button onClick={onSelect} className="w-full btn-primary">
          View Full Plan <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

function BudgetRow({ label, cost }: { label: string; cost: number }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-600">{label}</span>
      <span className="font-semibold text-gray-900">{formatINR(cost)}</span>
    </div>
  );
}
