import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import type { Trip, Booking } from '@/types';
import { formatINR } from '@/lib/format';
import { Sparkles, Send, MessageSquare, Loader2 } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
}

export function ChatbotPage() {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'ai', content: `Hello ${profile?.full_name?.split(' ')[0] || 'traveler'}! I'm your YatraAI Assistant. I can answer questions about your trips, suggest modifications, help with budget, and more. Ask me anything!` },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      if (!user) return;
      const { data: tripData } = await supabase.from('trips').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      const { data: bookingData } = await supabase.from('bookings').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      setTrips((tripData as Trip[]) || []);
      setBookings((bookingData as Booking[]) || []);
    })();
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    setLoading(true);

    // Rule-based AI response using trip data
    const response = generateAIResponse(userMsg, trips, bookings, profile?.full_name || 'traveler');
    
    setTimeout(() => {
      setMessages((prev) => [...prev, { role: 'ai', content: response }]);
      setLoading(false);
    }, 500);
  };

  const suggestedQuestions = [
    'Which plan is best for me?',
    'How much budget is remaining?',
    'What is my hotel?',
    'What should I pack?',
    'Can I reduce my trip cost?',
    'Which transport is cheaper?',
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-6">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-600 to-accent-500 text-white shadow-lg mb-3">
          <MessageSquare className="h-6 w-6" />
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900">YatraAI Assistant 🤖</h1>
        <p className="text-gray-500 mt-2">Your AI travel companion — ask about your trips, budget, plans, and more</p>
      </div>

      <div className="card flex flex-col h-[60vh] overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${msg.role === 'user' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-900'}`}>
                {msg.role === 'ai' && <Sparkles className="h-4 w-4 mb-1 text-accent-500" />}
                <p className="text-sm whitespace-pre-line">{msg.content}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-2xl px-4 py-3">
                <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {messages.length <= 2 && (
          <div className="px-6 pb-3">
            <p className="text-xs text-gray-400 mb-2">Try asking:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((q) => (
                <button key={q} onClick={() => setInput(q)} className="px-3 py-1.5 rounded-lg bg-primary-50 text-sm text-primary-700 hover:bg-primary-100 transition-all">
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="border-t border-gray-100 p-4 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="input-field flex-1"
            placeholder="Ask me anything about your trip..."
          />
          <button onClick={handleSend} disabled={!input.trim() || loading} className="btn-primary px-4 disabled:opacity-50">
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function generateAIResponse(question: string, trips: Trip[], bookings: Booking[], userName: string): string {
  const q = question.toLowerCase();
  const latestTrip = trips[0];
  const latestBooking = bookings[0];

  if (!latestTrip && !latestBooking) {
    return `Hi ${userName}! You haven't planned any trips yet. Head to the "Plan My Trip" page to create your first AI-powered travel plan. I'll be able to answer questions about your destination, budget, hotel, transport, and itinerary once you have a trip planned!`;
  }

  if (q.includes('flight') && (q.includes('delay') || q.includes('late'))) {
    return `Your hotel check-in may be affected if your flight is delayed. I can help you review alternative transport, contact the hotel, and update your itinerary. For your current trip to ${latestTrip?.title || 'your destination'}, I can suggest the quickest next steps while keeping your booking status updated.`;
  }

  if (q.includes('flight') && q.includes('cancel')) {
    return `A flight cancellation means we should review alternate flights, trains, or bus options immediately. I can compare estimated costs and time, help you choose a replacement, and update your itinerary for ${latestTrip?.title || 'your trip'} while keeping the original booking in view.`;
  }

  if (q.includes('train') && (q.includes('delay') || q.includes('late'))) {
    return `A train delay may affect your hotel check-in and local transport. I can help you review updated arrival timing, nearby alternatives, and the best way to keep your trip moving without unnecessary extra cost.`;
  }

  if (q.includes('train') && q.includes('cancel')) {
    return `A cancelled train can be managed by comparing alternate trains, flights, or bus options. I can review the cheapest and fastest alternatives and help you update your itinerary for ${latestTrip?.title || 'your journey'}.`;
  }

  if ((q.includes('hotel') || q.includes('room')) && (q.includes('no room') || q.includes('unavailable') || q.includes('problem') || q.includes('closed'))) {
    return `If your hotel has no room or a booking issue, I can help you look for nearby alternatives, compare price and distance, and update your trip quickly. We can keep the alternatives as demo/estimated options if a live provider is not connected.`;
  }

  if (q.includes('cancel') && q.includes('trip')) {
    return `To cancel your trip, I can review the selected trip details, reason for cancellation, estimated charge, and refund summary. I can also outline the booking impact and help you decide whether to confirm or keep your trip.`;
  }

  if (q.includes('emergency') || q.includes('urgent') || q.includes('medical')) {
    return `For urgent situations, please contact the relevant local emergency service immediately. After that, I can help you review trip disruption steps, reschedule transport, contact the hotel, or manage a cancellation plan for your current trip.`;
  }

  if (q.includes('hotel') && q.includes('late')) {
    return `If your hotel check-in will be late, I can help you contact the property, review arrival timing, and suggest nearby support options so your trip continues smoothly.`;
  }

  if (q.includes('best') && q.includes('plan')) {
    if (latestBooking) {
      return `Your best plan is the one you've booked: ${latestBooking.trip_route}. It's a ${latestBooking.hotel} stay with ${latestBooking.transport} transport for ${latestBooking.travellers} travellers, totaling ${formatINR(latestBooking.total_payable)}. This plan had the highest AI match score for your preferences!`;
    }
    return `I recommend the plan with the highest AI Match Score (⭐ Best Match). For your trip to ${latestTrip?.title}, go to the Plans page and look for the plan marked with ⭐. It's selected based on your budget (${formatINR(latestTrip?.budget || 0)}), preferred hotel type (${latestTrip?.hotel_preference}), and travel style.`;
  }

  if (q.includes('budget') && (q.includes('remaining') || q.includes('left') || q.includes('how much'))) {
    if (latestBooking) {
      return `Your total paid amount is ${formatINR(latestBooking.total_payable)}. This includes subtotal of ${formatINR(latestBooking.subtotal)} and taxes of ${formatINR(latestBooking.taxes)}. Your original trip budget was ${formatINR(latestTrip?.budget || 0)}, so you have ${formatINR((latestTrip?.budget || 0) - latestBooking.total_payable)} remaining from your budget.`;
    }
    return `Your trip budget is ${formatINR(latestTrip?.budget || 0)}. Once you select and book a plan, I can tell you exactly how much is remaining. All plans are validated to stay within this budget.`;
  }

  if (q.includes('hotel')) {
    if (latestBooking) return `Your booked hotel is a ${latestBooking.hotel}. It was selected based on your preference for ${latestTrip?.hotel_preference} accommodation with a ${latestTrip?.room_type} room.`;
    return `Based on your preferences, your hotel type is ${latestTrip?.hotel_preference} with a ${latestTrip?.room_type} room. The AI will recommend specific hotels within this category that fit your budget.`;
  }

  if (q.includes('transport') && (q.includes('cheap') || q.includes('cheaper') || q.includes('cost'))) {
    const transport = latestTrip?.transport_preference;
    if (transport === 'No Preference') {
      return `For budget-friendly travel within India, trains are typically the most economical option. For example, a train to ${latestTrip?.title?.split('→')[0]?.trim()} might cost ₹2,000-3,000 compared to ₹5,000-7,000 for a flight. If your budget is tight, choosing train over flight can save you ₹3,000-4,000 per person.`;
    }
    return `Your transport preference is ${transport}. The AI compares cost vs. time — for example, a train might cost ₹2,500 (14 hours) while a flight costs ₹6,500 (2 hours). If keeping within your ${formatINR(latestTrip?.budget || 0)} budget is priority, the engine will prefer the cheaper option.`;
  }

  if (q.includes('pack') || q.includes('bring') || q.includes('carry')) {
    const weather = latestTrip?.weather_preference || 'varied';
    const dest = latestTrip?.title?.split('→')[0]?.trim() || 'your destination';
    const tips: string[] = [];
    if (weather.toLowerCase().includes('cold') || weather.toLowerCase().includes('snow')) tips.push('warm jackets, thermals, and gloves');
    if (weather.toLowerCase().includes('tropical') || weather.toLowerCase().includes('sunny')) tips.push('sunscreen, sunglasses, and light cotton clothes');
    if (weather.toLowerCase().includes('rain')) tips.push('an umbrella and waterproof jacket');
    tips.push('comfortable walking shoes');
    tips.push('a reusable water bottle');
    tips.push('extra cash for small purchases');
    tips.push('a power bank for your phone');
    tips.push('basic medicines and a first-aid kit');
    return `For your trip to ${dest} with ${weather} weather, I recommend packing: ${tips.join(', ')}. Also carry valid ID proof for hotel check-ins!`;
  }

  if (q.includes('reduce') || q.includes('cheaper') || q.includes('save') || q.includes('lower')) {
    const budget = latestTrip?.budget || 0;
    return `To reduce your trip cost, here are some options:\n\n1. **Switch to budget hotel** — Save ₹1,000-2,000/night\n2. **Choose train over flight** — Save ₹3,000-5,000/person\n3. **Reduce activities** — Focus on free/low-cost attractions\n4. **Fewer days** — Cutting 1-2 days saves significantly\n5. **Travel in off-season** — Better deals on hotels\n\nYour current budget is ${formatINR(budget)}. Would you like me to regenerate plans with a lower budget?`;
  }

  if (q.includes('weather')) {
    const weather = latestTrip?.weather_preference || 'No specific preference';
    return `Your weather preference is ${weather}. The AI considers this when recommending destinations and activities. For your trip to ${latestTrip?.title?.split('→')[0]?.trim()}, expect ${weather.toLowerCase()} conditions. Always check a live weather forecast closer to your travel date!`;
  }

  if (q.includes('today') || q.includes('do today')) {
    return `I don't have access to your specific day in the itinerary right now, but for your trip to ${latestTrip?.title?.split('→')[0]?.trim()}, check the day-wise itinerary on your plan details page. Each day has morning, afternoon, and evening activities planned based on your ${latestTrip?.travel_pace?.toLowerCase() || 'balanced'} pace!`;
  }

  if (q.includes('change') && q.includes('day')) {
    return `You can modify your itinerary! Go to the Plan Details page to view your day-wise itinerary. If you want to change a specific day's activities, you can regenerate plans with different preferences, or I can suggest alternative activities that match your interests (${latestTrip?.activities?.join(', ') || 'sightseeing'}).`;
  }

  if (q.includes('destination') && (q.includes('change') || q.includes('different') || q.includes('another'))) {
    const isInternational = latestTrip?.is_international;
    if (isInternational) {
      return `For your international trip, alternative destinations within the same region include places nearby ${latestTrip?.title?.split('→')[0]?.trim()}. Since you selected an international destination, all alternatives will also be international. Go to Plan My Trip to explore new destinations!`;
    }
    return `For your India trip to ${latestTrip?.title?.split('→')[0]?.trim()}, there are many beautiful alternatives within India that match your preferences (${latestTrip?.location_types?.join(', ') || 'various types'}). Try searching for nearby destinations on the Plan My Trip page!`;
  }

  if (q.includes('traveller') || q.includes('people') || q.includes('group')) {
    return `Your trip has ${latestTrip?.total_travellers} traveller(s) — ${latestTrip?.adults} adult(s) and ${latestTrip?.children} child(ren). The itinerary and costs are calculated based on this group size. Hotel rooms are allocated as ${latestTrip?.room_type} rooms.`;
  }

  if (q.includes('day') || q.includes('itinerary') || q.includes('schedule')) {
    return `Your trip is ${latestTrip?.days} days (${latestTrip?.nights} nights). Each day has a detailed itinerary with morning, afternoon, and evening activities, plus food, transport, and hotel information. View the full day-wise breakdown on the Plan Details page!`;
  }

  if (q.includes('hello') || q.includes('hi') || q.includes('hey')) {
    return `Hello ${userName}! I'm here to help with your travel plans. You can ask me about your trips, budget, hotel, transport, activities, packing tips, and more. What would you like to know?`;
  }

  if (q.includes('thank')) {
    return `You're welcome, ${userName}! Have a wonderful trip. Feel free to come back anytime you need travel advice! ✈️`;
  }

  return `I can help you with questions about your trips, budget, hotels, transport, activities, packing, and itinerary. Here's what I know about your current trip:\n\n• Destination: ${latestTrip?.title}\n• Budget: ${formatINR(latestTrip?.budget || 0)}\n• Days: ${latestTrip?.days} days\n• Hotel: ${latestTrip?.hotel_preference}\n• Transport: ${latestTrip?.transport_preference}\n• Travellers: ${latestTrip?.total_travellers}\n\nTry asking: "Which plan is best?", "How much budget is remaining?", "What should I pack?", or "Can I reduce my trip cost?"`;
}
