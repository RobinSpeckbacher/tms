/**
 * Distance Service — calculates driving distance & duration
 * between two locations (PLZ + Ort + Land).
 *
 * Pipeline: Geocode both locations → OSRM driving route → distance + duration
 */

import { geocodeLocation } from "./geocodingService";
import {
  fetchMultiWaypointRoute,
  formatDistance,
  formatDuration,
} from "./osrmService";

export interface LocationInput {
  plz: string;
  ort: string;
  land?: string;
}

export interface DistanceResult {
  /** Distance in metres */
  distanceMeters: number;
  /** Distance in km (rounded) */
  distanceKm: number;
  /** Duration in seconds */
  durationSeconds: number;
  /** Formatted distance string, e.g. "450 km" */
  distanceFormatted: string;
  /** Formatted duration string, e.g. "4h 30m" */
  durationFormatted: string;
}

/**
 * Calculate driving distance between two locations.
 * Geocodes both locations, then uses OSRM for the driving route.
 */
export async function calculateDistance(
  from: LocationInput,
  to: LocationInput,
): Promise<DistanceResult | null> {
  // Geocode sequentially (Nominatim rate limit)
  const fromGeo = await geocodeLocation(from.plz, from.ort, from.land ?? "AT");
  const toGeo = await geocodeLocation(to.plz, to.ort, to.land ?? "AT");

  if (!fromGeo || !toGeo) return null;

  // Single OSRM request for the 2-point route
  const route = await fetchMultiWaypointRoute([
    { lon: fromGeo.lon, lat: fromGeo.lat },
    { lon: toGeo.lon, lat: toGeo.lat },
  ]);

  if (!route) return null;

  return {
    distanceMeters: route.distance,
    distanceKm: Math.round(route.distance / 1000),
    durationSeconds: route.duration,
    distanceFormatted: formatDistance(route.distance),
    durationFormatted: formatDuration(route.duration),
  };
}
