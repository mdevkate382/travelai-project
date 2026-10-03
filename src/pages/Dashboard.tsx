import { useAuth } from '@/context/AuthContext';
import { Link, navigate, useRouter } from '@/lib/router';
import { Plane, MapPinned, Calendar, CreditCard, Sparkles, Heart, Star, Compass, ArrowRight, TrendingUp, Camera, Crown, CheckCircle2, CloudSun, Map } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { getSubscriptionStatus } from '@/lib/subscriptions';

export function Dashboard() {
  const { profile } = useAuth();
  const route = useRouter();
  const [stats, setStats] = useState({ trips: 0, bookings: 0, memories: 0, reviews: 0, posts: 0 });
  const subscription = getSubscriptionStatus();

  useEffect(() => {
    (async () => {
      const [{ count: trips }, { count: bookings }, { count: memories }, { count: reviews }, { count: posts }] = await Promise.all([
        supabase.from('trips').select('*', { count: 'exact', head: true }),
        supabase.from('bookings').select('*', { count: 'exact', head: true }),
        supabase.from('travel_memories').select('*', { count: 'exact', head: true }),
        supabase.from('reviews').select('*', { count: 'exact', head: true }),
        supabase.from('travel_posts').select('*', { count: 'exact', head: true }),
      ]);
      setStats({ trips: trips || 0, bookings: bookings || 0, memories: memories || 0, reviews: reviews || 0, posts: posts || 0 });
    })();
  }, []);

  const cards = [
    { label: 'Plan New Trip', desc: 'Create a personalized AI travel plan', icon: Plane, to: '/planner', tone: '#111111' },
    { label: 'My Trips', desc: `${stats.trips} trips planned`, icon: MapPinned, to: '/my-trips', tone: '#3b82f6' },
    { label: 'Travel Feed', desc: 'View travel stories from the community', icon: Camera, to: '/travel-community', tone: '#16a34a' },
    { label: 'Subscription', desc: subscription.plan === 'free' ? 'Current plan: Free' : `Current plan: ${subscription.plan}`, icon: Crown, to: '/subscription', tone: '#f59e0b' },
    { label: 'AI Assistant', desc: 'Chat with your travel AI', icon: Sparkles, to: '/chatbot', tone: '#2563eb' },
    { label: 'Travel Memories', desc: `${stats.memories} photos shared`, icon: Heart, to: '/memories', tone: '#ef4444' },
    { label: 'Reviews', desc: `${stats.reviews} reviews written`, icon: Star, to: '/reviews', tone: '#f59e0b' },
    { label: 'Explore Destinations', desc: 'Discover new places', icon: Compass, to: '/destinations', tone: '#111111' },
  ];

  const destinations = [
    { name: 'MANALI', image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80', tag: 'Himalayan escape' },
    { name: 'KASHMIR', image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80', tag: 'Valley views' },
    { name: 'GOA', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80', tag: 'Coastal calm' },
    { name: 'KERALA', image: 'https://images.unsplash.com/photo-1521295121783-8a321d551ad2?auto=format&fit=crop&w=1200&q=80', tag: 'Backwaters' },
    { name: 'RAJASTHAN', image: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1200&q=80', tag: 'Royal trails' },
    { name: 'LADAKH', image: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1200&q=80', tag: 'High-altitude wonder' },
  ];

  return (
    <div className="premium-shell mx-auto max-w-[1500px] px-4 py-8 sm:px-6 lg:px-10">
      <div className="editorial-hero rounded-[32px] border border-[#111111]/8 bg-white/60 p-6 shadow-[0_20px_60px_rgba(17,17,17,0.04)] sm:p-8 lg:p-12">
        <div className="grid items-center gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="fade-up">
            <p className="section-label mb-4">Curated for you</p>
            <h1 className="max-w-[700px] text-[2.5rem] font-extrabold leading-[0.9] tracking-[-0.08em] text-[#111111] sm:text-[4rem] lg:text-[6rem]">
              PLAN.<br />
              EXPLORE.<br />
              TRAVEL.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-[#111111]/70 sm:text-lg">
              Welcome back, {profile?.full_name?.split(' ')[0] || 'Traveler'}. Your next unforgettable journey is waiting for a smarter itinerary.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <button onClick={() => navigate('/planner')} className="btn-primary">
                <Plane className="h-4 w-4" /> Plan My Trip
              </button>
              <button onClick={() => navigate('/destinations')} className="btn-secondary">
                <Compass className="h-4 w-4" /> Explore Places
              </button>
            </div>
          </div>

          <div className="fade-in relative overflow-hidden rounded-[30px] border border-[#111111]/8 bg-[#e7e3df] p-2 shadow-[0_20px_40px_rgba(17,17,17,0.08)]">
            <img
              src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80"
              alt="Travel destination"
              className="photo-zoom h-[500px] w-full rounded-[24px] object-cover"
            />
            <div className="absolute inset-x-8 bottom-8 flex items-center justify-between gap-3 rounded-full border border-white/20 bg-[#111111]/55 px-4 py-3 text-white backdrop-blur-sm">
              <div>
                <div className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-white/70">This week</div>
                <div className="text-lg font-bold">Himalayan Escape</div>
              </div>
              <button className="rounded-full bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[#111111]">
                View
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'AI Plans Used', value: stats.trips, icon: Plane },
          { label: 'Saved Trips', value: stats.bookings, icon: CreditCard },
          { label: 'Memories', value: stats.memories, icon: Heart },
          { label: 'Travel Posts', value: stats.posts, icon: Camera },
        ].map((item, index) => (
          <div key={item.label} className="card p-5 fade-up" style={{ animationDelay: `${index * 80}ms` }}>
            <item.icon className="mb-3 h-8 w-8 text-[#111111]" />
            <div className="text-3xl font-extrabold tracking-[-0.07em] text-[#111111]">{item.value}</div>
            <div className="mt-1 text-sm font-medium text-[#111111]/60">{item.label}</div>
          </div>
        ))}
      </div>

      {route.params.subscription === 'success' && (
        <div className="mt-8 flex items-center gap-3 rounded-[20px] border border-[#16a34a]/20 bg-[#f0fdf4] p-4 text-[#166534]">
          <CheckCircle2 className="h-5 w-5" />
          <div>
            <div className="font-extrabold">Premium subscription activated</div>
            <div className="text-sm text-[#166534]/80">Your YatraAI Premium plan is now live.</div>
          </div>
        </div>
      )}

      <section className="mt-14">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="section-label">Featured escapes</p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-[-0.06em] text-[#111111] sm:text-4xl">Destination stories</h2>
          </div>
          <button onClick={() => navigate('/destinations')} className="btn-secondary hidden sm:inline-flex">
            View all <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {destinations.map((destination, index) => (
            <button
              key={destination.name}
              onClick={() => navigate('/planner')}
              className="group relative h-[420px] overflow-hidden rounded-[28px] text-left fade-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <img src={destination.image} alt={destination.name} className="photo-zoom h-full w-full object-cover transition duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#111111]/80 via-[#111111]/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6">
                <div className="mb-3 text-xs font-extrabold uppercase tracking-[0.2em] text-white/75">{destination.tag}</div>
                <div className="text-4xl font-black tracking-[-0.08em] text-white sm:text-5xl">{destination.name}</div>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="mt-14 rounded-[28px] border border-[#111111]/8 bg-[#f8f6f3] p-6 sm:p-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="section-label">Quick actions</p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-[-0.06em] text-[#111111]">Travel smarter</h2>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => (
            <Link key={card.label} to={card.to} className="group card p-5">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: `${card.tone}14`, color: card.tone }}>
                <card.icon className="h-5 w-5" />
              </div>
              <div className="text-xl font-extrabold tracking-[-0.05em] text-[#111111]">{card.label}</div>
              <p className="mt-2 text-sm leading-6 text-[#111111]/60">{card.desc}</p>
              <div className="mt-4 inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.16em] text-[#111111]/70">
                Open <ArrowRight className="h-4 w-4" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-14 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="card p-7">
          <p className="section-label">Why YatraAI</p>
          <h3 className="mt-3 text-3xl font-extrabold tracking-[-0.06em] text-[#111111]">Design built around your journey</h3>
          <div className="mt-7 grid gap-4 md:grid-cols-3">
            {[
              { title: 'Budget-first', text: 'Plans stay within your spending limits with clear optimization.' },
              { title: 'Country-smart', text: 'Your trip matches the right destinations, routes and recommendations.' },
              { title: 'Day-by-day', text: 'Detailed itineraries, transport, stays and city guidance are kept in view.' },
            ].map((item) => (
              <div key={item.title} className="rounded-[22px] border border-[#111111]/8 bg-[#f8f6f3] p-4">
                <div className="mb-3 text-sm font-extrabold uppercase tracking-[0.14em] text-[#111111]/60">{item.title}</div>
                <p className="text-sm leading-6 text-[#111111]/70">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-7 bg-[#111111] text-white">
          <p className="section-label text-white/70">This week</p>
          <h3 className="mt-3 text-3xl font-extrabold tracking-[-0.06em] text-white">Travel insights</h3>
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between rounded-[18px] border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#dfeaf9] text-[#111111]"><CloudSun className="h-5 w-5" /></div>
                <div>
                  <div className="text-sm text-white/70">Weather</div>
                  <div className="font-bold">24°C • Clear skies</div>
                </div>
              </div>
              <div className="text-sm text-white/60">Manali</div>
            </div>
            <div className="flex items-center justify-between rounded-[18px] border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#dfeaf9] text-[#111111]"><Map className="h-5 w-5" /></div>
                <div>
                  <div className="text-sm text-white/70">Route</div>
                  <div className="font-bold">Shimla → Manali</div>
                </div>
              </div>
              <div className="text-sm text-white/60">4h 30m</div>
            </div>
            <div className="flex items-center justify-between rounded-[18px] border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#dfeaf9] text-[#111111]"><StarsIcon /></div>
                <div>
                  <div className="text-sm text-white/70">Planner score</div>
                  <div className="font-bold">94% match</div>
                </div>
              </div>
              <div className="text-sm text-white/60">Best fit</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function StarsIcon() {
  return <Star className="h-5 w-5" />;
}