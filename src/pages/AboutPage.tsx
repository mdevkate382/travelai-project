import { Plane, Brain, Wallet, MapPin, Shield, Sparkles, Heart, Users } from 'lucide-react';

export function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-600 to-accent-500 text-white shadow-lg mb-4">
          <Plane className="h-7 w-7" />
        </div>
        <h1 className="text-4xl font-extrabold gradient-text">About YatraAI</h1>
        <p className="text-lg text-gray-500 mt-3 max-w-2xl mx-auto">AI Smart Tourist Planner & Personalized Travel Assistant</p>
      </div>

      <div className="card p-8 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-3">Our Mission</h2>
        <p className="text-gray-600">
          YatraAI is an AI-powered personalized tourism platform that creates travel plans tailored to your budget, preferences, and travel style.
          Whether you're exploring the mountains of Manali or the skyscrapers of Dubai, we ensure every plan stays within your budget and matches your interests.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {[
          { icon: Brain, title: 'AI-Powered Planning', desc: 'Our AI engine analyzes your destination, budget, and preferences to generate 7 unique personalized travel plans.' },
          { icon: Wallet, title: 'Strict Budget Control', desc: 'Your budget is a hard maximum. We never show plans that exceed it — all costs are validated on the backend.' },
          { icon: MapPin, title: 'Country-Smart Plans', desc: 'Indian destinations get India-only plans. International destinations get relevant global options. Never mixed.' },
          { icon: Shield, title: 'Secure & Private', desc: 'Your data is protected with row-level security. Only you can access your trips, memories, and reviews.' },
          { icon: Sparkles, title: 'Day-Wise Itineraries', desc: 'Every plan includes a detailed day-by-day breakdown with morning, afternoon, and evening activities.' },
          { icon: Heart, title: 'Travel Memories', desc: 'Upload photos, write reviews, and keep your travel memories organized in one place.' },
        ].map((item) => (
          <div key={item.title} className="card p-6">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100 text-primary-700 mb-3">
              <item.icon className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
            <p className="text-sm text-gray-600">{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="card p-8 bg-gradient-to-br from-primary-50 to-accent-50/30">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Technology</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          {['React + TypeScript', 'Tailwind CSS', 'Supabase (PostgreSQL)', 'Edge Functions', 'Browser Geolocation API', 'Google/Nominatim Geocoding', 'Row-Level Security', 'AI Plan Engine'].map((tech) => (
            <div key={tech} className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary-500" />
              <span className="text-gray-700">{tech}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 text-center text-sm text-gray-400">
        <p>Built as a final-year engineering project · All prices in ₹ INR</p>
      </div>
    </div>
  );
}
