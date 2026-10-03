import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface GeocodeResult {
  name: string;
  city: string;
  state: string;
  country: string;
  country_code: string;
  latitude: number;
  longitude: number;
  place_id: string;
}

// Reverse geocode: lat/lng -> address
async function reverseGeocode(lat: number, lng: number): Promise<GeocodeResult | null> {
  const googleKey = Deno.env.get("GOOGLE_MAPS_API_KEY");

  // Try Google first if key is available
  if (googleKey) {
    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${googleKey}`;
      const resp = await fetch(url);
      const data = await resp.json();
      if (data.results && data.results.length > 0) {
        return parseGoogleResult(data.results[0], lat, lng);
      }
    } catch (e) {
      console.error("Google reverse geocode failed:", e);
    }
  }

  // Fallback: Nominatim (OpenStreetMap) - free, no key needed
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`;
    const resp = await fetch(url, {
      headers: { "User-Agent": "YatraAI/1.0" },
    });
    const data = await resp.json();
    if (data && data.address) {
      return parseNominatimResult(data, lat, lng);
    }
  } catch (e) {
    console.error("Nominatim reverse geocode failed:", e);
  }

  return null;
}

// Forward geocode: query -> location
async function forwardGeocode(query: string): Promise<GeocodeResult[]> {
  const googleKey = Deno.env.get("GOOGLE_MAPS_API_KEY");

  if (googleKey) {
    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${googleKey}`;
      const resp = await fetch(url);
      const data = await resp.json();
      if (data.results) {
        return data.results.map((r: any) => parseGoogleResult(r, r.geometry.location.lat, r.geometry.location.lng));
      }
    } catch (e) {
      console.error("Google forward geocode failed:", e);
    }
  }

  // Fallback: Nominatim
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=8`;
    const resp = await fetch(url, {
      headers: { "User-Agent": "YatraAI/1.0" },
    });
    const data = await resp.json();
    if (Array.isArray(data)) {
      return data.map((item: any) => parseNominatimResult(item, parseFloat(item.lat), parseFloat(item.lon)));
    }
  } catch (e) {
    console.error("Nominatim forward geocode failed:", e);
  }

  return [];
}

function parseGoogleResult(result: any, lat: number, lng: number): GeocodeResult {
  const components = result.address_components || [];
  let city = "", state = "", country = "", countryCode = "";
  for (const c of components) {
    const types = c.types || [];
    if (types.includes("locality") || types.includes("administrative_area_level_2")) city = city || c.long_name;
    if (types.includes("administrative_area_level_1")) state = c.long_name;
    if (types.includes("country")) {
      country = c.long_name;
      countryCode = c.short_name;
    }
  }
  return {
    name: result.formatted_address?.split(",")[0] || city || "Unknown",
    city: city || "Unknown",
    state: state || "",
    country: country || "Unknown",
    country_code: countryCode || "",
    latitude: lat,
    longitude: lng,
    place_id: result.place_id || "",
  };
}

function parseNominatimResult(data: any, lat: number, lng: number): GeocodeResult {
  const addr = data.address || {};
  const city = addr.city || addr.town || addr.village || addr.county || addr.state_district || "Unknown";
  const state = addr.state || "";
  const country = addr.country || "Unknown";
  const countryCode = (addr.country_code || "").toUpperCase();
  const name = data.name || data.display_name?.split(",")[0] || city;
  return {
    name,
    city,
    state,
    country,
    country_code: countryCode,
    latitude: lat,
    longitude: lng,
    place_id: data.place_id?.toString() || data.osm_id?.toString() || "",
  };
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.pathname.split("/").pop() || "";

    let results: GeocodeResult[] = [];
    let result: GeocodeResult | null = null;

    if (action === "reverse") {
      const { lat, lng } = await req.json();
      result = await reverseGeocode(lat, lng);
      if (!result) {
        return new Response(JSON.stringify({ error: "Could not determine location" }), {
          status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ location: result }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } else if (action === "search") {
      const { query } = await req.json();
      results = await forwardGeocode(query);
      return new Response(JSON.stringify({ results }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } else {
      return new Response(JSON.stringify({ error: "Unknown action" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
