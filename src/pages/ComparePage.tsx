import { useState, useEffect } from 'react';
import { navigate } from '@/lib/router';
import type { Plan, TripFormData } from '@/types';
import { formatINR } from '@/lib/format';
import { TrendingUp, Star, ChevronLeft, Check, X, MapPin, Calendar, Hotel, Car, Sparkles, Wallet } from 'lucide-react';

export function ComparePage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [formData, setFormData] = useState<TripFormData | null>(null);

  useEffect(() => {
    const sp = sessionStorage.getItem('generatedPlans');
    const sf = sessionStorage.getItem('currentTripForm');
    if (sp) setPlans(JSON.parse(sp));
    if (sf) setFormData(JSON.parse(sf));
  }, []);

  if (plans.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <p className="text-gray-500">No plans to compare. Generate plans first.</p>
        <button onClick={() => navigate('/planner')} className="mt-4 btn-primary">Plan a Trip</button>
      </div>
    );
  }

  const rows = [
    { label: 'Route', key: 'route', icon: MapPin, render: (p: Plan) => p.route.join(' → ') },
    { label: 'Locations', key: 'numLocations', icon: MapPin, render: (p: Plan) => `${p.numLocations}` },
    { label: 'Nights', key: 'numNights', icon: Calendar, render: (p: Plan) => `${p.numNights}` },
    { label: 'Hotel', key: 'hotel', icon: Hotel, render: (p: Plan) => p.hotel },
    { label: 'Transport', key: 'transport', icon: Car, render: (p: Plan) => p.transport },
    { label: 'Activities', key: 'activities', icon: Sparkles, render: (p: Plan) => p.activities.slice(0, 3).join(', ') },
    { label: 'Weather', key: 'weather', icon: Calendar, render: (p: Plan) => p.weather },
    { label: 'Hotel Cost', key: 'hotelCost', icon: Hotel, render: (p: Plan) => formatINR(p.hotelCost) },
    { label: 'Transport Cost', key: 'transportCost', icon: Car, render: (p: Plan) => formatINR(p.transportCost) },
    { label: 'Food Cost', key: 'foodCost', icon: Wallet, render: (p: Plan) => formatINR(p.foodCost) },
    { label: 'Activities Cost', key: 'activitiesCost', icon: Sparkles, render: (p: Plan) => formatINR(p.activitiesCost) },
    { label: 'Total Cost', key: 'totalCost', icon: Wallet, render: (p: Plan) => formatINR(p.totalCost) },
    { label: 'Budget Remaining', key: 'budgetRemaining', icon: Wallet, render: (p: Plan) => formatINR(p.budgetRemaining) },
    { label: 'Within Budget', key: 'withinBudget', icon: Check, render: (p: Plan) => p.withinBudget ? '✓ Yes' : '✗ No' },
    { label: 'AI Match Score', key: 'matchScore', icon: Star, render: (p: Plan) => `${p.matchScore}%` },
  ];

  const bestIdx = plans.reduce((best, p, i) => (p.matchScore > plans[best].matchScore ? i : best), 0);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <button onClick={() => navigate('/plans')} className="mb-6 flex items-center gap-1 text-primary-600 font-semibold hover:text-primary-700">
        <ChevronLeft className="h-5 w-5" /> Back to Plans
      </button>

      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="h-6 w-6 text-primary-600" />
          <h1 className="text-3xl font-extrabold text-gray-900">Compare Plans</h1>
        </div>
        <p className="text-gray-500">Compare all 7 AI-generated plans side by side to find your perfect trip.</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="sticky left-0 bg-white z-10 text-left p-4 border-b-2 border-gray-200 font-semibold text-gray-700 min-w-[140px]">Feature</th>
              {plans.map((p, i) => (
                <th key={i} className={`p-4 border-b-2 border-gray-200 text-center min-w-[160px] ${i === bestIdx ? 'bg-accent-50' : ''}`}>
                  {i === bestIdx && <span className="block text-xs font-bold text-accent-600 mb-1">⭐ BEST MATCH</span>}
                  <span className="font-bold text-gray-900 text-sm">{p.planName.replace('⭐ ', '')}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={row.key} className={ri % 2 === 0 ? 'bg-gray-50/50' : ''}>
                <td className="sticky left-0 bg-inherit z-10 p-4 font-semibold text-gray-600 text-sm border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <row.icon className="h-4 w-4 text-gray-400" />
                    {row.label}
                  </div>
                </td>
                {plans.map((p, i) => {
                  const isBestCol = i === bestIdx;
                  const isWithinBudget = row.key === 'withinBudget' ? p.withinBudget : null;
                  const isScore = row.key === 'matchScore';
                  const isTotal = row.key === 'totalCost';
                  return (
                    <td key={i} className={`p-4 text-center text-sm border-b border-gray-100 ${isBestCol ? 'bg-accent-50/50' : ''}`}>
                      <span className={
                        isWithinBudget === true ? 'font-semibold text-success-600' :
                        isWithinBudget === false ? 'font-semibold text-error-600' :
                        isScore ? `font-bold ${p.matchScore >= 85 ? 'text-success-600' : p.matchScore >= 70 ? 'text-primary-600' : 'text-warning-600'}` :
                        isTotal ? `font-bold ${p.withinBudget ? 'text-gray-900' : 'text-error-600'}` :
                        'text-gray-700'
                      }>
                        {row.render(p)}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
            <tr>
              <td className="sticky left-0 bg-white p-4 border-b border-gray-100"></td>
              {plans.map((p, i) => (
                <td key={i} className={`p-4 text-center border-b border-gray-100 ${i === bestIdx ? 'bg-accent-50/50' : ''}`}>
                  <button
                    onClick={() => {
                      sessionStorage.setItem('selectedPlan', JSON.stringify(p));
                      navigate('/plan-details');
                    }}
                    disabled={!p.withinBudget}
                    className="rounded-lg bg-primary-600 text-white px-4 py-2 text-xs font-semibold hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    {p.withinBudget ? 'Select Plan' : 'Over Budget'}
                  </button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {formData && (
        <div className="mt-6 rounded-xl bg-primary-50 p-4 text-sm text-primary-700">
          <strong>Your Budget:</strong> {formatINR(formData.budget)} | <strong>Plans within budget:</strong> {plans.filter((p) => p.withinBudget).length} of {plans.length}
        </div>
      )}
    </div>
  );
}
