import { useState } from 'react';
import { navigate } from '@/lib/router';
import { INDIAN_DESTINATIONS, INTERNATIONAL_DESTINATIONS, type DestData } from '@/data/destinations';
import { MapPin, Search, Compass, Star, Plus } from 'lucide-react';
import { formatINR } from '@/lib/format';

const DEST_IMAGES: Record<string, string> = {
  Manali: 'https://images.pexels.com/photos/37911658/pexels-photo-37911658.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
  Jaipur: 'https://images.pexels.com/photos/22602478/pexels-photo-22602478.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
  Goa: 'https://images.pexels.com/photos/6789839/pexels-photo-6789839.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
  Kerala: 'https://images.pexels.com/photos/17928231/pexels-photo-17928231.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
  Agra: 'https://images.pexels.com/photos/14533217/pexels-photo-14533217.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
  Darjeeling: 'https://images.pexels.com/photos/37898606/pexels-photo-37898606.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
  Rishikesh: 'https://images.pexels.com/photos/4381164/pexels-photo-4381164.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
  Munnar: 'https://images.pexels.com/photos/36998153/pexels-photo-36998153.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
  Dubai: 'https://images.pexels.com/photos/28350363/pexels-photo-28350363.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
  Singapore: 'https://images.pexels.com/photos/19664340/pexels-photo-19664340.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
  Bangkok: 'https://images.pexels.com/photos/19720922/pexels-photo-19720922.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
  Bali: 'https://images.pexels.com/photos/11435608/pexels-photo-11435608.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
  London: 'https://images.pexels.com/photos/28350363/pexels-photo-28350363.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
  Tokyo: 'https://images.pexels.com/photos/15693280/pexels-photo-15693280.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
};

export function DestinationsPage() {
  const [filter, setFilter] = useState<'all' | 'india' | 'international'>('all');
  const [search, setSearch] = useState('');

  const all = [...INDIAN_DESTINATIONS, ...INTERNATIONAL_DESTINATIONS];
  const filtered = all.filter((d) => {
    if (filter === 'india' && d.country_code !== 'IN') return false;
    if (filter === 'international' && d.country_code === 'IN') return false;
    if (search && !d.name.toLowerCase().includes(search.toLowerCase()) && !d.country.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-600 to-accent-500 text-white shadow-lg mb-3">
          <Compass className="h-6 w-6" />
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900">Explore Destinations</h1>
        <p className="text-gray-500 mt-2">Discover incredible places in India and around the world</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-11" placeholder="Search destinations..." />
        </div>
        <div className="flex gap-2">
          {(['all', 'india', 'international'] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`px-4 py-3 rounded-xl font-semibold text-sm capitalize transition-all ${filter === f ? 'bg-primary-600 text-white shadow-lg' : 'bg-gray-100 text-gray-700 hover:bg-primary-50'}`}>
              {f === 'all' ? 'All' : f === 'india' ? '🇮🇳 India' : '🌍 International'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((d) => (
          <DestinationCard key={d.name} dest={d} img={DEST_IMAGES[d.name] || DEST_IMAGES.Jaipur} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No destinations found. Try a different search.</p>
        </div>
      )}
    </div>
  );
}

function DestinationCard({ dest, img }: { dest: DestData; img: string }) {
  const minCost = Math.min(...dest.hotels.map((h) => h.cost));
  return (
    <div className="card overflow-hidden group cursor-pointer hover:-translate-y-1 transition-transform" onClick={() => navigate('/planner')}>
      <div className="relative h-48 overflow-hidden">
        <img src={img} alt={dest.name} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-xl font-bold text-white">{dest.name}</h3>
          <p className="text-sm text-white/80 flex items-center gap-1"><MapPin className="h-3 w-3" /> {dest.state}, {dest.country}</p>
        </div>
        <div className="absolute top-3 right-3">
          <span className="badge bg-white/90 text-gray-800 backdrop-blur">From {formatINR(minCost)}/night</span>
        </div>
      </div>
      <div className="p-4">
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{dest.description}</p>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {dest.types.slice(0, 3).map((t) => (
            <span key={t} className="badge bg-primary-50 text-primary-700">{t}</span>
          ))}
        </div>
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <span className="flex items-center gap-1"><Star className="h-3 w-3 text-warning-400" /> Weather: {dest.weather}</span>
          <span>{dest.nearby.length} nearby spots</span>
        </div>
        <button className="w-full rounded-xl bg-primary-50 py-2.5 text-sm font-semibold text-primary-700 hover:bg-primary-100 transition-all flex items-center justify-center gap-1">
          <Plus className="h-4 w-4" /> Plan Trip Here
        </button>
      </div>
    </div>
  );
}
