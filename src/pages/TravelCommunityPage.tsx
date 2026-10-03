import { useMemo, useState } from 'react';
import { Camera, Heart, MessageCircle, Bookmark, Share2, MapPin, CalendarDays, Wallet, Hotel, Sparkles, Plus, Users, ChevronRight, Send, ImagePlus, Star } from 'lucide-react';
import { Link, navigate } from '@/lib/router';
import { getTravelPosts, isPremiumUnlocked, setTravelPosts, type TravelPost } from '@/lib/subscriptions';

export function TravelCommunityPage() {
  const [posts, setPosts] = useState<TravelPost[]>(() => getTravelPosts());
  const [caption, setCaption] = useState('');
  const [destination, setDestination] = useState('Manali, Himachal Pradesh');
  const [tripDuration, setTripDuration] = useState('4 Days / 3 Nights');
  const [budget, setBudget] = useState('18500');
  const [hotel, setHotel] = useState('Snow Valley Resort');
  const [places, setPlaces] = useState('Solang Valley, Mall Road, Rohtang Pass');
  const [hashtags, setHashtags] = useState('#Travel #Manali #MountainEscape');
  const [showComposer, setShowComposer] = useState(false);

  const canShare = isPremiumUnlocked();

  const handlePublish = () => {
    if (!caption.trim()) return;

    const nextPost: TravelPost = {
      id: `post-${Date.now()}`,
      userId: 'me',
      userName: 'You',
      userAvatar: 'YO',
      destination: destination || 'Unknown Destination',
      caption: caption.trim(),
      tripDuration: tripDuration || '3 Days / 2 Nights',
      budget: Number(budget) || 0,
      hotel: hotel || 'Not specified',
      placesVisited: places.split(',').map((p) => p.trim()).filter(Boolean),
      hashtags: hashtags.split(/\s+/).filter((tag) => tag.startsWith('#')),
      images: [
        'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80',
      ],
      createdAt: new Date().toISOString(),
      likes: 0,
      comments: [],
      saved: false,
      likedByMe: false,
    };

    const updated = [nextPost, ...posts];
    setPosts(updated);
    setTravelPosts(updated);
    setCaption('');
    setShowComposer(false);
  };

  const handleToggleLike = (id: string) => {
    const updated = posts.map((post) => {
      if (post.id !== id) return post;
      const likedByMe = !post.likedByMe;
      return {
        ...post,
        likedByMe,
        likes: Math.max(0, post.likes + (likedByMe ? 1 : -1)),
      };
    });
    setPosts(updated);
    setTravelPosts(updated);
  };

  const handlePlanSimilar = (post: TravelPost) => {
    sessionStorage.setItem(
      'communityPlanContext',
      JSON.stringify({
        destination: post.destination,
        duration: post.tripDuration,
        budget: post.budget,
        hotel: post.hotel,
        places: post.placesVisited,
        caption: post.caption,
      })
    );
    navigate('/planner');
  };

  const totalPosts = posts.length;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 rounded-3xl bg-gradient-to-br from-primary-700 via-primary-600 to-accent-500 p-6 md:p-8 text-white shadow-xl">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-primary-100">Travel Community</p>
            <h1 className="mt-2 text-3xl md:text-4xl font-extrabold">Share stories, inspire plans, and travel together</h1>
            <p className="mt-2 max-w-2xl text-primary-100">Discover destination stories, see practical trip budgets, and turn ideas into personalized itineraries.</p>
          </div>
          <button onClick={() => setShowComposer((prev) => !prev)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 font-bold text-primary-700 shadow-lg">
            <Plus className="h-5 w-5" /> Share Your Travel Experience
          </button>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: 'Travel Posts', value: totalPosts },
          { label: 'Active Travelers', value: '1.2k+' },
          { label: 'Saved Places', value: '25' },
          { label: 'Trips Inspired', value: '640' },
        ].map((stat) => (
          <div key={stat.label} className="card p-4 text-center">
            <p className="text-2xl font-extrabold text-primary-600">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {showComposer && (
        <div className="card mb-8 p-5 md:p-6">
          <div className="mb-5 flex items-center gap-2 text-lg font-bold text-gray-900">
            <Camera className="h-5 w-5 text-primary-600" /> Create a Travel Post
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-semibold text-gray-700">Caption</label>
              <textarea value={caption} onChange={(e) => setCaption(e.target.value)} rows={4} className="input-field" placeholder="Share your travel story..." />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">Destination</label>
              <input value={destination} onChange={(e) => setDestination(e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">Trip Duration</label>
              <input value={tripDuration} onChange={(e) => setTripDuration(e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">Approx Budget (₹)</label>
              <input value={budget} onChange={(e) => setBudget(e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">Hotel Info</label>
              <input value={hotel} onChange={(e) => setHotel(e.target.value)} className="input-field" />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-semibold text-gray-700">Places Visited</label>
              <input value={places} onChange={(e) => setPlaces(e.target.value)} className="input-field" />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-semibold text-gray-700">Hashtags</label>
              <input value={hashtags} onChange={(e) => setHashtags(e.target.value)} className="input-field" />
            </div>
            <div className="md:col-span-2">
              <button className="inline-flex items-center gap-2 rounded-xl border border-dashed border-primary-300 bg-primary-50 px-4 py-3 text-sm font-semibold text-primary-700">
                <ImagePlus className="h-4 w-4" /> Upload Travel Photos
              </button>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button onClick={handlePublish} className="btn-primary">
              <Send className="h-4 w-4" /> Publish Post
            </button>
          </div>
        </div>
      )}

      {!canShare && (
        <div className="mb-8 rounded-3xl border border-primary-200 bg-gradient-to-r from-primary-50 to-accent-50 p-5 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-primary-700">Premium feature</p>
              <h3 className="mt-2 text-2xl font-extrabold text-gray-900">Upload and share experiences with Premium</h3>
              <p className="mt-1 text-gray-600">This feature is available with YatraAI Premium. Unlock community posting and AI-powered trip similarity tools.</p>
            </div>
            <button onClick={() => navigate('/subscription')} className="btn-primary">
              <Star className="h-4 w-4" /> Upgrade to Premium
            </button>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {posts.map((post) => (
          <article key={post.id} className="card overflow-hidden">
            <div className="p-5 pb-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-primary-600 to-accent-500 text-sm font-bold text-white">{post.userAvatar}</div>
                  <div>
                    <h3 className="font-bold text-gray-900">{post.userName}</h3>
                    <p className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                </div>
                <div className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700">{post.destination}</div>
              </div>
            </div>

            <div className="grid gap-3 px-5 md:grid-cols-2">
              {post.images.map((image, index) => (
                <img key={`${post.id}-${index}`} src={image} alt={post.destination} className="h-64 w-full rounded-2xl object-cover" />
              ))}
            </div>

            <div className="p-5">
              <div className="mb-3 flex flex-wrap gap-2 text-xs text-gray-500">
                <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1"><CalendarDays className="h-3 w-3" /> {post.tripDuration}</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1"><Wallet className="h-3 w-3" /> ₹{post.budget.toLocaleString('en-IN')}</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1"><Hotel className="h-3 w-3" /> {post.hotel}</span>
              </div>

              <p className="mb-4 text-gray-700">{post.caption}</p>

              <div className="mb-4 grid gap-2 text-sm text-gray-700 md:grid-cols-2">
                <div>
                  <p className="mb-1 font-semibold text-gray-900">Places visited</p>
                  <p>{post.placesVisited.join(', ')}</p>
                </div>
                <div>
                  <p className="mb-1 font-semibold text-gray-900">Hotel</p>
                  <p>{post.hotel}</p>
                </div>
              </div>

              <div className="mb-4 flex flex-wrap gap-2">
                {post.hashtags.map((tag) => (
                  <span key={tag} className="rounded-full bg-accent-50 px-2.5 py-1 text-xs font-semibold text-accent-700">{tag}</span>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-4 border-t border-gray-100 pt-4 text-sm">
                <button onClick={() => handleToggleLike(post.id)} className={`inline-flex items-center gap-2 font-semibold ${post.likedByMe ? 'text-error-600' : 'text-gray-600'}`}>
                  <Heart className={`h-4 w-4 ${post.likedByMe ? 'fill-current' : ''}`} /> {post.likes}
                </button>
                <button className="inline-flex items-center gap-2 font-semibold text-gray-600">
                  <MessageCircle className="h-4 w-4" /> {post.comments.length}
                </button>
                <button className="inline-flex items-center gap-2 font-semibold text-gray-600">
                  <Bookmark className="h-4 w-4" /> Save
                </button>
                <button className="ml-auto inline-flex items-center gap-2 font-semibold text-primary-700">
                  <Share2 className="h-4 w-4" /> Share
                </button>
              </div>

              <div className="mt-4 rounded-2xl bg-gray-50 p-3">
                <button onClick={() => handlePlanSimilar(post)} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-accent-500 px-4 py-3 font-bold text-white shadow-md">
                  <Sparkles className="h-4 w-4" /> Plan a Similar Trip
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
