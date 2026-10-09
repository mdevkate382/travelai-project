
import { MapPin, MessageCircle, Quote } from 'lucide-react';

const reviews = [
  {
    name: 'Aarav Sharma',
    destination: 'Manali, Himachal Pradesh',
    title: 'A memorable mountain escape',
    review:
      'The mountain views were beautiful, and the itinerary helped us explore local attractions without feeling rushed.',
    date: '12 September 2026',
  },
  {
    name: 'Priya Mehta',
    destination: 'Jaipur, Rajasthan',
    title: 'A wonderful cultural trip',
    review:
      'Exploring the forts, local markets, and traditional food made this trip special. The travel plan was easy to follow.',
    date: '4 September 2026',
  },
  {
    name: 'Rohan Patil',
    destination: 'Goa',
    title: 'A relaxing coastal getaway',
    review:
      'The trip gave us time to enjoy the beaches, discover local cafes, and explore at our own pace.',
    date: '28 August 2026',
  },
  {
    name: 'Ananya Desai',
    destination: 'Kerala',
    title: 'Beautiful nature and peaceful stays',
    review:
      'The greenery, backwaters, and local experiences made this a lovely travel idea for a family holiday.',
    date: '19 August 2026',
  },
];

export function ReviewsPage() {
  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-10">
        <div className="mb-3 flex items-center gap-3">
          <MessageCircle className="h-8 w-8 text-amber-500" />
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Travel Reviews
          </h1>
        </div>
        <p className="text-lg text-gray-500">
          Discover travel experiences shared with YatraAI.
        </p>
      </header>

      <div className="grid gap-5 md:grid-cols-2">
        {reviews.map((review, index) => (
          <article
            key={`${review.name}-${index}`}
            className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <Quote className="mb-4 h-8 w-8 text-amber-500" />

            <h2 className="mb-3 text-xl font-bold text-gray-900">
              {review.title}
            </h2>

            <p className="mb-6 leading-7 text-gray-600">
              “{review.review}”
            </p>

            <div className="border-t border-gray-100 pt-4">
              <p className="font-semibold text-gray-900">
                {review.name}
              </p>

              <p className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                <MapPin className="h-4 w-4 text-amber-500" />
                {review.destination}
              </p>

              <p className="mt-2 text-xs text-gray-400">
                {review.date}
              </p>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
