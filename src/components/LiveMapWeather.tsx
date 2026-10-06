import { useEffect, useMemo, useState } from 'react';
import { CircleMarker, MapContainer, Polyline, TileLayer, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Loader2, MapPinned } from 'lucide-react';
import { searchDestinations } from '@/lib/api';
import type { Destination } from '@/types';

type LiveMapWeatherProps = {
  destinations?: Destination[];
  showUserLocation?: boolean;
  title?: string;
  className?: string;
  fullScreen?: boolean;
  onBack?: () => void;
};


async function resolveDestination(destination: Destination): Promise<Destination> {
  if (destination.latitude !== null && destination.longitude !== null) {
    return destination;
  }

  if (!destination.name && !destination.city) {
    return destination;
  }

  const query = [destination.name, destination.city, destination.state, destination.country].filter(Boolean).join(' ');
  const results = await searchDestinations(query);
  const match = results.find((item) => {
    const normalizedName = (item.name || '').toLowerCase();
    const normalizedCity = (item.city || '').toLowerCase();
    const normalizedDestination = (destination.name || destination.city || '').toLowerCase();
    return normalizedName.includes(normalizedDestination) || normalizedCity.includes(normalizedDestination);
  }) || results[0];

  if (!match) return destination;

  return {
    ...destination,
    name: match.name || destination.name,
    city: match.city || destination.city,
    state: match.state || destination.state,
    country: match.country || destination.country,
    country_code: match.country_code || destination.country_code,
    latitude: match.latitude ?? destination.latitude,
    longitude: match.longitude ?? destination.longitude,
    place_id: match.place_id || destination.place_id,
  };
}

const DEFAULT_CENTER: [number, number] = [20.5937, 78.9629];

