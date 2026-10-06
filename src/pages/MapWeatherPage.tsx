import { useMemo } from 'react';
import { navigate } from '@/lib/router';
import { LiveMapWeather } from '@/components/LiveMapWeather';
import type { Destination } from '@/types';

function toDestinationArray(value: string | null | undefined): Destination[] {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed as Destination[];
    }
    if (parsed?.destinations && Array.isArray(parsed.destinations)) {
      return parsed.destinations as Destination[];
    }
    if (parsed?.route && Array.isArray(parsed.route)) {
      return parsed.route
        .filter(Boolean)
        .map((name: string, index: number) => ({
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
    // Ignore malformed session data and fall through to a safe fallback.
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
    const destinations = toDestinationArray(value);
    if (destinations.length > 0) return destinations;
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

export function MapWeatherPage() {
  const destinations = useMemo(() => getStoredDestinations(), []);

  const handleBack = () => {
    if (sessionStorage.getItem('selectedPlan')) {
      navigate('/plan-details');
      return;
    }
    if (sessionStorage.getItem('currentTripForm')) {
      navigate('/plans');
      return;
    }
    if (sessionStorage.getItem('pendingBooking')) {
      navigate('/my-trips');
      return;
    }
    navigate('/dashboard');
  };

  return (
    <LiveMapWeather
      destinations={destinations}
      showUserLocation
      title="Map"
      fullScreen
      onBack={handleBack}
    />
  );
}
