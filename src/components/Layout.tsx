import { Link } from '@/lib/router';
import { useAuth } from '@/context/AuthContext';
import { Plane, Menu, X, User, LogOut, Settings, MapPin, Heart, Calendar, Compass, Sparkles, MessageSquare, CloudSun, Map, ChevronDown, Crown } from 'lucide-react';
import { useState } from 'react';

export function Navbar() {
  const { user, profile, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Home', to: '/dashboard' },
    { label: 'AI Planner', to: '/planner' },
    { label: 'Destinations', to: '/destinations' },
    { label: 'Subscription', to: '/subscription' },
    { label: 'Explore Reels', to: '/explore-reels' },
    { label: 'My Trips', to: '/my-trips' },
    { label: 'Maps', to: '/compare' },
    { label: 'Weather', to: '/about' },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-[#111111]/8 bg-[#f4f1ed]/90 backdrop-blur-xl">
      <nav className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-10">
        <div className="flex h-20 items-center justify-between gap-4">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#111111] text-lg font-black text-white">
              <Plane className="h-5 w-5" />
            </div>
            <span className="text-[1.7rem] font-extrabold tracking-[-0.08em] text-[#111111]">YatraAI</span>
          </Link>

          <div className="hidden flex-1 items-center justify-center lg:flex">
            <div className="flex items-center gap-2 rounded-full border border-[#111111]/10 bg-white/70 px-2 py-2 shadow-[0_8px_20px_rgba(17,17,17,0.03)]">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="rounded-full px-4 py-2 text-sm font-semibold text-[#111111]/80 transition-all duration-200 hover:bg-[#111111]/5 hover:text-[#111111]"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-3 rounded-full border border-[#111111]/10 bg-white px-3 py-2 shadow-sm transition hover:border-[#111111]/20"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#dfeaf9] text-sm font-extrabold text-[#111111]">
                    {profile?.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="hidden text-sm font-semibold text-[#111111] sm:inline">
                    {profile?.full_name || 'Profile'}
                  </span>
                  <ChevronDown className="h-4 w-4 text-[#111111]/70" />
                </button>

                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 z-20 mt-3 w-56 rounded-[22px] border border-[#111111]/8 bg-white p-2 shadow-[0_20px_50px_rgba(17,17,17,0.12)]">
                      <Link to="/profile" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-[#111111]/80 hover:bg-[#111111]/5">
                        <User className="h-4 w-4" /> Profile
                      </Link>
                      <Link to="/my-trips" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-[#111111]/80 hover:bg-[#111111]/5">
                        <Calendar className="h-4 w-4" /> My Trips
                      </Link>
                      <Link to="/memories" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-[#111111]/80 hover:bg-[#111111]/5">
                        <Heart className="h-4 w-4" /> Memories
                      </Link>
                      <Link to="/chatbot" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-[#111111]/80 hover:bg-[#111111]/5">
                        <MessageSquare className="h-4 w-4" /> AI Assistant
                      </Link>
                      <Link to="/subscription" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-[#111111]/80 hover:bg-[#111111]/5">
                        <Crown className="h-4 w-4" /> Subscription
                      </Link>
                      <button
                        onClick={() => { signOut(); setUserMenuOpen(false); }}
                        className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm font-medium text-[#d14343] hover:bg-[#fff5f5]"
                      >
                        <LogOut className="h-4 w-4" /> Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="rounded-full px-4 py-2 text-sm font-semibold text-[#111111] transition hover:bg-[#111111]/5">
                  Login
                </Link>
                <Link to="/signup" className="rounded-full bg-[#111111] px-5 py-2.5 text-sm font-semibold text-white transition hover:translate-y-[-1px] hover:bg-[#1e1e1e]">
                  Sign Up
                </Link>
              </>
            )}

            <button className="lg:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="border-t border-[#111111]/8 py-3 lg:hidden">
            {navLinks.map((link) => (
              <Link key={link.to} to={link.to} onClick={() => setMobileOpen(false)} className="block rounded-2xl px-4 py-2.5 text-sm font-medium text-[#111111]/80 hover:bg-[#111111]/5">
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </nav>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-[#111111]/8 bg-[#f1eee9]">
      <div className="mx-auto grid max-w-[1500px] gap-10 px-4 py-12 sm:px-6 lg:grid-cols-4 lg:px-10">
        <div>
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#111111] text-white">
              <Plane className="h-5 w-5" />
            </div>
            <span className="text-xl font-extrabold tracking-[-0.07em] text-[#111111]">YatraAI</span>
          </div>
          <p className="max-w-xs text-sm leading-6 text-[#111111]/70">Curated journeys, local expertise, and AI-powered planning for your next unforgettable trip.</p>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-extrabold uppercase tracking-[0.14em] text-[#111111]/60">Explore</h4>
          <div className="space-y-2 text-sm text-[#111111]/80">
            <div><Link to="/destinations">Destinations</Link></div>
            <div><Link to="/planner">AI Planner</Link></div>
            <div><Link to="/subscription">Subscription</Link></div>
            <div><Link to="/compare">Compare</Link></div>
            <div><Link to="/my-trips">My Trips</Link></div>
          </div>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-extrabold uppercase tracking-[0.14em] text-[#111111]/60">Features</h4>
          <div className="space-y-2 text-sm text-[#111111]/80">
            <div><Link to="/chatbot">AI Assistant</Link></div>
            <div><Link to="/explore-reels">Explore Reels</Link></div>
            <div><Link to="/memories">Travel Memories</Link></div>
            <div><Link to="/about">About</Link></div>
          </div>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-extrabold uppercase tracking-[0.14em] text-[#111111]/60">Connect</h4>
          <div className="space-y-2 text-sm text-[#111111]/80">
            <div>support@yatraai.com</div>
            <div>+91 98765 43210</div>
            <div>Bengaluru, India</div>
          </div>
        </div>
      </div>
    </footer>
  );
}
