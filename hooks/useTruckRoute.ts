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
  isDeadhead: boolean;
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
  /** Distance driven with no load on board (Leerfahrt) in km */
  deadheadKm: number;
  /** Deadhead share of total distance, 0–100 */
  deadheadPercent: number;
  /** True when more than 25 % of driving distance is Leerfahrt */
  hasExcessiveDeadhead: boolean;
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
  startPosition?: { lat: number; lon: number },
  startLocation?: { plz: string; ort: string; land: string } | null,
  respectOrder?: boolean,
): Promise<TruckRouteResult | null> {
  if (!sendungen.length) return null;

  // Resolve start position: prefer pre-geocoded coords; fall back to geocoding
  // the structured standort address from the truck record.
  let resolvedStart = startPosition;
  if (!resolvedStart && startLocation && startLocation.ort.trim().length > 0) {
    const geo = await geocodeLocation(startLocation.plz, startLocation.ort, startLocation.land);
    if (geo) resolvedStart = { lat: geo.lat, lon: geo.lon };
  }

  if (sendungen.length === 1) {
    const sendung = sendungen[0];
    const pickup = {
      plz: sendung.lade_plz ?? "",
      ort: sendung.lade_ort,
      land: sendung.lade_land ?? "AT",
      label: sendung.lade_ort,
    };
    const dropoff = {
      plz: sendung.entlade_plz ?? "",
      ort: sendung.entlade_ort,
      land: sendung.entlade_land ?? "AT",
      label: sendung.entlade_ort,
    };

    const pickupGeo = await geocodeLocation(
      pickup.plz,
      pickup.ort,
      pickup.land,
    );
    const dropoffGeo = await geocodeLocation(
      dropoff.plz,
      dropoff.ort,
      dropoff.land,
    );

    if (!pickupGeo || !dropoffGeo) return null;

    const route = await fetchMultiWaypointRoute([
      { lon: pickupGeo.lon, lat: pickupGeo.lat },
      { lon: dropoffGeo.lon, lat: dropoffGeo.lat },
    ]);

    if (!route) return null;

    return {
      totalKm: Math.round(route.distance / 1000),
      totalDurationSeconds: route.duration,
      totalDistanceFormatted: formatDistance(route.distance),
      totalDurationFormatted: formatDuration(route.duration),
      legs: [
        {
          from: pickup.label,
          to: dropoff.label,
          distanceKm: Math.round(route.distance / 1000),
          durationSeconds: route.duration,
          isDeadhead: false,
        },
      ],
      deadheadKm: 0,
      deadheadPercent: 0,
      hasExcessiveDeadhead: false,
    };
  }

  const toWaypoint = (
    plz: string | null,
    ort: string,
    land: string | null,
  ) => ({
    plz: plz ?? "",
    ort,
    land: land ?? "AT",
    label: ort,
  });

  // Great-circle distance between two coordinates (Haversine formula)
  const haversineKm = (
    a: { lat: number; lon: number },
    b: { lat: number; lon: number },
  ) => {
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const dLat = toRad(b.lat - a.lat);
    const dLon = toRad(b.lon - a.lon);
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);
    const h =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return 6371 * 2 * Math.asin(Math.sqrt(h));
  };

  const shipments = sendungen.map((s, index) => ({
    index,
    pickup: toWaypoint(s.lade_plz, s.lade_ort, s.lade_land),
    dropoff: toWaypoint(s.entlade_plz, s.entlade_ort, s.entlade_land),
  }));

  // Geocode all pickup and dropoff locations
  const geocodedPickups = [] as (Awaited<ReturnType<typeof geocodeLocation>> | null)[];
  const geocodedDropoffs = [] as (Awaited<ReturnType<typeof geocodeLocation>> | null)[];

  for (const shipment of shipments) {
    geocodedPickups.push(
      await geocodeLocation(
        shipment.pickup.plz,
        shipment.pickup.ort,
        shipment.pickup.land,
      ),
    );
    geocodedDropoffs.push(
      await geocodeLocation(
        shipment.dropoff.plz,
        shipment.dropoff.ort,
        shipment.dropoff.land,
      ),
    );
  }

  const shipmentNodes = shipments.map((shipment, idx) => ({
    index: shipment.index,
    pickup: shipment.pickup,
    dropoff: shipment.dropoff,
    pickupGeo: geocodedPickups[idx],
    dropoffGeo: geocodedDropoffs[idx],
  }));

  type RoutableNode = {
    index: number;
    pickup: ReturnType<typeof toWaypoint>;
    dropoff: ReturnType<typeof toWaypoint>;
    pickupGeo: NonNullable<(typeof geocodedPickups)[0]>;
    dropoffGeo: NonNullable<(typeof geocodedDropoffs)[0]>;
  };

  const routable = shipmentNodes.filter(
    (s): s is RoutableNode => s.pickupGeo !== null && s.dropoffGeo !== null,
  );
  const unroutable = shipmentNodes.filter(
    (s) => s.pickupGeo === null || s.dropoffGeo === null,
  );

  type Stop = {
    nodeIdx: number;
    type: 'pickup' | 'dropoff';
    geo: { lat: number; lon: number };
    label: string;
  };

  /**
   * Pickup & Delivery nearest-neighbor (PDP-NN).
   *
   * Unlike a pair-sequential approach (pickup A → dropoff A → pickup B → dropoff B),
   * this considers ALL 2n stops simultaneously and allows interleaving. At every
   * step it picks the nearest eligible stop:
   *   - Any un-collected pickup is always eligible.
   *   - A dropoff is eligible only after its pickup has been visited.
   *
   * This correctly models a truck carrying multiple shipments at once (LTL /
   * Teilladung) and avoids the unnecessary backtracking that pair-sequential
   * routing produces when shipment routes overlap geographically.
   *
   * Example where interleaving wins:
   *   Shipment A: Hamburg → Frankfurt
   *   Shipment B: Hannover → Köln
   *   Pair-sequential: Hamburg → Frankfurt → Hannover → Köln  (~1 250 km)
   *   PDP-NN:          Hamburg → Hannover → Frankfurt → Köln  (~  710 km)
   */
  const orderStopsPDP = (nodes: RoutableNode[]): Stop[] => {
    if (nodes.length === 0) return [];

    // Build flat stop list: node N → allStops[N*2] = pickup, allStops[N*2+1] = dropoff
    const allStops: Stop[] = nodes.flatMap((node, nodeIdx) => [
      { nodeIdx, type: 'pickup', geo: node.pickupGeo, label: node.pickup.label },
      { nodeIdx, type: 'dropoff', geo: node.dropoffGeo, label: node.dropoff.label },
    ]);

    const pickedUp = new Set<number>();  // nodeIdx values that have been picked up
    const visitedIdx = new Set<number>(); // indices into allStops
    const ordered: Stop[] = [];

    // Seed selection:
    // • If the truck's current position is known, start with the pickup nearest
    //   to it — the driver heads straight to the closest job first.
    // • Otherwise fall back to the northernmost pickup as a deterministic default.
    let seedNode = 0;
    if (resolvedStart) {
      let bestDist = Number.POSITIVE_INFINITY;
      for (let i = 0; i < nodes.length; i++) {
        const d = haversineKm(resolvedStart, nodes[i].pickupGeo);
        if (d < bestDist) { bestDist = d; seedNode = i; }
      }
    } else {
      for (let i = 1; i < nodes.length; i++) {
        if (nodes[i].pickupGeo.lat > nodes[seedNode].pickupGeo.lat) seedNode = i;
      }
    }
    const seedStopIdx = seedNode * 2;
    ordered.push(allStops[seedStopIdx]);
    pickedUp.add(seedNode);
    visitedIdx.add(seedStopIdx);
    let currentPos = allStops[seedStopIdx].geo;

    while (ordered.length < allStops.length) {
      let bestIdx = -1;
      let bestDist = Number.POSITIVE_INFINITY;

      for (let i = 0; i < allStops.length; i++) {
        if (visitedIdx.has(i)) continue;
        const stop = allStops[i];
        // Enforce pickup-before-delivery precedence constraint
        if (stop.type === 'dropoff' && !pickedUp.has(stop.nodeIdx)) continue;

        const dist = haversineKm(currentPos, stop.geo);
        if (dist < bestDist) {
          bestDist = dist;
          bestIdx = i;
        }
      }

      if (bestIdx === -1) break;

      const chosen = allStops[bestIdx];
      ordered.push(chosen);
      visitedIdx.add(bestIdx);
      if (chosen.type === 'pickup') pickedUp.add(chosen.nodeIdx);
      currentPos = chosen.geo;
    }

    return ordered;
  };

  /**
   * Pair-sequential ordering: each shipment is routed as pickup → dropoff in
   * the exact order the sendungen array provides. Used when the dispatcher has
   * manually set the sequence and PDP-NN reordering should be skipped.
   */
  const buildPairSequential = (nodes: RoutableNode[]): Stop[] =>
    nodes.flatMap((node, nodeIdx) => [
      { nodeIdx, type: 'pickup' as const, geo: node.pickupGeo, label: node.pickup.label },
      { nodeIdx, type: 'dropoff' as const, geo: node.dropoffGeo, label: node.dropoff.label },
    ]);

  const orderedStops = respectOrder === true
    ? buildPairSequential(routable)
    : orderStopsPDP(routable);

  // Append unroutable shipments as placeholder stops (no real geo) so they
  // remain visible in the legs list even without a calculated distance.
  const unroutableStops: Stop[] = unroutable.flatMap((s, i) => [
    { nodeIdx: routable.length + i, type: 'pickup', geo: { lat: 0, lon: 0 }, label: s.pickup.label },
    { nodeIdx: routable.length + i, type: 'dropoff', geo: { lat: 0, lon: 0 }, label: s.dropoff.label },
  ]);
  const allOrderedStops: Stop[] = [...orderedStops, ...unroutableStops];

  // Build OSRM coord list, deduplicating consecutive identical coordinates.
  const osrmCoords: { lon: number; lat: number }[] = [];
  const stopToOsrm: number[] = [];

  for (const stop of allOrderedStops) {
    if (stop.geo.lat === 0 && stop.geo.lon === 0) {
      stopToOsrm.push(-1);
      continue;
    }
    const prev = osrmCoords.length > 0 ? osrmCoords[osrmCoords.length - 1] : null;
    if (
      prev &&
      Math.abs(prev.lat - stop.geo.lat) < 0.001 &&
      Math.abs(prev.lon - stop.geo.lon) < 0.001
    ) {
      stopToOsrm.push(osrmCoords.length - 1);
    } else {
      stopToOsrm.push(osrmCoords.length);
      osrmCoords.push({ lon: stop.geo.lon, lat: stop.geo.lat });
    }
  }

  let multiRoute: Awaited<ReturnType<typeof fetchMultiWaypointRoute>> | null = null;
  if (osrmCoords.length >= 2) {
    multiRoute = await fetchMultiWaypointRoute(osrmCoords);
  }

  // Build legs with load tracking.
  // currentLoad = number of shipments currently on the truck.
  // After visiting a pickup  → load increases by 1.
  // After visiting a dropoff → load decreases by 1.
  // A leg is Leerfahrt (deadhead) when the truck departs with load = 0.
  const fullLegs: RouteLeg[] = [];
  let currentLoad = 0;

  for (let i = 0; i < allOrderedStops.length - 1; i++) {
    const from = allOrderedStops[i];
    const to = allOrderedStops[i + 1];
    const fromOsrm = stopToOsrm[i];
    const toOsrm = stopToOsrm[i + 1];

    // Update load for the stop we are departing from
    if (from.type === 'pickup') currentLoad++;
    else currentLoad--;

    const isDeadhead = currentLoad === 0;

    let distanceKm = 0;
    let durationSeconds = 0;

    if (multiRoute && fromOsrm >= 0 && toOsrm >= 0 && toOsrm === fromOsrm + 1) {
      const osrmLeg = multiRoute.legs[fromOsrm];
      distanceKm = Math.round(osrmLeg.distance / 1000);
      durationSeconds = osrmLeg.duration;
    }
    // fromOsrm === toOsrm → same coord, 0 km / 0 s (already initialised above)

    fullLegs.push({ from: from.label, to: to.label, distanceKm, durationSeconds, isDeadhead });
  }

  const totalKm = multiRoute ? Math.round(multiRoute.distance / 1000) : 0;
  const deadheadKm = fullLegs
    .filter((l) => l.isDeadhead)
    .reduce((sum, l) => sum + l.distanceKm, 0);
  const deadheadPercent = totalKm > 0 ? Math.round((deadheadKm / totalKm) * 100) : 0;

  if (!multiRoute) {
    return {
      totalKm: 0,
      totalDurationSeconds: 0,
      totalDistanceFormatted: formatDistance(0),
      totalDurationFormatted: formatDuration(0),
      legs: fullLegs,
      deadheadKm,
      deadheadPercent,
      hasExcessiveDeadhead: false,
    };
  }

  return {
    totalKm,
    totalDurationSeconds: multiRoute.duration,
    totalDistanceFormatted: formatDistance(multiRoute.distance),
    totalDurationFormatted: formatDuration(multiRoute.duration),
    legs: fullLegs,
    deadheadKm,
    deadheadPercent,
    hasExcessiveDeadhead: deadheadPercent > 25,
  };
}