export function LiveMapWeather({ destinations = [], showUserLocation = false, title = 'Map', className = '', fullScreen = false, onBack }: LiveMapWeatherProps) {
  const [resolvedDestinations, setResolvedDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        setError('');

        const cleanedDestinations = destinations.filter((destination) => destination && (destination.name || destination.city));
        if (cleanedDestinations.length === 0) {
          setResolvedDestinations([]);
          setLoading(false);
          return;
        }

        const resolved = await Promise.all(cleanedDestinations.map(resolveDestination));
        if (!isMounted) return;

        const validDestinations = resolved.filter((destination) => destination.latitude !== null && destination.longitude !== null) as Destination[];
        setResolvedDestinations(validDestinations);

        if (showUserLocation && navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              if (isMounted) {
                setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
              }
            },
            () => {
              if (isMounted) setUserLocation(null);
            },
            { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
          );
        }
      } catch (loadError: any) {
        if (isMounted) {
          setError(loadError.message || 'Unable to load the map.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [destinations, showUserLocation]);

  const mapCoordinates = useMemo(() => {
    return resolvedDestinations
      .filter((destination) => destination.latitude !== null && destination.longitude !== null)
      .map((destination) => [Number(destination.latitude), Number(destination.longitude)] as [number, number]);
  }, [resolvedDestinations]);

  const primaryDestination = resolvedDestinations[0];
  const mapCenter = primaryDestination && primaryDestination.latitude !== null && primaryDestination.longitude !== null
    ? [Number(primaryDestination.latitude), Number(primaryDestination.longitude)] as [number, number]
    : mapCoordinates[0] ?? DEFAULT_CENTER;

  if (fullScreen) {
    return (
      <div className="fixed inset-0 overflow-hidden bg-slate-100">
        <div className="absolute inset-0">
          {loading || error ? (
            <div className="flex h-full items-center justify-center bg-slate-100 text-slate-700">
              <div className="rounded-2xl border border-slate-200 bg-white/80 px-6 py-4 text-center shadow-xl backdrop-blur">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary-600" />
                <p className="mt-3 text-lg font-semibold">{error || 'Loading Map...'}</p>
              </div>
            </div>
          ) : (
            <MapContainer center={mapCenter} zoom={6} scrollWheelZoom className="h-full w-full">
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {resolvedDestinations.map((destination, index) => {
                if (destination.latitude === null || destination.longitude === null) return null;
                const position: [number, number] = [Number(destination.latitude), Number(destination.longitude)];
                return (
                  <CircleMarker
                    key={`${destination.place_id || destination.name}-${index}`}
                    center={position}
                    radius={index === 0 ? 12 : 10}
                    pathOptions={{
                      color: index === 0 ? '#0f766e' : '#f59e0b',
                      fillColor: index === 0 ? '#14b8a6' : '#fbbf24',
                      fillOpacity: 0.95,
                    }}
                  >
                    <Tooltip>{destination.name || destination.city}</Tooltip>
                  </CircleMarker>
                );
              })}

              {userLocation && (
                <CircleMarker
                  center={[userLocation.lat, userLocation.lng]}
                  radius={9}
                  pathOptions={{ color: '#ef4444', fillColor: '#fca5a5', fillOpacity: 0.9 }}
                >
                  <Tooltip>Your current location</Tooltip>
                </CircleMarker>
              )}

              {mapCoordinates.length > 1 && <Polyline positions={mapCoordinates} pathOptions={{ color: '#2563eb', weight: 3, opacity: 0.8 }} />}
            </MapContainer>
          )}
        </div>

        <div className="pointer-events-none absolute inset-0 z-[600]">
          <div className="absolute left-4 right-4 top-4 flex items-start justify-between gap-3">
            <div className="pointer-events-auto flex items-center gap-3 rounded-full border border-slate-200 bg-white/85 px-3 py-2 shadow-lg backdrop-blur-sm">
              {onBack && (
                <button onClick={onBack} className="flex items-center gap-2 rounded-full bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-700">
                  ← Back
                </button>
              )}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Map</p>
                <p className="text-sm font-bold text-slate-900">{primaryDestination?.name || 'Destination'}</p>
              </div>
            </div>

            <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-slate-200 bg-white/85 px-3 py-2 shadow-lg backdrop-blur-sm">
              <button
                onClick={() => {
                  if (!navigator.geolocation) return;
                  navigator.geolocation.getCurrentPosition(
                    (position) => setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude }),
                    () => setUserLocation(null),
                    { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
                  );
                }}
                className="rounded-full bg-primary-600 px-3 py-2 text-sm font-semibold text-white hover:bg-primary-700"
              >
                Current location
              </button>
            </div>
          </div>

          <div className="absolute left-4 top-20 flex flex-wrap gap-2">
            {['Hotels', 'Restaurants', 'Things to Do', 'Transport'].map((label) => (
              <button key={label} className="pointer-events-auto rounded-full border border-slate-200 bg-white/85 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur-sm">
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`card p-5 md:p-6 ${className}`}>
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100 text-primary-700">
          <MapPinned className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary-600">Live data</p>
          <h3 className="text-xl font-extrabold text-gray-900">{title}</h3>
        </div>
      </div>

      {loading ? (
        <div className="flex min-h-[180px] items-center justify-center gap-3 rounded-2xl border border-dashed border-primary-200 bg-primary-50 text-primary-700">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="font-medium">Loading map...</span>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-warning-200 bg-warning-50 p-4 text-sm text-warning-800">
          {error}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="h-72 overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
            <MapContainer center={mapCenter} zoom={6} scrollWheelZoom className="h-full w-full">
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {resolvedDestinations.map((destination, index) => {
                if (destination.latitude === null || destination.longitude === null) return null;
                const position: [number, number] = [Number(destination.latitude), Number(destination.longitude)];
                return (
                  <CircleMarker
                    key={`${destination.place_id || destination.name}-${index}`}
                    center={position}
                    radius={index === 0 ? 10 : 8}
                    pathOptions={{
                      color: index === 0 ? '#0f766e' : '#f59e0b',
                      fillColor: index === 0 ? '#14b8a6' : '#fbbf24',
                      fillOpacity: 0.9,
                    }}
                  >
                    <Tooltip>{destination.name || destination.city}</Tooltip>
                  </CircleMarker>
                );
              })}

              {userLocation && (
                <CircleMarker
                  center={[userLocation.lat, userLocation.lng]}
                  radius={8}
                  pathOptions={{ color: '#ef4444', fillColor: '#fca5a5', fillOpacity: 0.9 }}
                >
                  <Tooltip>Your current location</Tooltip>
                </CircleMarker>
              )}

              {mapCoordinates.length > 1 && <Polyline positions={mapCoordinates} pathOptions={{ color: '#2563eb', weight: 3, opacity: 0.8 }} />}
            </MapContainer>
          </div>
        </div>
      )}
    </div>
  );
}
