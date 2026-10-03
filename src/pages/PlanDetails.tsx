import { useState, useEffect } from 'react';
import { navigate } from '@/lib/router';
import type { Plan, TripFormData } from '@/types';
import { formatINR } from '@/lib/format';
import { getDestImage } from '@/data/destImages';
import {
  MapPin, Calendar, Hotel, Car, Sparkles, CheckCircle2, XCircle, Sun,
  Sunrise, Sunset, Utensils, Navigation, Lightbulb, ChevronLeft, Wallet,
  TrendingUp, Users, Star, ChevronDown, Plane, Train, Map, ShieldCheck
} from 'lucide-react';

export function PlanDetails() {
  const [plan, setPlan] = useState<Plan | null>(null);
  const [formData, setFormData] = useState<TripFormData | null>(null);
  const [openDay, setOpenDay] = useState<number | null>(0);

  useEffect(() => {
    const sp = sessionStorage.getItem('selectedPlan');
    const sf = sessionStorage.getItem('currentTripForm');
    if (sp) setPlan(JSON.parse(sp));
    if (sf) setFormData(JSON.parse(sf));
  }, []);

  if (!plan || !formData) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <p className="text-gray-500">No plan selected. Please generate plans first.</p>
        <button onClick={() => navigate('/planner')} className="mt-4 btn-primary">Plan a Trip</button>
      </div>
    );
  }

  const isBest = plan.planName.startsWith('⭐');
  const hotel = plan.hotelDetails || {
    hotelName: plan.hotel,
    hotelLocation: plan.route[0],
    hotelCategory: 'Estimated',
    roomType: formData.roomType || 'Double',
    checkIn: 'Day 1, 12:00 PM',
    checkOut: `Day ${plan.numNights + 1}, 11:00 AM`,
    approximatePricePerNight: Math.round(plan.hotelCost / Math.max(plan.numNights, 1)),
    numberOfNights: plan.numNights,
    estimatedHotelCost: plan.hotelCost,
    whyRecommended: plan.whyMatches,
  };
  const transportation = plan.transportation || {
    startingLocation: formData.startLocation?.city || 'Your city',
    destination: plan.route.join(' → '),
    recommendedMode: plan.transport,
    approximateDuration: 'Estimated duration based on route',
    estimatedCost: plan.transportCost,
    localTransportation: 'Cab / local transport',
    airportOrStationTransfer: 'Included in package estimate',
    notes: 'Estimated transport pricing based on your preferences and distance.',
  };
  const budgetBreakdown = plan.budgetBreakdown || {
    transportation: plan.transportCost,
    hotel: plan.hotelCost,
    food: plan.foodCost,
    localTravel: plan.localTransportCost,
    activities: plan.activitiesCost,
    shopping: Math.round(plan.miscCost * 0.4),
    miscellaneous: Math.round(plan.miscCost * 0.6),
    total: plan.totalCost,
  };
  const itinerary = plan.dayWiseItinerary?.length ? plan.dayWiseItinerary : plan.itinerary.map((day, index) => ({
    dayNumber: day.dayNumber,
    dayTitle: day.dayTitle,
    summary: day.morning,
    startPoint: formData.startLocation?.city || 'Your city',
    recommendedTransport: day.transport,
    departureInfo: 'Departure as per travel schedule',
    arrivalInfo: 'Arrival as per plan schedule',
    hotelName: hotel.hotelName,
    roomType: hotel.roomType,
    checkIn: hotel.checkIn,
    checkOut: hotel.checkOut,
    breakfast: day.food,
    lunch: day.food,
    dinner: day.food,
    eveningSnack: 'Local snack and coffee',
    placesToVisit: day.activities,
    activities: day.activities,
    approximateTimings: ['08:00 AM – Breakfast', '10:00 AM – Sightseeing', '06:00 PM – Evening activity'],
    localTransport: day.transport,
    estimatedExpenses: { food: day.dailyCost * 0.2, localTravel: day.dailyCost * 0.15, activities: day.dailyCost * 0.35, total: day.dailyCost },
    eveningActivity: day.evening,
    overnightStay: day.hotel,
    detailedSchedule: [day.morning, day.afternoon, day.evening],
  }));

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
      <button onClick={() => navigate('/plans')} className="mb-6 flex items-center gap-1 text-primary-600 font-semibold hover:text-primary-700">
        <ChevronLeft className="h-5 w-5" /> Back to All Plans
      </button>

      <div className="relative rounded-3xl mb-6 shadow-xl overflow-hidden">
        <img src={getDestImage(plan.route[0])} alt={plan.route[0]} className="absolute inset-0 h-full w-full object-cover" />
        <div className={`absolute inset-0 ${isBest ? 'bg-gradient-to-br from-accent-600/90 to-accent-500/80' : 'bg-gradient-to-br from-primary-900/90 to-primary-700/80'}`} />
        <div className="relative p-6 md:p-8 text-white">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              {isBest && <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-bold mb-3">⭐ Best Match for You</span>}
              <h1 className="text-2xl md:text-3xl font-extrabold">{plan.planName}</h1>
              <p className="mt-2 text-white/90">{plan.detailedOverview || plan.description}</p>
            </div>
            <div className="flex-shrink-0 text-center ml-4">
              <div className="text-4xl font-extrabold">{plan.matchScore}%</div>
              <p className="text-xs text-white/80">AI Match</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {plan.route.join(' → ')}</span>
            <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> {plan.totalNumberOfDays || plan.numNights + 1} Days / {plan.totalNumberOfNights || plan.numNights} Nights</span>
            <span className="flex items-center gap-1.5"><Users className="h-4 w-4" /> {formData.totalTravellers} Travellers</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <section className="card p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Plan Overview</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <InfoBox label="Destination" value={plan.destination || plan.route.join(' → ')} />
              <InfoBox label="Travel Style" value={plan.travelStyle || formData.travelPace} />
              <InfoBox label="Best Season" value={plan.bestSeason || plan.weather} />
              <InfoBox label="Recommended Travel Period" value={plan.recommendedTravelPeriod || 'Estimated based on weather and local conditions'} />
              <InfoBox label="Number of Travellers" value={`${plan.numberOfTravellers || formData.totalTravellers}`} />
              <InfoBox label="Estimated Budget" value={formatINR(plan.estimatedTotalBudget || plan.totalCost)} />
            </div>
          </section>

          <section className="card p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Hotel Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <InfoBox label="Hotel Name" value={hotel.hotelName} />
              <InfoBox label="Location" value={hotel.hotelLocation} />
              <InfoBox label="Category" value={hotel.hotelCategory} />
              <InfoBox label="Room Type" value={hotel.roomType} />
              <InfoBox label="Check-in" value={hotel.checkIn} />
              <InfoBox label="Check-out" value={hotel.checkOut} />
              <InfoBox label="Approx. Price/Night" value={formatINR(hotel.approximatePricePerNight)} />
              <InfoBox label="Number of Nights" value={`${hotel.numberOfNights}`} />
            </div>
            <div className="mt-4 rounded-xl bg-primary-50 p-4 text-sm text-primary-700">
              <strong>Why this hotel is recommended:</strong> {hotel.whyRecommended}
            </div>
          </section>

          <section className="card p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Transportation</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <InfoBox label="Starting Location" value={transportation.startingLocation} />
              <InfoBox label="Destination" value={transportation.destination} />
              <InfoBox label="Recommended Mode" value={transportation.recommendedMode} />
              <InfoBox label="Approx. Duration" value={transportation.approximateDuration} />
              <InfoBox label="Estimated Cost" value={formatINR(transportation.estimatedCost)} />
              <InfoBox label="Local Transport" value={transportation.localTransportation} />
            </div>
            <div className="mt-4 rounded-xl bg-gray-50 p-4 text-sm text-gray-700">
              <strong>Transfer details:</strong> {transportation.airportOrStationTransfer}<br />
              <strong>Notes:</strong> {transportation.notes}
            </div>
          </section>

          <section className="card p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Day-wise Itinerary</h2>
            <div className="space-y-3">
              {itinerary.map((day) => (
                <div key={day.dayNumber} className="rounded-2xl border border-gray-200 overflow-hidden bg-white">
                  <button
                    onClick={() => setOpenDay(openDay === day.dayNumber ? null : day.dayNumber)}
                    className="w-full flex items-center justify-between gap-3 p-4 text-left bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div>
                      <div className="text-xs font-semibold uppercase text-primary-600">Day {day.dayNumber}</div>
                      <div className="text-base font-bold text-gray-900">{day.dayTitle}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-gray-500">{day.location || plan.route[0]}</span>
                      <ChevronDown className={`h-5 w-5 text-gray-500 transition-transform ${openDay === day.dayNumber ? 'rotate-180' : ''}`} />
                    </div>
                  </button>

                  {openDay === day.dayNumber && (
                    <div className="p-4 md:p-5 space-y-5">
                      <div className="rounded-xl bg-primary-50 p-3 text-sm text-primary-700">{day.summary}</div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <InfoBox label="Start Point" value={day.startPoint} />
                        <InfoBox label="Recommended Transport" value={day.recommendedTransport} />
                        <InfoBox label="Departure Info" value={day.departureInfo} />
                        <InfoBox label="Arrival Info" value={day.arrivalInfo} />
                        <InfoBox label="Hotel" value={day.hotelName} />
                        <InfoBox label="Room Type" value={day.roomType} />
                        <InfoBox label="Check-in" value={day.checkIn} />
                        <InfoBox label="Check-out" value={day.checkOut} />
                      </div>

                      <div className="space-y-3 text-sm text-gray-700">
                        <div className="flex items-start gap-2"><Sunrise className="h-4 w-4 text-warning-600 mt-0.5" /><div><strong>Breakfast:</strong> {day.breakfast}</div></div>
                        <div className="flex items-start gap-2"><Sun className="h-4 w-4 text-accent-600 mt-0.5" /><div><strong>Lunch:</strong> {day.lunch}</div></div>
                        <div className="flex items-start gap-2"><Sunset className="h-4 w-4 text-primary-600 mt-0.5" /><div><strong>Dinner:</strong> {day.dinner}</div></div>
                        <div className="flex items-start gap-2"><Utensils className="h-4 w-4 text-success-600 mt-0.5" /><div><strong>Evening Snack:</strong> {day.eveningSnack}</div></div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Places to visit & activities</h4>
                        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                          {day.placesToVisit.map((place, idx) => <li key={idx}>{place}</li>)}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Detailed Schedule</h4>
                        <ul className="space-y-2 text-sm text-gray-700">
                          {day.detailedSchedule.map((item, idx) => (
                            <li key={idx} className="rounded-lg bg-gray-50 px-3 py-2">{item}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <InfoBox label="Local Transport" value={day.localTransport} />
                        <InfoBox label="Evening Activity" value={day.eveningActivity} />
                        <InfoBox label="Estimated Food" value={formatINR(day.estimatedExpenses.food)} />
                        <InfoBox label="Estimated Local Travel" value={formatINR(day.estimatedExpenses.localTravel)} />
                        <InfoBox label="Estimated Activities" value={formatINR(day.estimatedExpenses.activities)} />
                        <InfoBox label="Daily Total" value={formatINR(day.estimatedExpenses.total)} />
                      </div>

                      <div className="rounded-xl bg-warning-50 p-3 text-sm text-warning-800">
                        <strong>Travel tip:</strong> {day.travelTips || 'Keep hydrated, carry local cash, and verify timings before visiting attractions.'}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section className="card p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Food Recommendations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              {(plan.foodRecommendations || [
                'Breakfast: Local spots with Indian breakfast options',
                'Lunch: Regional cuisine and local favorites',
                'Evening snack: Local sweets or chai',
                'Dinner: Family-style local restaurant with vegetarian and non-vegetarian options',
              ]).map((item, idx) => (
                <div key={idx} className="rounded-xl bg-success-50 text-success-900 p-3">{item}</div>
              ))}
            </div>
          </section>

          <section className="card p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Important Travel Tips</h2>
            <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
              {(plan.importantTravelTips || [
                'Carry a light jacket or shawl for cooler evenings.',
                'Keep digital and physical copies of booking confirmations.',
                'Book major attractions a day in advance when possible.',
                'Use local cabs or app-based transport for convenient city transfers.',
              ]).map((tip, idx) => <li key={idx}>{tip}</li>)}
            </ul>
          </section>
        </div>

        <aside className="space-y-6">
          <div className="card p-6 sticky top-20">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Budget Breakdown</h2>
            <div className="space-y-2 text-sm">
              <BudgetRow label="Hotel" cost={budgetBreakdown.hotel || plan.hotelCost} icon={Hotel} />
              <BudgetRow label="Transportation" cost={budgetBreakdown.transportation || plan.transportCost} icon={Car} />
              <BudgetRow label="Food" cost={budgetBreakdown.food || plan.foodCost} icon={Utensils} />
              <BudgetRow label="Local Travel" cost={budgetBreakdown.localTravel || plan.localTransportCost} icon={Navigation} />
              <BudgetRow label="Activities" cost={budgetBreakdown.activities || plan.activitiesCost} icon={Sparkles} />
              <BudgetRow label="Miscellaneous" cost={budgetBreakdown.miscellaneous || plan.miscCost} icon={Wallet} />
              <div className="border-t pt-3 flex justify-between font-bold text-base">
                <span>Total</span>
                <span className={plan.withinBudget ? 'text-success-700' : 'text-error-600'}>{formatINR(plan.totalCost)}</span>
              </div>
            </div>

            <div className="mt-4 rounded-xl bg-gray-50 p-4">
              <div className="flex justify-between text-sm mb-2"><span className="text-gray-500">Your Budget</span><span className="font-semibold">{formatINR(formData.budget)}</span></div>
              <div className="flex justify-between text-sm mb-2"><span className="text-gray-500">Total Cost</span><span className="font-semibold">{formatINR(plan.totalCost)}</span></div>
              <div className="flex justify-between text-sm mb-3"><span className="text-gray-500">Remaining</span><span className={`font-semibold ${plan.budgetRemaining >= 0 ? 'text-success-600' : 'text-error-600'}`}>{formatINR(plan.budgetRemaining)}</span></div>
              <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                <div className={`h-full rounded-full ${plan.withinBudget ? 'bg-success-500' : 'bg-error-500'}`} style={{ width: `${Math.min(100, (plan.totalCost / formData.budget) * 100)}%` }} />
              </div>
            </div>

            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Weather</span><span className="font-semibold">{plan.weather}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Hotel</span><span className="font-semibold">{plan.hotel}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Transport</span><span className="font-semibold">{plan.transport}</span></div>
            </div>

            <button
              onClick={() => {
                sessionStorage.setItem('selectedPlan', JSON.stringify(plan));
                navigate('/booking');
              }}
              className="mt-4 w-full btn-primary text-sm"
            >
              <CheckCircle2 className="h-4 w-4" /> Select Plan
            </button>

            <button onClick={() => navigate('/compare')} className="mt-3 w-full btn-secondary text-sm">
              <TrendingUp className="h-4 w-4" /> Compare Plans
            </button>
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Weather Information</h2>
            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex items-center gap-2"><Sun className="h-4 w-4 text-warning-600" /> <strong>Temperature:</strong> {plan.weatherInfo?.expectedTemperature || 'Estimated: 22°C to 32°C'}</div>
              <div><strong>Condition:</strong> {plan.weatherInfo?.weatherCondition || plan.weather}</div>
              <div><strong>Rain possibility:</strong> {plan.weatherInfo?.rainPossibility || 'Estimated moderate possibility depending on season'}</div>
              <div><strong>Recommended clothing:</strong> {plan.weatherInfo?.recommendedClothing || 'Light cotton clothes with light layers for evenings'}</div>
              <div><strong>Advice:</strong> {plan.weatherInfo?.travelAdvice || 'Carry sunscreen, water, and comfortable walking shoes.'}</div>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Things to Carry</h2>
            <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
              {(plan.thingsToCarry || [
                'ID and booking confirmations',
                'Travel insurance details',
                'Comfortable walking shoes',
                'Power bank and charging cable',
                'Light rain jacket',
                'Swimwear and sunscreen',
              ]).map((item, idx) => <li key={idx}>{item}</li>)}
            </ul>
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Booking Options</h2>
            <div className="space-y-3">
              <button className="w-full btn-primary"><Hotel className="h-4 w-4" /> Book Hotel</button>
              <button className="w-full btn-secondary"><Plane className="h-4 w-4" /> Book Flight</button>
              <button className="w-full btn-secondary"><Train className="h-4 w-4" /> Book Train</button>
              <button className="w-full btn-secondary"><Map className="h-4 w-4" /> Book Local Transport</button>
            </div>
            <p className="mt-3 text-xs text-gray-500">Estimated availability and price details are shown as estimates unless a live booking service is connected.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-gray-50 p-3">
      <div className="text-xs uppercase tracking-wide text-gray-500">{label}</div>
      <div className="mt-1 font-semibold text-gray-900">{value}</div>
    </div>
  );
}

function BudgetRow({ label, cost, icon: Icon }: { label: string; cost: number; icon: any }) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-gray-600"><Icon className="h-4 w-4 text-gray-400" /> {label}</span>
      <span className="font-semibold text-gray-900">{formatINR(cost)}</span>
    </div>
  );
}
