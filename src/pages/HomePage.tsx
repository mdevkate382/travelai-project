import { Link, navigate } from '@/lib/router';
import { Plane, Sparkles, MapPin, Wallet, Route, Shield, ArrowRight, Star, Compass, Brain, Navigation } from 'lucide-react';
import { INDIAN_DESTINATIONS, INTERNATIONAL_DESTINATIONS } from '@/data/destinations';

const DEST_IMAGES: Record<string, string> = {
  Taj: 'https://images.pexels.com/photos/22602478/pexels-photo-22602478.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  Taj2: 'https://images.pexels.com/photos/14533217/pexels-photo-14533217.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  Beach: 'https://images.pexels.com/photos/6789839/pexels-photo-6789839.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  Beach2: 'https://images.pexels.com/photos/19720922/pexels-photo-19720922.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  Dubai: 'https://images.pexels.com/photos/28350363/pexels-photo-28350363.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  Dubai2: 'https://images.pexels.com/photos/19664340/pexels-photo-19664340.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  Kerala: 'https://images.pexels.com/photos/17928231/pexels-photo-17928231.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  Kerala2: 'https://images.pexels.com/photos/36998153/pexels-photo-36998153.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  Mountain: 'https://images.pexels.com/photos/37911658/pexels-photo-37911658.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  Mountain2: 'https://images.pexels.com/photos/37898606/pexels-photo-37898606.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
};

const FEATURED = [
  { name: 'Agra', country: 'India', img: DEST_IMAGES.Taj, desc: 'Home of the Taj Mahal', types: ['Historical', 'Culture'] },
  { name: 'Goa', country: 'India', img: DEST_IMAGES.Beach, desc: 'Sun, sand, and nightlife', types: ['Beaches', 'Nightlife'] },
  { name: 'Kerala', country: 'India', img: DEST_IMAGES.Kerala, desc: 'Backwaters and tea gardens', types: ['Nature', 'Peaceful'] },
  { name: 'Manali', country: 'India', img: DEST_IMAGES.Mountain, desc: 'Himalayan adventure hub', types: ['Mountains', 'Adventure'] },
  { name: 'Dubai', country: 'UAE', img: DEST_IMAGES.Dubai, desc: 'Luxury in the desert', types: ['City', 'Shopping'] },
  { name: 'Bali', country: 'Indonesia', img: DEST_IMAGES.Beach2, desc: 'Island of the Gods', types: ['Beaches', 'Spiritual'] },
];

