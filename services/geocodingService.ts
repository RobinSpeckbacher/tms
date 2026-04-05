/**
 * Geocoding Service — uses Nominatim (OpenStreetMap) to convert
 * PLZ + Ort + Land into geographic coordinates.
 *
 * Rate-limited to 1 req/s by Nominatim policy.
 * Results are cached in-memory to avoid repeated requests.
 */

const NOMINATIM_BASE = "https://nominatim.openstreetmap.org";

export interface GeocodingResult {
  lat: number;
  lon: number;
  displayName: string;
}

// Simple in-memory cache: "plz|ort|land" → result
const cache = new Map<string, GeocodingResult | null>();

function cacheKey(plz: string, ort: string, land: string): string {
  return `${plz}|${ort}|${land}`.toLowerCase();
}

// Rate limiter: Nominatim allows max 1 req/s.
// We queue requests and process them sequentially with a delay.
let lastRequestTime = 0;
const NOMINATIM_MIN_INTERVAL = 1100; // ms between requests

async function rateLimitedFetch(url: string, init?: RequestInit): Promise<Response> {
  const now = Date.now();
  const elapsed = now - lastRequestTime;
  if (elapsed < NOMINATIM_MIN_INTERVAL) {
    await new Promise((r) => setTimeout(r, NOMINATIM_MIN_INTERVAL - elapsed));
  }
  lastRequestTime = Date.now();
  return fetch(url, init);
}

// In-flight dedup: avoid parallel requests for the same location
const inFlight = new Map<string, Promise<GeocodingResult | null>>();

type NominatimItem = { lat: string; lon: string; display_name: string };

/**
 * Geocode a location by postal code, city name, and country code.
 * Returns coordinates or null if not found.
 */
export async function geocodeLocation(
  plz: string,
  ort: string,
  land: string = "AT",
): Promise<GeocodingResult | null> {
  const key = cacheKey(plz, ort, land);
  if (cache.has(key)) return cache.get(key)!;

  // Dedup: if the same location is already being fetched, wait for it
  if (inFlight.has(key)) return inFlight.get(key)!;

  const promise = geocodeLocationInner(plz, ort, land, key);
  inFlight.set(key, promise);
  try {
    return await promise;
  } finally {
    inFlight.delete(key);
  }
}

async function geocodeLocationInner(
  plz: string,
  ort: string,
  land: string,
  key: string,
): Promise<GeocodingResult | null> {

  const countryCode = land.length === 2 ? land.toLowerCase() : "";
  const params = new URLSearchParams({
    postalcode: plz,
    city: ort,
    format: "json",
    limit: "1",
  });
  if (countryCode) params.set("countrycodes", countryCode);

  try {
    const res = await rateLimitedFetch(
      `${NOMINATIM_BASE}/search?${params.toString()}`,
      {
        headers: {
          "User-Agent": "TMS-Projekt/1.0",
          "Accept-Language": "de",
        },
      },
    );
    if (!res.ok) {
      cache.set(key, null);
      return null;
    }

    const data = (await res.json()) as NominatimItem[];
    if (!Array.isArray(data) || data.length === 0) {
      cache.set(key, null);
      return null;
    }

    const first = data[0];
    if (first.lat.trim() === "" || first.lon.trim() === "" || first.display_name.trim() === "") {
      cache.set(key, null);
      return null;
    }

    const result: GeocodingResult = {
      lat: parseFloat(first.lat),
      lon: parseFloat(first.lon),
      displayName: first.display_name,
    };
    cache.set(key, result);
    return result;
  } catch {
    cache.set(key, null);
    return null;
  }
}
