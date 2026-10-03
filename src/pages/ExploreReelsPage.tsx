import { useMemo, useState } from 'react';
import { navigate } from '@/lib/router';
import { REEL_CATEGORIES, travelReels, getReelVideoSource, type Reel, type ReelCategory } from '@/lib/reels';
import { Heart, MessageCircle, Bookmark, Share2, MapPinned, Plane, Flag, Upload, CheckCircle2, Camera, X } from 'lucide-react';

export function ExploreReelsPage() {
  const [selectedCategory, setSelectedCategory] = useState<'All' | ReelCategory>('All');
  const [reels, setReels] = useState<Reel[]>(travelReels);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'success'>('idle');
  const [progress, setProgress] = useState(0);
  const [form, setForm] = useState({
    caption: '',
    destination: 'Manali',
    location: 'Solang Valley',
    category: 'Mountains' as ReelCategory,
    hashtags: '#Manali #Snowtrip',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [failedVideoIds, setFailedVideoIds] = useState<Record<string, boolean>>({});

  const visibleReels = useMemo(() => {
    if (selectedCategory === 'All') return reels;
    return reels.filter((reel) => reel.category === selectedCategory);
  }, [reels, selectedCategory]);

  const toggleLike = (id: string) => {
    setReels((prev) => prev.map((reel) => {
      if (reel.id !== id) return reel;
      const liked = !reel.liked;
      return {
        ...reel,
        liked,
        likes: Math.max(0, reel.likes + (liked ? 1 : -1)),
      };
    }));
  };

  const toggleSave = (id: string) => {
    setReels((prev) => prev.map((reel) => {
      if (reel.id !== id) return reel;
      const saved = !reel.saved;
      return {
        ...reel,
        saved,
        saves: Math.max(0, reel.saves + (saved ? 1 : -1)),
      };
    }));
  };

  const handleShare = async (reel: Reel) => {
    const shareText = `Check out this ${reel.destination} reel from YatraAI: ${reel.caption}`;
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(shareText);
    }
    alert(`Shared: ${reel.destination}`);
  };

  const handleReport = (id: string) => {
    const confirmed = window.confirm('Would you like to report this reel for review?');
    if (!confirmed) return;
    setReels((prev) => prev.filter((reel) => reel.id !== id));
    alert('Reel reported successfully. Our moderation team will review it.');
  };

  const handlePlanThisTrip = (reel: Reel) => {
    sessionStorage.setItem('reelDestination', reel.destination);
    sessionStorage.setItem('reelDestinationMeta', JSON.stringify({
      destination: reel.destination,
      location: reel.location,
      category: reel.category,
    }));
    navigate('/planner');
  };

  const handleViewLocation = (reel: Reel) => {
    sessionStorage.setItem('destinationFocus', reel.destination);
    navigate('/destinations');
  };

  const handleUpload = () => {
    if (!selectedFile) {
      alert('Please select a video file to upload.');
      return;
    }

    const validTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-matroska'];
    if (!validTypes.includes(selectedFile.type)) {
      alert('Only video files (MP4, WebM, MOV, MKV) are allowed.');
      return;
    }

    if (selectedFile.size > 50 * 1024 * 1024) {
      alert('Video must be smaller than 50MB.');
      return;
    }

    setUploadState('uploading');
    const interval = setInterval(() => {
      setProgress((previous) => {
        const next = previous + 20;
        if (next >= 100) {
          clearInterval(interval);
          setUploadState('success');
          setProgress(100);
          return 100;
        }
        return next;
      });
    }, 220);

    setTimeout(() => {
      const newReel: Reel = {
        id: `uploaded-${Date.now()}`,
        creator: 'You',
        profile: 'New creator',
        destination: form.destination,
        location: form.location,
        category: form.category,
        caption: form.caption || 'A new travel moment from my journey.',
        hashtags: form.hashtags.split(' ').filter(Boolean),
        coverImage: selectedFile ? URL.createObjectURL(selectedFile) : 'https://images.pexels.com/photos/22602478/pexels-photo-22602478.jpeg?auto=compress&cs=tinysrgb&w=1200',
        videoUrl: selectedFile ? URL.createObjectURL(selectedFile) : undefined,
        likes: 0,
        comments: 0,
        saves: 0,
        views: 0,
        liked: false,
        saved: false,
        isDemo: false,
      };

      setReels((prev) => [newReel, ...prev]);
      setUploadOpen(false);
      setForm({
        caption: '',
        destination: 'Manali',
        location: 'Solang Valley',
        category: 'Mountains',
        hashtags: '#Manali #Snowtrip',
      });
      setSelectedFile(null);
      setUploadState('idle');
      setProgress(0);
      alert('Your reel has been published successfully!');
    }, 1500);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary-600">Explore Reels</p>
          <h1 className="mt-2 text-3xl font-extrabold text-gray-900">Travel Reels</h1>
          <p className="mt-2 text-gray-500">Get inspired, discover hidden gems, and plan your next trip.</p>
        </div>

        <button onClick={() => setUploadOpen(true)} className="btn-primary">
          <Upload className="h-5 w-5" /> Upload Reel
        </button>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory('All')}
          className={`rounded-full px-4 py-2 text-sm font-semibold ${selectedCategory === 'All' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 border border-gray-200'}`}
        >
          All
        </button>
        {REEL_CATEGORIES.map((category) => (
          <button
            key={category.label}
            onClick={() => setSelectedCategory(category.label)}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${selectedCategory === category.label ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 border border-gray-200'}`}
          >
            {category.emoji} {category.label}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {visibleReels.map((reel) => {
          const reelVideoSource = getReelVideoSource(reel);
          const shouldShowVideo = !(failedVideoIds[reel.id]);

          return (
            <article key={reel.id} className="overflow-hidden rounded-[28px] border border-gray-200 bg-white shadow-sm transition-all hover:shadow-xl">
              <div className="relative">
                <div className="absolute left-4 top-4 z-10 rounded-full bg-black/40 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                  {reel.isDemo ? 'Demo Reel' : 'User Reel'}
                </div>
                <div className="absolute right-4 top-4 z-10 rounded-full bg-white/80 px-2 py-1 text-xs font-bold text-primary-700">
                  {reel.category}
                </div>
                <div className="relative h-[440px] overflow-hidden bg-gray-900">
                  {shouldShowVideo ? (
                    <video
                      key={`${reel.id}-${reelVideoSource}`}
                      src={reelVideoSource}
                      poster={reel.coverImage}
                      muted
                      playsInline
                      loop
                      preload="metadata"
                      autoPlay
                      controls={false}
                      onError={() => setFailedVideoIds((prev) => ({ ...prev, [reel.id]: true }))}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <img src={reel.coverImage} alt={reel.destination} className="h-full w-full object-cover" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                </div>
              </div>

            <div className="p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-primary-600 to-accent-500 font-bold text-white">
                    {reel.creator.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{reel.creator}</p>
                    <p className="text-xs text-gray-500">{reel.profile}</p>
                  </div>
                </div>
                <button onClick={() => handleReport(reel.id)} className="rounded-full bg-red-50 p-2 text-red-600 hover:bg-red-100">
                  <Flag className="h-4 w-4" />
                </button>
              </div>

              <div className="mb-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-primary-700">
                  <MapPinned className="h-4 w-4" /> {reel.destination}
                </div>
                <p className="mt-2 text-sm text-gray-500">{reel.location}</p>
              </div>

              <p className="text-sm text-gray-700 leading-relaxed">{reel.caption}</p>

              <div className="mt-3 flex flex-wrap gap-2">
                {reel.hashtags.map((tag) => (
                  <span key={tag} className="rounded-full bg-primary-50 px-2 py-1 text-[11px] font-semibold text-primary-700">{tag}</span>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                <span>👀 {reel.views.toLocaleString()}</span>
                <span>💬 {reel.comments}</span>
                <span>📍 {reel.location}</span>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <button onClick={() => toggleLike(reel.id)} className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold ${reel.liked ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-700'}`}>
                  <Heart className={`h-4 w-4 ${reel.liked ? 'fill-current' : ''}`} /> {reel.likes}
                </button>
                <button className="inline-flex items-center gap-2 rounded-xl bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-700">
                  <MessageCircle className="h-4 w-4" /> {reel.comments}
                </button>
                <button onClick={() => toggleSave(reel.id)} className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold ${reel.saved ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-700'}`}>
                  <Bookmark className={`h-4 w-4 ${reel.saved ? 'fill-current' : ''}`} /> {reel.saves}
                </button>
                <button onClick={() => handleShare(reel)} className="inline-flex items-center gap-2 rounded-xl bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-700">
                  <Share2 className="h-4 w-4" /> Share
                </button>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <button onClick={() => handleViewLocation(reel)} className="btn-secondary text-xs px-3 py-2.5">
                  <MapPinned className="h-4 w-4" /> View Location
                </button>
                <button onClick={() => handlePlanThisTrip(reel)} className="btn-primary text-xs px-3 py-2.5">
                  <Plane className="h-4 w-4" /> Plan This Trip
                </button>
              </div>
              </div>
            </article>
          );
        })}
      </div>

      {uploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-[28px] bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary-600">Upload Reel</p>
                <h2 className="mt-2 text-2xl font-extrabold text-gray-900">Share a travel moment</h2>
              </div>
              <button onClick={() => setUploadOpen(false)} className="rounded-full bg-gray-100 p-2 text-gray-600 hover:bg-gray-200">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <label className="block">
                <span className="mb-1 block text-sm font-semibold text-gray-700">Travel video</span>
                <input
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime,video/x-matroska"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="file:mr-4 file:rounded-xl file:border-0 file:bg-primary-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary-700"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm font-semibold text-gray-700">Caption</span>
                <textarea value={form.caption} onChange={(e) => setForm({ ...form, caption: e.target.value })} rows={3} className="input-field" placeholder="Describe your trip moment..." />
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-sm font-semibold text-gray-700">Destination</span>
                  <input value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} className="input-field" />
                </label>
                <label className="block">
                  <span className="mb-1 block text-sm font-semibold text-gray-700">Location</span>
                  <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="input-field" />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-sm font-semibold text-gray-700">Category</span>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as ReelCategory })} className="input-field">
                    {REEL_CATEGORIES.map((category) => (
                      <option key={category.label} value={category.label}>{category.label}</option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1 block text-sm font-semibold text-gray-700">Hashtags</span>
                  <input value={form.hashtags} onChange={(e) => setForm({ ...form, hashtags: e.target.value })} className="input-field" placeholder="#Travel #Adventure" />
                </label>
              </div>

              {uploadState !== 'idle' && (
                <div className="rounded-2xl border border-primary-100 bg-primary-50 p-4">
                  {uploadState === 'uploading' ? (
                    <div>
                      <div className="mb-2 flex items-center justify-between text-sm font-semibold text-primary-700">
                        <span>Uploading reel...</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="h-2.5 w-full overflow-hidden rounded-full bg-primary-100">
                        <div className="h-full rounded-full bg-primary-600 transition-all" style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-success-700">
                      <CheckCircle2 className="h-5 w-5" /> <span>Uploaded successfully. Your reel is now live.</span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setUploadOpen(false)} className="btn-secondary">Cancel</button>
                <button onClick={handleUpload} className="btn-primary">
                  <Camera className="h-4 w-4" /> Publish Reel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
