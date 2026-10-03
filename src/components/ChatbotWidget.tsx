import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import type { Trip, Booking } from '@/types';
import { formatINR } from '@/lib/format';
import { Sparkles, Send, X, MessageCircle, Loader2 } from 'lucide-react';
import { navigate } from '@/lib/router';

interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
}

export function ChatbotWidget() {
  const { user, profile } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'ai', content: `Hi ${profile?.full_name?.split(' ')[0] || 'there'}! I'm your YatraAI Assistant. Ask me about your trips, budget, or travel plans!` },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && user && trips.length === 0) {
      (async () => {
        const { data: td } = await supabase.from('trips').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
        const { data: bd } = await supabase.from('bookings').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
        setTrips((td as Trip[]) || []);
        setBookings((bd as Booking[]) || []);
      })();
    }
  }, [open, user]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    setLoading(true);
    setTimeout(() => {
      const response = generateResponse(userMsg, trips, bookings, profile?.full_name || 'traveler');
      setMessages((prev) => [...prev, { role: 'ai', content: response }]);
      setLoading(false);
    }, 500);
  };

  if (!user) return null;

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary-600 to-accent-500 text-white shadow-xl hover:shadow-2xl hover:scale-110 transition-all animate-float"
          aria-label="Open AI Assistant"
        >
          <MessageCircle className="h-6 w-6" />
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-success-500 border-2 border-white" />
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-6 right-6 z-40 w-[calc(100vw-3rem)] sm:w-96 h-[500px] max-h-[80vh] bg-white rounded-2xl shadow-2xl flex flex-col animate-scale-in border border-gray-100">
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-br from-primary-600 to-primary-700 text-white rounded-t-2xl">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold text-sm">YatraAI Assistant 🤖</p>
                <p className="text-xs text-primary-200">Online · AI Travel Helper</p>
              </div>
            </div>
            <div className="flex gap-1">
              <button onClick={() => { setOpen(false); navigate('/chatbot'); }} className="p-1.5 rounded-lg hover:bg-white/10 transition-all" title="Open full chat">
                <MessageCircle className="h-4 w-4" />
              </button>
              <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-white/10 transition-all">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${msg.role === 'user' ? 'bg-primary-600 text-white' : 'bg-white text-gray-900 shadow-sm border border-gray-100'}`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl px-3 py-2 shadow-sm border border-gray-100">
                  <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-gray-100 flex gap-2 bg-white rounded-b-2xl">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1 rounded-xl border-2 border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
              placeholder="Ask about your trip..."
            />
            <button onClick={handleSend} disabled={!input.trim() || loading} className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 transition-all">
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function generateResponse(question: string, trips: Trip[], bookings: Booking[], name: string): string {
  const q = question.toLowerCase();
  const trip = trips[0];
  const booking = bookings[0];

  if (!trip) return `Hi ${name}! You haven't planned any trips yet. Click the travel icon to open the full chat, or head to "Plan My Trip" to get started!`;

  if (q.includes('budget') || q.includes('cost') || q.includes('money')) {
    if (booking) return `Your trip cost ${formatINR(booking.total_payable)}. Budget was ${formatINR(trip.budget)}, so you have ${formatINR(trip.budget - booking.total_payable)} remaining.`;
    return `Your budget is ${formatINR(trip.budget)}. All plans are validated to stay within this amount.`;
  }
  if (q.includes('hotel')) return booking ? `Your hotel: ${booking.hotel}` : `Your hotel preference: ${trip.hotel_preference} (${trip.room_type} room)`;
  if (q.includes('transport')) return `Transport preference: ${trip.transport_preference}. For budget travel, trains are cheaper than flights.`;
  if (q.includes('day') || q.includes('itinerary')) return `Your trip is ${trip.days} days (${trip.nights} nights). Check the Plan Details page for the full day-wise itinerary!`;
  if (q.includes('pack')) return `Pack based on ${trip.weather_preference} weather. Always carry: comfortable shoes, water bottle, ID proof, power bank, and basic medicines.`;
  if (q.includes('hello') || q.includes('hi')) return `Hi ${name}! Ask me about your trip to ${trip.title}, budget, hotel, or activities!`;
  if (q.includes('best')) return `Look for the ⭐ Best Match plan on your Plans page — it has the highest AI match score for your preferences.`;
  if (q.includes('reduce') || q.includes('save')) return `To save money: switch to budget hotel, choose train over flight, reduce activities, or shorten the trip. Your budget is ${formatINR(trip.budget)}.`;

  return `I can help with your trip to ${trip.title}! Ask about budget, hotel, transport, days, packing, or cost reduction. Click the chat icon to open the full assistant.`;
}
