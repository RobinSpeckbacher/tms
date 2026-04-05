import { useQuery } from "@tanstack/react-query";
import {
  calculateDistance,
  type LocationInput,
  type DistanceResult,
} from "@/services/distanceService";

/**
 * React hook to calculate driving distance between Ladeort and Entladeort.
 *
 * Usage:
 *   const { distance, isLoading } = useDistance(
 *     { plz: "1010", ort: "Wien", land: "AT" },
 *     { plz: "80331", ort: "München", land: "DE" },
 *   );
 *   // distance?.distanceKm → 435
 *   // distance?.distanceFormatted → "435 km"
 *   // distance?.durationFormatted → "4h 12m"
 */
export function useDistance(
  from: LocationInput | null,
  to: LocationInput | null,
) {
  const hasText = (value: string | null | undefined) =>
    typeof value === "string" && value.trim().length > 0;

  const enabled =
    from !== null &&
    to !== null &&
    hasText(from.plz) &&
    hasText(from.ort) &&
    hasText(to.plz) &&
    hasText(to.ort);

  const { data, isLoading, error } = useQuery<DistanceResult | null>({
    queryKey: [
      "distance",
      from?.plz ?? "",
      from?.ort ?? "",
      from?.land ?? "",
      to?.plz ?? "",
      to?.ort ?? "",
      to?.land ?? "",
    ],
    queryFn: () => calculateDistance(from!, to!),
    enabled,
    staleTime: 1000 * 60 * 30, // cache 30 min
    retry: 1,
  });

  return {
    distance: data ?? null,
    isLoading: enabled && isLoading,
    error,
  };
}
