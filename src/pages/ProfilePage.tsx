import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { User, Mail, Phone, Calendar, Loader2, CheckCircle2 } from 'lucide-react';

export function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [stats, setStats] = useState({ trips: 0, bookings: 0, memories: 0, reviews: 0 });

  useEffect(() => {
    setFullName(profile?.full_name || '');
    setPhone(profile?.phone || '');
    (async () => {
      if (!user) return;
      const [{ count: trips }, { count: bookings }, { count: memories }, { count: reviews }] = await Promise.all([
        supabase.from('trips').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('travel_memories').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('reviews').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
      ]);
      setStats({ trips: trips || 0, bookings: bookings || 0, memories: memories || 0, reviews: reviews || 0 });
    })();
  }, [user, profile]);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase.from('profiles').update({ full_name: fullName, phone, updated_at: new Date().toISOString() }).eq('id', user?.id);
    if (!error) {
      await refreshProfile();
      setSaved(true);
      setEditing(false);
      setTimeout(() => setSaved(false), 3000);
    }
    setSaving(false);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">My Profile</h1>

      <div className="card p-8 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-600 to-accent-500 text-white text-3xl font-extrabold shadow-lg">
            {profile?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{profile?.full_name || 'User'}</h2>
            <p className="text-sm text-gray-500">{user?.email}</p>
            <p className="text-xs text-gray-400 mt-1">Member since {new Date(user?.created_at || Date.now()).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</p>
          </div>
        </div>

        {saved && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-success-50 border border-success-200 px-4 py-3 text-sm text-success-700">
            <CheckCircle2 className="h-5 w-5" /> Profile updated successfully!
          </div>
        )}

        {!editing ? (
          <div className="space-y-4">
            <ProfileRow icon={User} label="Full Name" value={profile?.full_name || 'Not set'} />
            <ProfileRow icon={Mail} label="Email" value={user?.email || ''} />
            <ProfileRow icon={Phone} label="Phone" value={profile?.phone || 'Not set'} />
            <button onClick={() => setEditing(true)} className="mt-4 btn-secondary">Edit Profile</button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Phone</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="input-field" placeholder="+91 98765 43210" />
            </div>
            <div className="flex gap-2">
              <button onClick={handleSave} disabled={saving} className="btn-primary disabled:opacity-50">
                {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />} Save Changes
              </button>
              <button onClick={() => setEditing(false)} className="btn-secondary">Cancel</button>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Trips', value: stats.trips },
          { label: 'Bookings', value: stats.bookings },
          { label: 'Memories', value: stats.memories },
          { label: 'Reviews', value: stats.reviews },
        ].map((s) => (
          <div key={s.label} className="card p-5 text-center">
            <p className="text-3xl font-extrabold text-primary-600">{s.value}</p>
            <p className="text-sm text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProfileRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
      <Icon className="h-5 w-5 text-primary-600" />
      <div className="flex-1">
        <p className="text-xs text-gray-400 font-semibold uppercase">{label}</p>
        <p className="text-sm text-gray-900 font-medium">{value}</p>
      </div>
    </div>
  );
}
