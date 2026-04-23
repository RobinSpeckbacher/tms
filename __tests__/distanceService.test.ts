/**
 * Unit / integration tests for services/distanceService.ts
 *
 * The service orchestrates geocoding + OSRM routing.  Both dependencies are
 * mocked so the tests run offline and deterministically.
 */

import { calculateDistance } from "@/services/distanceService";

// ── Module mocks ──────────────────────────────────────────────────────────────

jest.mock("@/services/geocodingService", () => ({
  geocodeLocation: jest.fn(),
}));

jest.mock("@/services/osrmService", () => ({
  fetchMultiWaypointRoute: jest.fn(),
  formatDistance: jest.requireActual("@/services/osrmService").formatDistance,
  formatDuration: jest.requireActual("@/services/osrmService").formatDuration,
}));

import { geocodeLocation } from "@/services/geocodingService";
import { fetchMultiWaypointRoute } from "@/services/osrmService";

const mockedGeocode = geocodeLocation as jest.MockedFunction<typeof geocodeLocation>;
const mockedRoute = fetchMultiWaypointRoute as jest.MockedFunction<typeof fetchMultiWaypointRoute>;

// ── Fixtures ──────────────────────────────────────────────────────────────────

const VIENNA_GEO = { lat: 48.2083, lon: 16.3731, displayName: "Wien, Austria" };
const LINZ_GEO = { lat: 48.3069, lon: 14.2858, displayName: "Linz, Austria" };

const VIENNA = { plz: "1010", ort: "Wien", land: "AT" };
const LINZ = { plz: "4020", ort: "Linz", land: "AT" };

const MOCK_ROUTE = {
  legs: [{ distance: 185_000, duration: 6300 }],
  distance: 185_000,
  duration: 6300,
};

// ── Tests ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.resetAllMocks();
});

describe("calculateDistance – success path", () => {
  beforeEach(() => {
    mockedGeocode
      .mockResolvedValueOnce(VIENNA_GEO)  // first call: from
      .mockResolvedValueOnce(LINZ_GEO);   // second call: to
    mockedRoute.mockResolvedValueOnce(MOCK_ROUTE);
  });

  it("returns a DistanceResult with correct numeric values", async () => {
    const result = await calculateDistance(VIENNA, LINZ);

    expect(result).not.toBeNull();
    expect(result!.distanceMeters).toBe(185_000);
    expect(result!.distanceKm).toBe(185);
    expect(result!.durationSeconds).toBe(6300);
  });

  it("returns correctly formatted strings", async () => {
    const result = await calculateDistance(VIENNA, LINZ);

    expect(result!.distanceFormatted).toBe("185 km");
    expect(result!.durationFormatted).toBe("1h 45m");
  });

  it("passes the geocoded coordinates to OSRM in the right order", async () => {
    await calculateDistance(VIENNA, LINZ);

    expect(mockedRoute).toHaveBeenCalledWith([
      { lon: VIENNA_GEO.lon, lat: VIENNA_GEO.lat },
      { lon: LINZ_GEO.lon, lat: LINZ_GEO.lat },
    ]);
  });

  it("geocodes 'from' before 'to'", async () => {
    await calculateDistance(VIENNA, LINZ);

    const calls = mockedGeocode.mock.calls;
    expect(calls[0]).toEqual(["1010", "Wien", "AT"]);
    expect(calls[1]).toEqual(["4020", "Linz", "AT"]);
  });
});

describe("calculateDistance – null paths", () => {
  it("returns null when 'from' geocoding fails", async () => {
    mockedGeocode
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(LINZ_GEO);

    const result = await calculateDistance(VIENNA, LINZ);
    expect(result).toBeNull();
    expect(mockedRoute).not.toHaveBeenCalled();
  });

  it("returns null when 'to' geocoding fails", async () => {
    mockedGeocode
      .mockResolvedValueOnce(VIENNA_GEO)
      .mockResolvedValueOnce(null);

    const result = await calculateDistance(VIENNA, LINZ);
    expect(result).toBeNull();
    expect(mockedRoute).not.toHaveBeenCalled();
  });

  it("returns null when both geocodings fail", async () => {
    mockedGeocode.mockResolvedValue(null);

    const result = await calculateDistance(VIENNA, LINZ);
    expect(result).toBeNull();
  });

  it("returns null when the OSRM route request fails", async () => {
    mockedGeocode
      .mockResolvedValueOnce(VIENNA_GEO)
      .mockResolvedValueOnce(LINZ_GEO);
    mockedRoute.mockResolvedValueOnce(null);

    const result = await calculateDistance(VIENNA, LINZ);
    expect(result).toBeNull();
  });
});

describe("calculateDistance – land default", () => {
  it("defaults land to 'AT' when omitted", async () => {
    mockedGeocode
      .mockResolvedValueOnce(VIENNA_GEO)
      .mockResolvedValueOnce(LINZ_GEO);
    mockedRoute.mockResolvedValueOnce(MOCK_ROUTE);

    await calculateDistance({ plz: "1010", ort: "Wien" }, { plz: "4020", ort: "Linz" });

    // Service passes land ?? "AT" to geocodeLocation
    expect(mockedGeocode).toHaveBeenNthCalledWith(1, "1010", "Wien", "AT");
    expect(mockedGeocode).toHaveBeenNthCalledWith(2, "4020", "Linz", "AT");
  });
});

describe("calculateDistance – rounding", () => {
  it("rounds distanceKm correctly", async () => {
    mockedGeocode
      .mockResolvedValueOnce(VIENNA_GEO)
      .mockResolvedValueOnce(LINZ_GEO);
    mockedRoute.mockResolvedValueOnce({
      ...MOCK_ROUTE,
      distance: 1_499,   // 1.499 km → rounds to 1
      duration: 60,
    });

    const result = await calculateDistance(VIENNA, LINZ);
    expect(result!.distanceKm).toBe(1);
  });

  it("rounds up at 0.5 km boundary", async () => {
    mockedGeocode
      .mockResolvedValueOnce(VIENNA_GEO)
      .mockResolvedValueOnce(LINZ_GEO);
    mockedRoute.mockResolvedValueOnce({
      ...MOCK_ROUTE,
      distance: 1_500,   // 1.5 km → rounds to 2
      duration: 60,
    });

    const result = await calculateDistance(VIENNA, LINZ);
    expect(result!.distanceKm).toBe(2);
  });
});
