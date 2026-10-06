import { supabase } from '@/lib/supabase';
import { ALL_DESTINATIONS } from '@/data/destinations';
import type { Destination, Plan, TripFormData } from '@/types';

const EDGE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org';
let lastNominatimRequest = 0;

function getAuthHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
  };
}

async function fetchNominatim(url: string) {
  const wait = Math.max(0, 1000 - (Date.now() - lastNominatimRequest));
  if (wait) await new Promise((resolve) => setTimeout(resolve, wait));
  lastNominatimRequest = Date.now();

  const response = await fetch(url, {
    headers: { 'Accept-Language': navigator.language || 'en' },
  });
  if (!response.ok) throw new Error(`Location search failed (${response.status})`);
  return response.json();
}

function parseNominatimLocation(data: any): Destination {
  const address = data.address || {};
  const name = data.name || data.display_name?.split(',')[0] || 'Unknown';
  const city = address.city || address.town || address.village || address.municipality ||
    address.hamlet || address.county || address.state_district || name;

  return {
    name,
    city,
    state: address.state || '',
    country: address.country || '',
    country_code: (address.country_code || '').toUpperCase(),
    latitude: Number(data.lat),
    longitude: Number(data.lon),
    place_id: String(data.place_id || data.osm_id || ''),
  };
}

function searchLocalDestinations(query: string): Destination[] {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  return ALL_DESTINATIONS
    .filter((destination) => [destination.name, destination.city, destination.state, destination.country]
      .some((value) => value.toLocaleLowerCase().includes(normalizedQuery)))
    .slice(0, 8)
    .map((destination) => ({
      name: destination.name,
      city: destination.city,
      state: destination.state,
      country: destination.country,
      country_code: destination.country_code,
      latitude: destination.lat,
      longitude: destination.lng,
      place_id: `catalog-${destination.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    }));
}

function deduplicateDestinations(results: Destination[]): Destination[] {
  const seen = new Set<string>();
  return results.filter((destination) => {
    const key = [destination.name, destination.city, destination.state, destination.country]
      .map((value) => value.trim().toLocaleLowerCase())
      .join('|');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function reverseGeocode(lat: number, lng: number): Promise<Destination | null> {
  try {
    const resp = await fetch(`${EDGE_URL}/geocode/reverse`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ lat, lng }),
    });
    if (resp.ok) {
      const data = await resp.json();
      if (!data.error && data.location?.city && data.location.city !== 'Unknown') {
        return data.location as Destination;
      }
    }
  } catch { /* Use the public geocoder as a fallback. */ }

  try {
    const params = new URLSearchParams({
      format: 'json',
      lat: String(lat),
      lon: String(lng),
      zoom: '15',
      addressdetails: '1',
    });
    return parseNominatimLocation(await fetchNominatim(`${NOMINATIM_URL}/reverse?${params}`));
  } catch {
    return null;
  }
}

export async function searchDestinations(query: string): Promise<Destination[]> {
  if (!query.trim()) return [];
  const localResults = searchLocalDestinations(query);
  if (localResults.length) return localResults;

  try {
    const resp = await fetch(`${EDGE_URL}/geocode/search`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ query }),
    });
    if (resp.ok) {
      const data = await resp.json();
      if (!data.error && Array.isArray(data.results) && data.results.length) {
        return deduplicateDestinations(data.results as Destination[]);
      }
    }
  } catch { /* Try the public geocoder as a fallback. */ }

  try {
    const params = new URLSearchParams({
      format: 'json',
      q: query.trim(),
      addressdetails: '1',
      limit: '8',
    });
    const results = await fetchNominatim(`${NOMINATIM_URL}/search?${params}`);
    return Array.isArray(results) ? deduplicateDestinations(results.map(parseNominatimLocation)) : [];
  } catch {
    return [];
  }
}

export async function generatePlans(formData: TripFormData): Promise<Plan[]> {
  const resp = await fetch(`${EDGE_URL}/generate-plans`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(formData),
  });
  if (!resp.ok) throw new Error('Failed to generate plans');
  const data = await resp.json();
  if (data.error) throw new Error(data.error);
  return data.plans as Plan[];
}

export async function createTripBooking(payload: {
  userId: string;
  tripId: string;
  planId: string;
  destination: string;
  travelDate: string;
  numberOfTravelers: number;
  totalAmount: number;
  selectedPlan: string;
  planName?: string;
  paymentMethod?: string;
}) {
  const { data: { session } } = await supabase.auth.getSession();
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY}`,
  };

  const resp = await fetch(`${EDGE_URL}/create-booking`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  const data = await resp.json().catch(() => ({}));
  if (!resp.ok || data.error) {
    throw new Error(data.error || 'Booking request failed. Please try again.');
  }

  return data;
}

export async function confirmTripPayment(payload: {
  bookingId: string;
  paymentMethod: string;
  amount: number;
  currency?: string;
  paymentMode?: string;
}) {
  const { data: { session } } = await supabase.auth.getSession();
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY}`,
  };

  const resp = await fetch(`${EDGE_URL}/confirm-payment`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  const data = await resp.json().catch(() => ({}));
  if (!resp.ok || data.error) {
    throw new Error(data.error || 'Payment confirmation failed.');
  }

  return data;
}

export function detectCurrentLocation(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (!window.isSecureContext) {
      reject(new Error('Current location requires a secure connection (HTTPS or localhost).'));
      return;
    }
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => resolve({ lat: position.coords.latitude, lng: position.coords.longitude }),
      (error) => {
        let msg = 'Could not get your location';
        if (error.code === error.PERMISSION_DENIED) msg = 'Location permission denied. Please allow location access or enter manually.';
        else if (error.code === error.POSITION_UNAVAILABLE) msg = 'Location information unavailable';
        else if (error.code === error.TIMEOUT) msg = 'Location request timed out';
        reject(new Error(msg));
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 0 }
    );
  });
}