/* ── React hook ─────────────────────────────────────────────────────── */

export interface UseTruckRouteOptions {
  /**
   * The truck's current/home position before loading the first shipment.
   * When provided, the PDP-NN algorithm seeds from the pickup nearest to this
   * location instead of the default northernmost-pickup heuristic.
   *
   * Obtain from a geocoded home-base address or a live GPS coordinate.
   */
  startPosition?: { lat: number; lon: number };
  /**
   * The truck's home base as a structured address (plz + ort + land).
   * Geocoded automatically inside the hook using the same geocoding service
   * as shipment locations. Use this when you have the standort from the truck
   * record. startPosition takes precedence if both are provided.
   */
  startLocation?: { plz: string; ort: string; land: string } | null;
  /**
   * When true, shipments are routed in the exact order they appear in the
   * sendungen array (pair-sequential, no PDP interleaving). Use this when the
   * dispatcher has manually arranged the sequence and the algorithm should not
   * reorder it.
   */
  respectOrder?: boolean;
}

/**
 * Calculate the full driving route for a truck based on its assigned sendungen.
 *
 * Usage:
 *   const { route, isLoading } = useTruckRoute(sendungen, { startPosition: { lat: 48.2, lon: 16.4 } });
 *   // route?.totalKm → 680
 *   // route?.totalDistanceFormatted → "680 km"
 *   // route?.legs → [{ from: "Wien", to: "München", distanceKm: 435 }, ...]
 *   // route?.hasExcessiveDeadhead → true/false
 */
export function useTruckRoute(
  sendungen: SendungLocation[],
  options: UseTruckRouteOptions = {},
) {
  const { startPosition, startLocation, respectOrder } = options;
  const routingVersion = "pdp-nn-v1";

  const locationKey = sendungen
    .map((s) => `${s.lade_plz}|${s.lade_ort}|${s.entlade_plz}|${s.entlade_ort}`)
    .join(";");
  const startKey = startPosition
    ? `${startPosition.lat},${startPosition.lon}`
    : (startLocation ? `${startLocation.plz}|${startLocation.ort}|${startLocation.land}` : "auto");
  const orderKey = respectOrder === true ? "manual" : "pdp";

  const enabled = sendungen.length > 0;

  const { data, isLoading, error } = useQuery<TruckRouteResult | null>({
    queryKey: ["truck-route", routingVersion, locationKey, startKey, orderKey],
    queryFn: () => calculateTruckRoute(sendungen, startPosition, startLocation, respectOrder),
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