export function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[600px] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={DEST_IMAGES.Taj2} alt="Taj Mahal" className="h-full w-full object-cover" />
          <div className="absolute inset-0 hero-overlay" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur border border-white/20 px-4 py-1.5 text-sm font-semibold text-white mb-6 animate-fade-in">
              <Sparkles className="h-4 w-4" /> AI-Powered Travel Planning
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight animate-fade-up">
              Your Journey. Your Budget.<br />
              <span className="text-accent-300">Your Perfect AI Trip.</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-primary-100 max-w-2xl animate-fade-up" style={{ animationDelay: '0.1s' }}>
              Tell YatraAI where you want to go, how much you want to spend, and what kind of experience you want. Get 7 personalized travel plans with day-wise itineraries.
            </p>
            <div className="mt-8 flex flex-wrap gap-4 animate-fade-up" style={{ animationDelay: '0.2s' }}>
              <button onClick={() => navigate('/planner')} className="inline-flex items-center gap-2 rounded-xl bg-accent-500 px-7 py-3.5 font-bold text-white shadow-xl shadow-accent-500/30 hover:bg-accent-600 transition-all active:scale-95">
                <Plane className="h-5 w-5" /> Plan My Trip
              </button>
              <button onClick={() => navigate('/destinations')} className="inline-flex items-center gap-2 rounded-xl bg-white/10 backdrop-blur border-2 border-white/30 px-7 py-3.5 font-bold text-white hover:bg-white/20 transition-all active:scale-95">
                <Compass className="h-5 w-5" /> Explore Destinations
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-8">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary-600">🎬 Explore Travel Reels</p>
              <h2 className="mt-2 text-3xl font-extrabold text-gray-900">Get Inspired. Discover Places. Plan Your Trip.</h2>
            </div>
            <button onClick={() => navigate('/explore-reels')} className="btn-secondary">
              Watch More Reels
            </button>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              { title: 'Manali Escape', image: DEST_IMAGES.Mountain, tag: 'Mountains', summary: 'Snowy landscapes and warm hill stays.' },
              { title: 'Goa Weekend', image: DEST_IMAGES.Beach, tag: 'Beaches', summary: 'Sunset beaches and easy coastal vibes.' },
              { title: 'Rajasthan Trails', image: DEST_IMAGES.Dubai, tag: 'Adventure', summary: 'Golden deserts and unforgettable road moments.' },
            ].map((reel) => (
              <div key={reel.title} className="overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-100">
                <img src={reel.image} alt={reel.title} className="h-52 w-full object-cover" />
                <div className="p-4">
                  <span className="badge bg-primary-50 text-primary-700">{reel.tag}</span>
                  <h3 className="mt-3 text-xl font-bold text-gray-900">{reel.title}</h3>
                  <p className="mt-2 text-sm text-gray-500">{reel.summary}</p>
                  <button onClick={() => navigate('/explore-reels')} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary-700">
                    Explore now <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Destinations */}
      <section className="py-16 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-gray-900">Featured Destinations</h2>
          <p className="text-gray-500 mt-2">Discover incredible places to explore</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURED.map((dest) => (
            <div key={dest.name} className="group relative overflow-hidden rounded-2xl shadow-lg cursor-pointer hover:shadow-2xl transition-all" onClick={() => navigate('/planner')}>
              <div className="relative h-64 overflow-hidden">
                <img src={dest.img} alt={dest.name} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <div className="flex items-center gap-1.5 text-white/80 text-sm mb-1">
                    <MapPin className="h-4 w-4" /> {dest.country}
                  </div>
                  <h3 className="text-2xl font-bold text-white">{dest.name}</h3>
                  <p className="text-white/90 text-sm mt-1">{dest.desc}</p>
                  <div className="flex gap-2 mt-2">
                    {dest.types.map((t) => (
                      <span key={t} className="badge bg-white/20 text-white backdrop-blur">{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* AI Trip Planner CTA */}
      <section className="py-16 bg-gradient-to-br from-primary-700 to-primary-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold text-white mb-4">
                <Brain className="h-4 w-4" /> AI Trip Planner
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white">Smart Planning Powered by AI</h2>
              <p className="mt-4 text-primary-100 text-lg">
                Our AI engine analyzes your destination, budget, preferences, and travel style to create 7 unique personalized plans. Each plan includes:
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  'Detailed day-wise itinerary with morning, afternoon, evening activities',
                  'Budget breakdown that never exceeds your maximum',
                  'Country-smart recommendations (India-only or international)',
                  'Hotel, transport, and restaurant suggestions',
                  'AI match score showing how well each plan fits you',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-primary-100">
                    <div className="mt-1 h-5 w-5 flex-shrink-0 rounded-full bg-success-500 flex items-center justify-center">
                      <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M16.7 5.3a1 1 0 010 1.4l-8 8a1 1 0 01-1.4 0l-4-4a1 1 0 011.4-1.4L8 12.6l7.3-7.3a1 1 0 011.4 0z" /></svg>
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
              <button onClick={() => navigate('/planner')} className="mt-8 btn-accent">
                <Sparkles className="h-5 w-5" /> Start Planning Now
              </button>
            </div>
            <div className="relative">
              <div className="rounded-2xl bg-white shadow-2xl p-6 animate-fade-up">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900">Sample Plan Preview</h3>
                  <span className="badge bg-success-100 text-success-700">94% Match</span>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-primary-50">
                    <div className="h-10 w-10 rounded-lg bg-primary-600 text-white flex items-center justify-center font-bold">1</div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 text-sm">Day 1: Mumbai → Jaipur</p>
                      <p className="text-xs text-gray-500">Travel + Hotel check-in + Local sightseeing</p>
                    </div>
                    <span className="text-sm font-bold text-primary-700">₹6,000</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                    <div className="h-10 w-10 rounded-lg bg-accent-500 text-white flex items-center justify-center font-bold">2</div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 text-sm">Day 2: Amber Fort + City Palace</p>
                      <p className="text-xs text-gray-500">Morning fort visit, afternoon palace, evening market</p>
                    </div>
                    <span className="text-sm font-bold text-primary-700">₹4,500</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                    <div className="h-10 w-10 rounded-lg bg-primary-600 text-white flex items-center justify-center font-bold">3</div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 text-sm">Day 3: Hawa Mahal + Shopping</p>
                      <p className="text-xs text-gray-500">Full day exploration + local cuisine</p>
                    </div>
                    <span className="text-sm font-bold text-primary-700">₹5,200</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-sm text-gray-500">Total Estimated Cost</span>
                  <span className="text-2xl font-extrabold text-primary-700">₹28,000</span>
                </div>
                <div className="mt-2 flex justify-between items-center text-sm">
                  <span className="text-gray-500">Budget: ₹30,000</span>
                  <span className="font-semibold text-success-600">✓ Within Budget</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-gray-900">How It Works</h2>
          <p className="text-gray-500 mt-2">Plan your perfect trip in 4 simple steps</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { icon: MapPin, step: '1', title: 'Set Your Location', desc: 'Use your current location or enter your starting city' },
            { icon: Compass, step: '2', title: 'Choose Destination', desc: 'Search and select one or multiple destinations' },
            { icon: Wallet, step: '3', title: 'Set Preferences', desc: 'Budget, hotel, transport, food, activities & more' },
            { icon: Sparkles, step: '4', title: 'Get AI Plans', desc: 'Receive 7 personalized plans with itineraries' },
          ].map((item) => (
            <div key={item.step} className="text-center group">
              <div className="relative inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-600 to-accent-500 text-white shadow-lg mb-4 group-hover:scale-110 transition-transform">
                <item.icon className="h-8 w-8" />
                <span className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-white text-primary-700 text-sm font-bold flex items-center justify-center shadow-md">{item.step}</span>
              </div>
              <h3 className="font-bold text-gray-900">{item.title}</h3>
              <p className="text-sm text-gray-500 mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Indian Destinations */}
      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900">Indian Destinations</h2>
              <p className="text-gray-500 mt-2">Explore the incredible diversity of India</p>
            </div>
            <Link to="/destinations" className="hidden sm:flex items-center gap-1 text-primary-600 font-semibold hover:text-primary-700">
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {INDIAN_DESTINATIONS.slice(0, 4).map((d, i) => (
              <div key={d.name} className="card p-5 cursor-pointer hover:-translate-y-1 transition-transform" onClick={() => navigate('/planner')}>
                <div className="h-32 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 mb-3 flex items-center justify-center">
                  {i === 0 && <img src={DEST_IMAGES.Mountain} alt={d.name} className="h-full w-full object-cover rounded-xl" />}
                  {i === 1 && <img src={DEST_IMAGES.Taj} alt={d.name} className="h-full w-full object-cover rounded-xl" />}
                  {i === 2 && <img src={DEST_IMAGES.Beach} alt={d.name} className="h-full w-full object-cover rounded-xl" />}
                  {i === 3 && <img src={DEST_IMAGES.Kerala} alt={d.name} className="h-full w-full object-cover rounded-xl" />}
                </div>
                <h3 className="font-bold text-gray-900">{d.name}</h3>
                <p className="text-xs text-gray-500">{d.state}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {d.types.slice(0, 2).map((t) => (
                    <span key={t} className="badge bg-primary-50 text-primary-700">{t}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* International Destinations */}
      <section className="py-16 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900">International Destinations</h2>
            <p className="text-gray-500 mt-2">Explore the world beyond India</p>
          </div>
          <Link to="/destinations" className="hidden sm:flex items-center gap-1 text-primary-600 font-semibold hover:text-primary-700">
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {INTERNATIONAL_DESTINATIONS.slice(0, 3).map((d, i) => (
            <div key={d.name} className="card p-5 cursor-pointer hover:-translate-y-1 transition-transform" onClick={() => navigate('/planner')}>
              <div className="h-32 rounded-xl mb-3 overflow-hidden">
                {i === 0 && <img src={DEST_IMAGES.Dubai} alt={d.name} className="h-full w-full object-cover" />}
                {i === 1 && <img src={DEST_IMAGES.Beach2} alt={d.name} className="h-full w-full object-cover" />}
                {i === 2 && <img src={DEST_IMAGES.Dubai2} alt={d.name} className="h-full w-full object-cover" />}
              </div>
              <h3 className="font-bold text-gray-900">{d.name}</h3>
              <p className="text-xs text-gray-500">{d.country}</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {d.types.slice(0, 2).map((t) => (
                  <span key={t} className="badge bg-accent-50 text-accent-700">{t}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Why Choose YatraAI */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-primary-50/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-gray-900">Why Choose YatraAI?</h2>
            <p className="text-gray-500 mt-2">Built for smart travelers who care about their budget</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Wallet, title: 'Strict Budget Control', desc: 'Your budget is a hard maximum. Plans that exceed it are automatically rejected and optimized.' },
              { icon: MapPin, title: 'Country-Smart Plans', desc: 'Indian destination means India-only plans. International means relevant global options. Never mixed.' },
              { icon: Route, title: 'Multi-Destination Routes', desc: 'Add multiple destinations and get optimized routes with distance, time, and day distribution.' },
              { icon: Brain, title: 'AI Match Score', desc: 'Every plan gets a match score based on your budget, weather, activities, and travel style.' },
              { icon: Shield, title: 'Secure & Private', desc: 'Your data is protected with row-level security. Only you can see your trips and memories.' },
              { icon: Navigation, title: 'Live Location', desc: 'Use browser geolocation to detect your current location with permission. Never tracked without consent.' },
            ].map((item) => (
              <div key={item.title} className="card p-6">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 text-primary-700 mb-4">
                  <item.icon className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-gray-900">What Our Travelers Say</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { name: 'Priya Sharma', trip: 'Manali + Kasol', text: 'YatraAI planned my entire Himachal trip within ₹25,000! The day-wise itinerary was so detailed, I never had to plan anything myself.', rating: 5 },
            { name: 'Rahul Verma', trip: 'Jaipur + Jodhpur', text: 'The country-smart feature is brilliant. It only suggested Indian destinations for my Rajasthan trip. Budget breakdown was spot on.', rating: 5 },
            { name: 'Anjali Mehta', trip: 'Dubai + Abu Dhabi', text: 'Planned my Dubai trip with YatraAI. The AI assistant helped me reduce costs and stay within budget. The itinerary was perfect!', rating: 5 },
          ].map((t) => (
            <div key={t.name} className="card p-6">
              <div className="flex gap-1 mb-3">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-warning-400 text-warning-400" />
                ))}
              </div>
              <p className="text-gray-700 italic">"{t.text}"</p>
              <div className="mt-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 text-white flex items-center justify-center font-bold">
                  {t.name[0]}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{t.name}</p>
                  <p className="text-xs text-gray-500">Traveled to {t.trip}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-gradient-to-br from-accent-500 to-accent-600">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white">Ready to Plan Your Perfect Trip?</h2>
          <p className="mt-3 text-accent-100 text-lg">Join YatraAI today and get personalized AI travel plans within your budget.</p>
          <button onClick={() => navigate('/planner')} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 font-bold text-accent-600 shadow-xl hover:shadow-2xl transition-all active:scale-95">
            <Plane className="h-5 w-5" /> Plan My Trip Now
          </button>
        </div>
      </section>
    </div>
  );
}
