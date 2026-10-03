import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Link, navigate } from '@/lib/router';
import { Plane, Mail, Lock, User, Phone, Eye, EyeOff, AlertCircle, Loader2, MapPin } from 'lucide-react';

export function SignupPage() {
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (mobile && !/^[0-9+\-\s]{10,15}$/.test(mobile)) {
      setError('Please enter a valid mobile number');
      return;
    }

    setLoading(true);
    const { error } = await signUp(email, password, fullName, mobile);
    setLoading(false);
    if (error) {
      setError(error);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f4f1ed] p-4 text-[#111111]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.12),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(245,158,11,0.12),_transparent_28%)]" />

      <div className="relative mx-auto flex min-h-screen max-w-6xl items-center justify-center gap-8">
        <div className="hidden flex-1 overflow-hidden rounded-[32px] border border-[#111111]/8 bg-white p-3 shadow-[0_25px_70px_rgba(17,17,17,0.08)] lg:block">
          <div className="relative h-[760px] overflow-hidden rounded-[26px]">
            <img
              src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1200&q=80"
              alt="Mountain travel destination"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#111111]/80 via-[#111111]/20 to-[#111111]/10" />
            <div className="absolute inset-x-0 bottom-0 p-8 text-white">
              <div className="mb-3 inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.18em] text-white/80">
                Your first trip
              </div>
              <h2 className="max-w-md text-4xl font-black tracking-[-0.08em]">Begin your next story with a smarter plan.</h2>
            </div>
          </div>
        </div>

        <div className="w-full max-w-lg">
          <div className="mb-7 text-center">
            <div className="mb-5 inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#111111] text-white shadow-[0_18px_40px_rgba(17,17,17,0.18)]">
              <Plane className="h-8 w-8" />
            </div>
            <h1 className="text-4xl font-black tracking-[-0.08em] text-[#111111]">Create your account</h1>
            <p className="mt-2 text-sm font-medium text-[#111111]/60">Start planning your next trip with YatraAI</p>
          </div>

          <div className="rounded-[28px] border border-[#111111]/8 bg-white p-7 shadow-[0_25px_70px_rgba(17,17,17,0.08)]">
            {error && (
              <div className="mb-4 flex items-start gap-2 rounded-2xl border border-[#ef4444]/20 bg-[#fef2f2] px-4 py-3 text-sm text-[#991b1b]">
                <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-bold uppercase tracking-[0.12em] text-[#111111]/60">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#111111]/40" />
                  <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} className="input-field pl-11" placeholder="John Doe" />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold uppercase tracking-[0.12em] text-[#111111]/60">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#111111]/40" />
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input-field pl-11" placeholder="you@example.com" />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold uppercase tracking-[0.12em] text-[#111111]/60">Mobile Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#111111]/40" />
                  <input type="tel" value={mobile} onChange={(e) => setMobile(e.target.value)} className="input-field pl-11" placeholder="+91 98765 43210" />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold uppercase tracking-[0.12em] text-[#111111]/60">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#111111]/40" />
                  <input type={showPassword ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)} className="input-field pl-11 pr-11" placeholder="••••••••" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#111111]/50 hover:text-[#111111]">
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold uppercase tracking-[0.12em] text-[#111111]/60">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#111111]/40" />
                  <input type={showPassword ? 'text' : 'password'} required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="input-field pl-11" placeholder="••••••••" />
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plane className="h-5 w-5" />}
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>

            <div className="mt-5 text-center text-sm text-[#111111]/70">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-[#111111] underline-offset-4 hover:underline">Login</Link>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-[#111111]/60">
            <MapPin className="h-4 w-4" />
            <span>AI-powered travel planning for India & beyond</span>
          </div>
        </div>
      </div>
    </div>
  );
}
