/**
 * OSRM Service — wraps the public OSRM demo API.
 * Docs: https://project-osrm.org/docs/v5.5.1/api/
 *
 * Uses two endpoints:
 *  - Nearest Service: snaps a coordinate to the nearest drivable road point
 *  - Route Service:   calculates the optimal driving route between two points
 */

const OSRM_BASE = 'https://router.project-osrm.org';

export interface OsrmCoord {
  /** Geographic longitude */
  lon: number;
  /** Geographic latitude */
  lat: number;
}

export interface OsrmRouteResult {
  /** Route polyline as [lat, lon] pairs — ready for Leaflet */
  geometry: [number, number][];
  /** Total distance in metres */
  distance: number;
  /** Total duration in seconds */
  duration: number;
}

/**
 * Nearest Service
 * Snaps an arbitrary coordinate to the nearest point on the road network.
 * Returns the snapped coordinate, or null on failure.
 */
export async function nearestRoadPoint(
  coord: OsrmCoord,
): Promise<OsrmCoord | null> {
  try {
    const res = await fetch(
      `${OSRM_BASE}/nearest/v1/driving/${coord.lon},${coord.lat}?number=1`,
    );
    if (!res.ok) return null;
    const data: {
      code: string;
      waypoints?: { location: [number, number] }[];
    } = await res.json();
    if (data.code !== 'Ok' || !data.waypoints?.length) return null;
    const [lon, lat] = data.waypoints[0].location;
    return { lon, lat };
  } catch {
    return null;
  }
}

/**
 * Route Service
 * Calculates a driving route between two coordinates.
 * Internally snaps both points to the road network via the Nearest Service
 * before requesting the route.
 */
export async function fetchDrivingRoute(
  origin: OsrmCoord,
  destination: OsrmCoord,
): Promise<OsrmRouteResult | null> {
  // Snap both points to the nearest road first
  const [snappedOrigin, snappedDest] = await Promise.all([
    nearestRoadPoint(origin),
    nearestRoadPoint(destination),
  ]);

  const from = snappedOrigin ?? origin;
  const to = snappedDest ?? destination;

  try {
    const res = await fetch(
      `${OSRM_BASE}/route/v1/driving/${from.lon},${from.lat};${to.lon},${to.lat}?overview=full&geometries=geojson`,
    );
    if (!res.ok) return null;
    const data: {
      code: string;
      routes?: {
        distance: number;
        duration: number;
        geometry: { coordinates: [number, number][] };
      }[];
    } = await res.json();
    if (data.code !== 'Ok' || !data.routes?.length) return null;

    const route = data.routes[0];
    // OSRM returns [lon, lat]; Leaflet expects [lat, lon] — flip here
    const geometry: [number, number][] = route.geometry.coordinates.map(
      ([lon, lat]) => [lat, lon],
    );

    return {
      geometry,
      distance: route.distance,
      duration: route.duration,
    };
  } catch {
    return null;
  }
}

/** Formats metres → "X km" */
export function formatDistance(metres: number): string {
  return `${(metres / 1000).toFixed(0)} km`;
}

/** Formats seconds → "Xh Ym" */
export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  if (h === 0) return `${m} min`;
  return `${h}h ${m}m`;
}

/* ── Multi-waypoint route ──────────────────────────────────────────── */

export interface OsrmLeg {
  /** Distance in metres */
  distance: number;
  /** Duration in seconds */
  duration: number;
}

export interface OsrmMultiRouteResult {
  /** Per-leg distance & duration (N-1 legs for N waypoints) */
  legs: OsrmLeg[];
  /** Total distance in metres */
  distance: number;
  /** Total duration in seconds */
  duration: number;
}

/**
 * Multi-waypoint route — calculates a driving route through all waypoints
 * in a single OSRM request. Much more reliable than separate A→B calls.
 *
 * Waypoints are in [lon, lat] order (OsrmCoord).
 * Returns per-leg distances + total, or null on failure.
 */
export async function fetchMultiWaypointRoute(
  waypoints: OsrmCoord[],
): Promise<OsrmMultiRouteResult | null> {
  if (waypoints.length < 2) return null;

  const coords = waypoints.map((w) => `${w.lon},${w.lat}`).join(';');

  try {
    const res = await fetch(
      `${OSRM_BASE}/route/v1/driving/${coords}?overview=false&steps=false`,
    );
    if (!res.ok) return null;

    const data: {
      code: string;
      routes?: {
        distance: number;
        duration: number;
        legs: { distance: number; duration: number }[];
      }[];
    } = await res.json();

    if (data.code !== 'Ok' || !data.routes?.length) return null;

    const route = data.routes[0];
    return {
      legs: route.legs.map((l) => ({
        distance: l.distance,
        duration: l.duration,
      })),
      distance: route.distance,
      duration: route.duration,
    };
  } catch {
    return null;
  }
}
