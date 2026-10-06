import { useEffect, useMemo, useState } from 'react';
import { CloudSun, Droplets, Loader2, MapPin, Navigation, Wind } from 'lucide-react';
import { navigate } from '@/lib/router';
import type { Destination } from '@/types';

const WEATHER_CODE_MAP: Record<number, { condition: string; icon: string }> = {
  0: { condition: 'Clear', icon: '☀️' },
  1: { condition: 'Mostly clear', icon: '🌤️' },
  2: { condition: 'Partly cloudy', icon: '⛅' },
  3: { condition: 'Cloudy', icon: '☁️' },
  45: { condition: 'Foggy', icon: '🌫️' },
  48: { condition: 'Foggy', icon: '🌫️' },
  51: { condition: 'Light drizzle', icon: '🌦️' },
  53: { condition: 'Drizzle', icon: '🌦️' },
  55: { condition: 'Heavy drizzle', icon: '🌧️' },
  56: { condition: 'Freezing drizzle', icon: '🌧️' },
  57: { condition: 'Freezing drizzle', icon: '🌧️' },
  61: { condition: 'Light rain', icon: '🌦️' },
  63: { condition: 'Rain', icon: '🌧️' },
  65: { condition: 'Heavy rain', icon: '🌧️' },
  66: { condition: 'Freezing rain', icon: '🌧️' },
  67: { condition: 'Heavy freezing rain', icon: '🌧️' },
  71: { condition: 'Light snow', icon: '🌨️' },
  73: { condition: 'Snow', icon: '🌨️' },
  75: { condition: 'Heavy snow', icon: '🌨️' },
  77: { condition: 'Snow grains', icon: '🌨️' },
  80: { condition: 'Showers', icon: '🌦️' },
  81: { condition: 'Heavy showers', icon: '🌧️' },
  82: { condition: 'Very heavy showers', icon: '⛈️' },
  85: { condition: 'Snow showers', icon: '🌨️' },
  86: { condition: 'Heavy snow showers', icon: '🌨️' },
  95: { condition: 'Thunderstorm', icon: '⛈️' },
  96: { condition: 'Thunderstorm with hail', icon: '⛈️' },
  99: { condition: 'Thunderstorm with hail', icon: '⛈️' },
};

type WeatherSnapshot = {
  condition: string;
  icon: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  shortForecast: string;
};

function normalizeDestination(value: string | null | undefined): Destination[] {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed as Destination[];
    if (parsed?.destinations && Array.isArray(parsed.destinations)) return parsed.destinations as Destination[];
    if (parsed?.route && Array.isArray(parsed.route)) {
      return parsed.route.map((name: string, index: number) => ({
        name,
        city: name,
        state: '',
        country: parsed?.primary_country || 'India',
        country_code: parsed?.primary_country_code || 'IN',
        latitude: null,
        longitude: null,
        place_id: `route-${index}-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      }));
    }
    if (parsed?.destination) {
      return [{
        name: parsed.destination,
        city: parsed.destination,
        state: '',
        country: 'India',
        country_code: 'IN',
        latitude: null,
        longitude: null,
        place_id: `destination-${parsed.destination.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      }];
    }
  } catch {
    // ignore malformed values
  }

  return [];
}

function getStoredDestinations(): Destination[] {
  const sources = [
    sessionStorage.getItem('currentTripForm'),
    sessionStorage.getItem('selectedPlan'),
    sessionStorage.getItem('pendingBooking'),
    sessionStorage.getItem('lastBooking'),
    sessionStorage.getItem('generatedPlans'),
  ];

  for (const value of sources) {
    const normalized = normalizeDestination(value);
    if (normalized.length > 0) return normalized;
  }

  return [{
    name: 'Goa',
    city: 'Goa',
    state: '',
    country: 'India',
    country_code: 'IN',
    latitude: 15.2993,
    longitude: 74.1240,
    place_id: 'fallback-goa',
  }];
}

async function resolveDestination(destination: Destination): Promise<Destination> {
  if (destination.latitude !== null && destination.longitude !== null) return destination;

  const query = [destination.name, destination.city, destination.state, destination.country].filter(Boolean).join(' ');
  if (!query.trim()) return destination;

  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=1`);
    const results = await response.json();
    const match = results?.[0];
    if (!match) return destination;

    return {
      ...destination,
      name: destination.name || match.display_name?.split(',')[0] || 'Destination',
      city: destination.city || match.address?.city || match.address?.town || match.address?.village || 'Destination',
      state: destination.state || match.address?.state || '',
      country: destination.country || match.address?.country || 'India',
      country_code: destination.country_code || (match.address?.country_code || 'IN').toUpperCase(),
      latitude: Number(match.lat),
      longitude: Number(match.lon),
      place_id: match.place_id || destination.place_id,
    };
  } catch {
    return destination;
  }
}

async function fetchWeather(lat: number, lng: number): Promise<WeatherSnapshot> {
  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=3`
  );

  if (!response.ok) throw new Error('Weather unavailable.');

  const data = await response.json();
  const current = data.current ?? {};
  const temperature = Number(current.temperature_2m ?? 0);
  const code = Number(current.weather_code ?? 0);
  const meta = WEATHER_CODE_MAP[code] ?? { condition: 'Weather update', icon: '🌤️' };
  const dailyHigh = Number(data.daily?.temperature_2m_max?.[0] ?? temperature);
  const dailyLow = Number(data.daily?.temperature_2m_min?.[0] ?? temperature);

  return {
    condition: meta.condition,
    icon: meta.icon,
    temperature,
    feelsLike: Number(current.apparent_temperature ?? temperature),
    humidity: Number(current.relative_humidity_2m ?? 0),
    windSpeed: Number(current.wind_speed_10m ?? 0),
    shortForecast: `${meta.condition} • High ${Math.round(dailyHigh)}°C / Low ${Math.round(dailyLow)}°C`,
  };
}

