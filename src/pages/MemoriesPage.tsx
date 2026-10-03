import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import type { Memory } from '@/types';
import { Heart, Upload, Calendar, MapPin, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { formatDate } from '@/lib/format';

export function MemoriesPage() {
  const { user, profile } = useAuth();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [caption, setCaption] = useState('');
  const [destination, setDestination] = useState('');
  const [memoryDate, setMemoryDate] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadMemories();
  }, [user]);

  const loadMemories = async () => {
    if (!user) return;
    const { data } = await supabase.from('travel_memories').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    setMemories((data as Memory[]) || []);
    setLoading(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoUrl(reader.result as string);
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!photoUrl || !destination) return;
    const { error } = await supabase.from('travel_memories').insert({
      user_id: user?.id,
      destination,
      caption,
      photo_url: photoUrl,
      memory_date: memoryDate || null,
    });
    if (!error) {
      setShowForm(false);
      setCaption('');
      setDestination('');
      setMemoryDate('');
      setPhotoUrl('');
      loadMemories();
    }
  };

  if (loading) return <div className="min-h-[40vh] flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary-600" /></div>;

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Heart className="h-6 w-6 text-error-500" />
            <h1 className="text-3xl font-extrabold text-gray-900">Travel Memories</h1>
          </div>
          <p className="text-gray-500">Capture and share your favorite travel moments</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          <Upload className="h-5 w-5" /> Upload Photo
        </button>
      </div>

      {memories.length === 0 ? (
        <div className="card p-12 text-center">
          <ImageIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900">No Memories Yet</h2>
          <p className="text-gray-500 mt-2">Upload your first travel photo to start building your memory collection!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {memories.map((m) => (
            <div key={m.id} className="card overflow-hidden group">
              <div className="relative h-56 overflow-hidden">
                <img src={m.photo_url} alt={m.caption || m.destination} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-3 left-3">
                  <span className="badge bg-white/90 text-gray-800 backdrop-blur"><MapPin className="h-3 w-3" /> {m.destination}</span>
                </div>
              </div>
              <div className="p-4">
                {m.caption && <p className="text-sm text-gray-700 italic mb-2">"{m.caption}"</p>}
                <p className="text-xs text-gray-400 flex items-center gap-1"><Calendar className="h-3 w-3" /> {formatDate(m.memory_date)}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Upload Memory</h2>
              <button onClick={() => setShowForm(false)}><X className="h-5 w-5 text-gray-400" /></button>
            </div>
            <div className="space-y-4">
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full rounded-xl border-2 border-dashed border-gray-300 p-8 text-center hover:border-primary-400 hover:bg-primary-50 transition-all"
              >
                {uploading ? <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary-600" /> :
                 photoUrl ? <img src={photoUrl} alt="Preview" className="max-h-40 mx-auto rounded-lg" /> :
                 <><Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" /><p className="text-sm text-gray-500">Click to select a photo</p></>}
              </button>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Destination</label>
                <input type="text" value={destination} onChange={(e) => setDestination(e.target.value)} className="input-field" placeholder="e.g. Manali" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Caption</label>
                <input type="text" value={caption} onChange={(e) => setCaption(e.target.value)} className="input-field" placeholder="Beautiful mountain view!" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Date</label>
                <input type="date" value={memoryDate} onChange={(e) => setMemoryDate(e.target.value)} className="input-field" />
              </div>
              <button onClick={handleSave} disabled={!photoUrl || !destination} className="w-full btn-primary disabled:opacity-50">Save Memory</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
