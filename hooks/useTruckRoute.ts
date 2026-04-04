import { useQuery } from "@tanstack/react-query";
import { geocodeLocation } from "@/services/geocodingService";
import {
  fetchMultiWaypointRoute,
  formatDistance,
  formatDuration,
} from "@/services/osrmService";

/* ── Types ──────────────────────────────────────────────────────────── */
interface SendungLocation {
  lade_plz: string | null;
  lade_ort: string;
  lade_land: string | null;
  entlade_plz: string | null;
  entlade_ort: string;
  entlade_land: string | null;
}

export interface RouteLeg {
  from: string;
  to: string;
  distanceKm: number;
  durationSeconds: number;
}

export interface TruckRouteResult {
  /** Total driving distance in km */
  totalKm: number;
  /** Total driving duration in seconds */
  totalDurationSeconds: number;
  /** Formatted total distance, e.g. "450 km" */
  totalDistanceFormatted: string;
  /** Formatted total driving time, e.g. "4h 30m" */
  totalDurationFormatted: string;
  /** Individual legs of the route */
  legs: RouteLeg[];
}

/* ── Core calculation ───────────────────────────────────────────────── */

/**
 * Build the full route for a truck given its assigned sendungen.
 *
 * Single sendung:  Ladeort → Entladeort (simple A → B)
 * Multiple sendungen (ordered by position):
 *   Leg 1: S1 Ladeort → S1 Entladeort
 *   Leg 2: S1 Entladeort → S2 Ladeort  (deadhead / Leerfahrt)
 *   Leg 3: S2 Ladeort → S2 Entladeort
 *   ... etc.
 *
 * This gives the real total driving distance including repositioning.
 */
async function calculateTruckRoute(
  sendungen: SendungLocation[],
): Promise<TruckRouteResult | null> {
  if (!sendungen.length) return null;

  // Build waypoints: [S1.lade, S1.entlade, S2.lade, S2.entlade, ...]
  const waypoints: { plz: string; ort: string; land: string; label: string }[] = [];
  for (const s of sendungen) {
    waypoints.push({
      plz: s.lade_plz || "",
      ort: s.lade_ort,
      land: s.lade_land || "AT",
      label: s.lade_ort,
    });
    waypoints.push({
      plz: s.entlade_plz || "",
      ort: s.entlade_ort,
      land: s.entlade_land || "AT",
      label: s.entlade_ort,
    });
  }

  // Geocode waypoints sequentially (Nominatim rate limit: 1 req/s)
  // Cache hits return instantly, only uncached locations cause a delay
  const geocoded: (Awaited<ReturnType<typeof geocodeLocation>>)[] = [];
  for (const wp of waypoints) {
    geocoded.push(await geocodeLocation(wp.plz, wp.ort, wp.land));
  }

  // Filter out failed geocodes and build OSRM coords + label mapping
  // We need to track which original indices mapped to which OSRM waypoints
  const osrmCoords: { lon: number; lat: number }[] = [];
  const coordLabels: string[] = [];
  // Track which original waypoint index maps to which OSRM coord index
  const originalToOsrm = new Array<number>(waypoints.length).fill(-1);

  for (let i = 0; i < geocoded.length; i++) {
    const geo = geocoded[i];
    if (geo) {
      // Deduplicate consecutive identical coords (same city)
      const prev = osrmCoords.length > 0 ? osrmCoords[osrmCoords.length - 1] : null;
      if (
        prev &&
        Math.abs(prev.lat - geo.lat) < 0.001 &&
        Math.abs(prev.lon - geo.lon) < 0.001
      ) {
        // Same location as previous → map to same OSRM coord (current length - 1)
        originalToOsrm[i] = osrmCoords.length - 1;
        continue;
      }
      originalToOsrm[i] = osrmCoords.length;
      osrmCoords.push({ lon: geo.lon, lat: geo.lat });
      coordLabels.push(waypoints[i].label);
    }
  }

  if (osrmCoords.length < 2) return null;

  // Single OSRM request for the full multi-waypoint route
  const multiRoute = await fetchMultiWaypointRoute(osrmCoords);
  if (!multiRoute) return null;

  // Build full legs array matching original waypoint pairs
  const fullLegs: RouteLeg[] = [];

  for (let i = 0; i < waypoints.length - 1; i++) {
    const fromOsrm = originalToOsrm[i];
    const toOsrm = originalToOsrm[i + 1];

    // Both waypoints mapped to consecutive OSRM coords → use the OSRM leg
    if (fromOsrm >= 0 && toOsrm >= 0 && toOsrm === fromOsrm + 1) {
      const osrmLeg = multiRoute.legs[fromOsrm];
      fullLegs.push({
        from: waypoints[i].label,
        to: waypoints[i + 1].label,
        distanceKm: Math.round(osrmLeg.distance / 1000),
        durationSeconds: osrmLeg.duration,
      });
    } else if (fromOsrm >= 0 && toOsrm >= 0 && toOsrm === fromOsrm) {
      // Same OSRM coord (deduped consecutive identical location) → 0 km
      fullLegs.push({
        from: waypoints[i].label,
        to: waypoints[i + 1].label,
        distanceKm: 0,
        durationSeconds: 0,
      });
    } else {
      // Geocoding failed for one or both → 0 km
      fullLegs.push({
        from: waypoints[i].label,
        to: waypoints[i + 1].label,
        distanceKm: 0,
        durationSeconds: 0,
      });
    }
  }

  return {
    totalKm: Math.round(multiRoute.distance / 1000),
    totalDurationSeconds: multiRoute.duration,
    totalDistanceFormatted: formatDistance(multiRoute.distance),
    totalDurationFormatted: formatDuration(multiRoute.duration),
    legs: fullLegs,
  };
}

/* ── React hook ─────────────────────────────────────────────────────── */

/**
 * Calculate the full driving route for a truck based on its assigned sendungen.
 *
 * Usage:
 *   const { route, isLoading } = useTruckRoute(assignedSendungen);
 *   // route?.totalKm → 680
 *   // route?.totalDistanceFormatted → "680 km"
 *   // route?.legs → [{ from: "Wien", to: "München", distanceKm: 435 }, ...]
 */
export function useTruckRoute(sendungen: SendungLocation[]) {
  // Build a stable query key from sendung locations
  const locationKey = sendungen
    .map((s) => `${s.lade_plz}|${s.lade_ort}|${s.entlade_plz}|${s.entlade_ort}`)
    .join(";");

  const enabled = sendungen.length > 0;

  const { data, isLoading, error } = useQuery<TruckRouteResult | null>({
    queryKey: ["truck-route", locationKey],
    queryFn: () => calculateTruckRoute(sendungen),
    enabled,
    staleTime: 1000 * 60 * 30,
    retry: 1,
  });

  return {
    route: data ?? null,
    isLoading: enabled && isLoading,
    error,
  };
}
