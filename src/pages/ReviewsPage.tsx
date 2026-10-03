import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import type { Review } from '@/types';
import { Star, Plus, X, Calendar, MapPin, Loader2 } from 'lucide-react';
import { formatDate } from '@/lib/format';

export function ReviewsPage() {
  const { user, profile } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [destination, setDestination] = useState('');
  const [tripTitle, setTripTitle] = useState('');
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');

  useEffect(() => {
    loadReviews();
  }, [user]);

  const loadReviews = async () => {
    if (!user) return;
    const { data } = await supabase.from('reviews').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    setReviews((data as Review[]) || []);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!destination || !reviewText) return;
    const { error } = await supabase.from('reviews').insert({
      user_id: user?.id,
      destination,
      trip_title: tripTitle,
      rating,
      review_text: reviewText,
    });
    if (!error) {
      setShowForm(false);
      setDestination('');
      setTripTitle('');
      setRating(5);
      setReviewText('');
      loadReviews();
    }
  };

  if (loading) return <div className="min-h-[40vh] flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary-600" /></div>;

  const avgRating = reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : '0';

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Star className="h-6 w-6 text-warning-500" />
            <h1 className="text-3xl font-extrabold text-gray-900">Reviews & Ratings</h1>
          </div>
          <p className="text-gray-500">Share your travel experiences with the community</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          <Plus className="h-5 w-5" /> Write Review
        </button>
      </div>

      {reviews.length > 0 && (
        <div className="card p-6 mb-6 text-center">
          <p className="text-4xl font-extrabold text-warning-500">{avgRating}</p>
          <div className="flex justify-center gap-1 my-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className={`h-5 w-5 ${i < Math.round(parseFloat(avgRating)) ? 'fill-warning-400 text-warning-400' : 'text-gray-300'}`} />
            ))}
          </div>
          <p className="text-sm text-gray-500">{reviews.length} review{reviews.length > 1 ? 's' : ''}</p>
        </div>
      )}

      {reviews.length === 0 ? (
        <div className="card p-12 text-center">
          <Star className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900">No Reviews Yet</h2>
          <p className="text-gray-500 mt-2">Share your first travel review!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="card p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="h-4 w-4 text-primary-600" />
                    <span className="font-bold text-gray-900">{r.destination}</span>
                  </div>
                  {r.trip_title && <p className="text-sm text-gray-500">{r.trip_title}</p>}
                </div>
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-4 w-4 ${i < r.rating ? 'fill-warning-400 text-warning-400' : 'text-gray-300'}`} />
                  ))}
                </div>
              </div>
              <p className="text-gray-700 italic">"{r.review_text}"</p>
              <p className="text-xs text-gray-400 mt-3 flex items-center gap-1"><Calendar className="h-3 w-3" /> {formatDate(r.created_at)}</p>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Write a Review</h2>
              <button onClick={() => setShowForm(false)}><X className="h-5 w-5 text-gray-400" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Destination</label>
                <input type="text" value={destination} onChange={(e) => setDestination(e.target.value)} className="input-field" placeholder="e.g. Manali" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Trip Title (optional)</label>
                <input type="text" value={tripTitle} onChange={(e) => setTripTitle(e.target.value)} className="input-field" placeholder="My Himalayan Adventure" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} onClick={() => setRating(n)}>
                      <Star className={`h-8 w-8 transition-all ${n <= rating ? 'fill-warning-400 text-warning-400' : 'text-gray-300 hover:text-warning-300'}`} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Review</label>
                <textarea value={reviewText} onChange={(e) => setReviewText(e.target.value)} className="input-field min-h-[100px] resize-y" placeholder="Share your experience..." />
              </div>
              <button onClick={handleSave} disabled={!destination || !reviewText} className="w-full btn-primary disabled:opacity-50">Submit Review</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
