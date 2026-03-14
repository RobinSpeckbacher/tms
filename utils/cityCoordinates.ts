/**
 * Approximate city center coordinates for German cities.
 * Format: [lat, lon] — used by Leaflet for rendering.
 * OSRM expects [lon, lat] — convert when calling the API.
 */
export const CITY_COORDINATES: Record<string, [number, number]> = {
  Hamburg: [53.5511, 9.9937],
  München: [48.1351, 11.582],
  Berlin: [52.52, 13.405],
  Frankfurt: [50.1109, 8.6821],
  Stuttgart: [48.7758, 9.1829],
  Bremen: [53.0793, 8.8017],
  Düsseldorf: [51.2217, 6.7735],
  Leipzig: [51.3397, 12.3731],
  Köln: [50.9333, 6.9603],
  Hannover: [52.3759, 9.732],
  Dortmund: [51.5136, 7.4653],
  Nürnberg: [49.4521, 11.0767],
  Mannheim: [49.4875, 8.466],
  Dresden: [51.0504, 13.7373],
  Heidelberg: [49.3988, 8.6724],
  Kiel: [54.3233, 10.1228],
};

/** Returns [lat, lon] for a city, or null if unknown. */
export function getCityCoordinates(city: string): [number, number] | null {
  return CITY_COORDINATES[city] ?? null;
}
