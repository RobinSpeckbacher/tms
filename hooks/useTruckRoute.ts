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
    };
  }

  const CLUSTER_RADIUS_KM = 75;

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

  type Cluster = {
    id: number;
    lat: number;
    lon: number;
    labels: Set<string>;
  };

  const clusters: Cluster[] = [];
  const assignCluster = (geo: { lat: number; lon: number }, label: string) => {
    let bestIndex = -1;
    let bestDistance = Number.POSITIVE_INFINITY;

    clusters.forEach((cluster, index) => {
      const distance = haversineKm(geo, cluster);
      if (distance <= CLUSTER_RADIUS_KM && distance < bestDistance) {
        bestDistance = distance;
        bestIndex = index;
      }
    });

    if (bestIndex === -1) {
      const cluster: Cluster = {
        id: clusters.length,
        lat: geo.lat,
        lon: geo.lon,
        labels: new Set([label]),
      };
      clusters.push(cluster);
      return cluster.id;
    }

    const cluster = clusters[bestIndex];
    const labelCount = cluster.labels.size;
    cluster.lat = (cluster.lat * labelCount + geo.lat) / (labelCount + 1);
    cluster.lon = (cluster.lon * labelCount + geo.lon) / (labelCount + 1);
    cluster.labels.add(label);
    return cluster.id;
  };

  const formatClusterLabel = (cluster: Cluster) => {
    const labels = Array.from(cluster.labels);
    if (labels.length <= 2) return labels.join(" + ");
    return `${labels[0]} + ${labels.length - 1}`;
  };

  const shipments = sendungen.map((s, index) => ({
    index,
    pickup: toWaypoint(s.lade_plz, s.lade_ort, s.lade_land),
    dropoff: toWaypoint(s.entlade_plz, s.entlade_ort, s.entlade_land),
  }));

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

  const shipmentNodes = shipments.map((shipment, idx) => {
    const pickupGeo = geocodedPickups[idx];
    const dropoffGeo = geocodedDropoffs[idx];
    const pickupClusterId = pickupGeo
      ? assignCluster(pickupGeo, shipment.pickup.label)
      : null;
    const dropoffClusterId = dropoffGeo
      ? assignCluster(dropoffGeo, shipment.dropoff.label)
      : null;

    return {
      index: shipment.index,
      pickup: shipment.pickup,
      dropoff: shipment.dropoff,
      pickupGeo,
      dropoffGeo,
      pickupClusterId,
      dropoffClusterId,
    };
  });

  const routable = shipmentNodes.filter(
    (s) => s.pickupClusterId !== null && s.dropoffClusterId !== null,
  );
  const unroutable = shipmentNodes.filter(
    (s) => s.pickupClusterId === null || s.dropoffClusterId === null,
  );

  const pickupCounts = new Map<number, number>();
  const dropoffCounts = new Map<number, number>();
  const pickupLabels = new Map<number, string>();
  const dropoffLabels = new Map<number, string>();

  routable.forEach((shipment) => {
    const pickupId = shipment.pickupClusterId as number;
    const dropoffId = shipment.dropoffClusterId as number;
    pickupCounts.set(pickupId, (pickupCounts.get(pickupId) ?? 0) + 1);
    dropoffCounts.set(dropoffId, (dropoffCounts.get(dropoffId) ?? 0) + 1);
    if (!pickupLabels.has(pickupId)) {
      pickupLabels.set(pickupId, formatClusterLabel(clusters[pickupId]));
    }
    if (!dropoffLabels.has(dropoffId)) {
      dropoffLabels.set(dropoffId, formatClusterLabel(clusters[dropoffId]));
    }
  });

  const orderClustersNearest = (clusterIds: number[], startId: number) => {
    const remaining = new Set(clusterIds);
    const ordered: number[] = [];
    let currentId = startId;
    remaining.delete(currentId);
    ordered.push(currentId);

    while (remaining.size > 0) {
      let bestId: number | null = null;
      let bestDistance = Number.POSITIVE_INFINITY;
      remaining.forEach((candidateId) => {
        const distance = haversineKm(
          clusters[currentId],
          clusters[candidateId],
        );
        if (distance < bestDistance) {
          bestDistance = distance;
          bestId = candidateId;
        }
      });

      if (bestId === null) break;
      ordered.push(bestId);
      remaining.delete(bestId);
      currentId = bestId;
    }

    return ordered;
  };

  const pickupClusterIds = Array.from(pickupCounts.keys());
  const dropoffClusterIds = Array.from(dropoffCounts.keys());

  const stops: { clusterId: number | null; label: string; delta: number }[] = [];
  const withCountLabel = (label: string, count: number, kind: "pickup" | "dropoff") => {
    if (count <= 1) return label;
    const suffix = kind === "pickup" ? "Ladepunkte" : "Entladepunkte";
    return `${label} (x${count} ${suffix})`;
  };

  if (pickupClusterIds.length > 0) {
    const firstPickupId = pickupClusterIds[0];
    const orderedPickups = orderClustersNearest(pickupClusterIds, firstPickupId);
    orderedPickups.forEach((clusterId) => {
      const pickupCount = pickupCounts.get(clusterId) ?? 0;
      const baseLabel =
        pickupLabels.get(clusterId) ??
        clusters[clusterId].labels.values().next().value;
      stops.push({
        clusterId,
        label: withCountLabel(baseLabel, pickupCount, "pickup"),
        delta: pickupCount,
      });
    });

    if (dropoffClusterIds.length > 0) {
      const lastPickupId = orderedPickups[orderedPickups.length - 1];
      let firstDropoffId = dropoffClusterIds[0];
      if (dropoffClusterIds.includes(lastPickupId)) {
        firstDropoffId = lastPickupId;
      } else {
        let bestDistance = Number.POSITIVE_INFINITY;
        dropoffClusterIds.forEach((candidateId) => {
          const distance = haversineKm(
            clusters[lastPickupId],
            clusters[candidateId],
          );
          if (distance < bestDistance) {
            bestDistance = distance;
            firstDropoffId = candidateId;
          }
        });
      }
      const orderedDropoffs = orderClustersNearest(
        dropoffClusterIds,
        firstDropoffId,
      );
      orderedDropoffs.forEach((clusterId) => {
        const dropoffCount = dropoffCounts.get(clusterId) ?? 0;
        const baseLabel =
          dropoffLabels.get(clusterId) ??
          clusters[clusterId].labels.values().next().value;
        stops.push({
          clusterId,
          label: withCountLabel(baseLabel, dropoffCount, "dropoff"),
          delta: -dropoffCount,
        });
      });
    }
  }

  // Append unroutable shipments as placeholder stops to keep them visible.
  unroutable.forEach((shipment) => {
    stops.push({
      clusterId: null,
      label: shipment.pickup.label,
      delta: 1,
    });
    stops.push({
      clusterId: null,
      label: shipment.dropoff.label,
      delta: -1,
    });
  });

  // Build OSRM coords with dedupe for consecutive identical clusters
  const osrmCoords: { lon: number; lat: number }[] = [];
  const originalToOsrm = new Array<number>(stops.length).fill(-1);

  for (let i = 0; i < stops.length; i++) {
    const clusterId = stops[i].clusterId;
    if (clusterId === null) continue;
    const cluster = clusters[clusterId];
    const prev = osrmCoords.length > 0 ? osrmCoords[osrmCoords.length - 1] : null;
    if (
      prev &&
      Math.abs(prev.lat - cluster.lat) < 0.001 &&
      Math.abs(prev.lon - cluster.lon) < 0.001
    ) {
      originalToOsrm[i] = osrmCoords.length - 1;
      continue;
    }
    originalToOsrm[i] = osrmCoords.length;
    osrmCoords.push({ lon: cluster.lon, lat: cluster.lat });
  }

  let multiRoute: Awaited<ReturnType<typeof fetchMultiWaypointRoute>> | null = null;
  if (osrmCoords.length >= 2) {
    multiRoute = await fetchMultiWaypointRoute(osrmCoords);
  }

  const fullLegs: RouteLeg[] = [];
  if (stops.length >= 2) {
    let loadCount = 0;
    loadCount += stops[0].delta;
    for (let i = 0; i < stops.length - 1; i++) {
      const fromOsrm = originalToOsrm[i];
      const toOsrm = originalToOsrm[i + 1];
      const isDeadhead = loadCount === 0;
      const fromLabel = stops[i].label;
      const toLabel = stops[i + 1].label;

      if (multiRoute && fromOsrm >= 0 && toOsrm >= 0 && toOsrm === fromOsrm + 1) {
        const osrmLeg = multiRoute.legs[fromOsrm];
        fullLegs.push({
          from: fromLabel,
          to: toLabel,
          distanceKm: Math.round(osrmLeg.distance / 1000),
          durationSeconds: osrmLeg.duration,
          isDeadhead,
        });
      } else if (fromOsrm >= 0 && toOsrm >= 0 && toOsrm === fromOsrm) {
        fullLegs.push({
          from: fromLabel,
          to: toLabel,
          distanceKm: 0,
          durationSeconds: 0,
          isDeadhead,
        });
      } else {
        fullLegs.push({
          from: fromLabel,
          to: toLabel,
          distanceKm: 0,
          durationSeconds: 0,
          isDeadhead,
        });
      }

      loadCount += stops[i + 1].delta;
    }
  }

  if (!multiRoute) {
    return {
      totalKm: 0,
      totalDurationSeconds: 0,
      totalDistanceFormatted: formatDistance(0),
      totalDurationFormatted: formatDuration(0),
      legs: fullLegs,
    };
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
  const routingVersion = "clustered-v3";
  // Build a stable query key from sendung locations
  const locationKey = sendungen
    .map((s) => `${s.lade_plz}|${s.lade_ort}|${s.entlade_plz}|${s.entlade_ort}`)
    .join(";");

  const enabled = sendungen.length > 0;

  const { data, isLoading, error } = useQuery<TruckRouteResult | null>({
    queryKey: ["truck-route", routingVersion, locationKey],
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