export function WeatherPage() {
  const destinations = useMemo(() => getStoredDestinations(), []);
  const [resolvedDestination, setResolvedDestination] = useState<Destination | null>(null);
  const [weather, setWeather] = useState<WeatherSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setLoading(true);
        setError('');

        const primary = destinations[0] ?? {
          name: 'Goa',
          city: 'Goa',
          state: '',
          country: 'India',
          country_code: 'IN',
          latitude: 15.2993,
          longitude: 74.1240,
          place_id: 'fallback-goa',
        };

        const resolved = await resolveDestination(primary);
        if (!active) return;

        setResolvedDestination(resolved);

        if (resolved.latitude !== null && resolved.longitude !== null) {
          const liveWeather = await fetchWeather(Number(resolved.latitude), Number(resolved.longitude));
          if (active) setWeather(liveWeather);
        }
      } catch (err: any) {
        if (active) setError(err.message || 'Unable to load weather.');
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => { active = false; };
  }, [destinations]);

  const title = resolvedDestination?.name || 'Destination';

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between gap-3">
          <button onClick={() => navigate('/dashboard')} className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700">
            ← Back
          </button>
          <div className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
            Weather
          </div>
        </div>

        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
          <div className="bg-gradient-to-r from-primary-700 to-primary-600 p-6 text-white">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-primary-100">
              <MapPin className="h-4 w-4" /> Live Weather
            </div>
            <h1 className="mt-3 text-3xl font-black">{title}</h1>
          </div>

          <div className="p-6 md:p-8">
            {loading ? (
              <div className="flex min-h-[220px] items-center justify-center gap-3 text-primary-700">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="font-semibold">Loading weather...</span>
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
            ) : weather ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 p-5">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Current</p>
                    <div className="mt-2 flex items-end gap-3">
                      <span className="text-5xl font-black text-slate-900">{Math.round(weather.temperature)}°C</span>
                      <span className="pb-2 text-sm text-slate-600">Feels like {Math.round(weather.feelsLike)}°C</span>
                    </div>
                  </div>
                  <div className="text-6xl">{weather.icon}</div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl bg-primary-50 p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-primary-700"><CloudSun className="h-4 w-4" /> Condition</div>
                    <div className="mt-2 text-lg font-bold text-slate-900">{weather.condition}</div>
                  </div>
                  <div className="rounded-2xl bg-cyan-50 p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-cyan-700"><Droplets className="h-4 w-4" /> Humidity</div>
                    <div className="mt-2 text-lg font-bold text-slate-900">{Math.round(weather.humidity)}%</div>
                  </div>
                  <div className="rounded-2xl bg-indigo-50 p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-indigo-700"><Wind className="h-4 w-4" /> Wind</div>
                    <div className="mt-2 text-lg font-bold text-slate-900">{Math.round(weather.windSpeed)} km/h</div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-center gap-2 font-semibold text-slate-700"><Navigation className="h-4 w-4 text-primary-600" /> Short forecast</div>
                  <p className="mt-2 text-base text-slate-800">{weather.shortForecast}</p>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-slate-600">Weather data is unavailable for this destination yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
