import { supabase } from '@/lib/supabase';
import type { Destination, Plan, TripFormData } from '@/types';

const EDGE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

function getAuthHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
  };
}

export async function reverseGeocode(lat: number, lng: number): Promise<Destination | null> {
  try {
    const resp = await fetch(`${EDGE_URL}/geocode/reverse`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ lat, lng }),
    });
    if (!resp.ok) return null;
    const data = await resp.json();
    if (data.error) return null;
    return data.location as Destination;
  } catch {
    return null;
  }
}

export async function searchDestinations(query: string): Promise<Destination[]> {
  if (!query.trim()) return [];
  try {
    const resp = await fetch(`${EDGE_URL}/geocode/search`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ query }),
    });
    if (!resp.ok) return [];
    const data = await resp.json();
    if (data.error) return [];
    return data.results as Destination[];
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

export function detectCurrentLocation(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
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
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  });
}
