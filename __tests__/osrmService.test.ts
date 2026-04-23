/**
 * Unit tests for services/osrmService.ts
 *
 * Pure functions (formatDistance, formatDuration) are tested directly.
 * Functions that call fetch (nearestRoadPoint, fetchDrivingRoute,
 * fetchMultiWaypointRoute) are tested with a global fetch mock.
 */

import {
  formatDistance,
  formatDuration,
  nearestRoadPoint,
  fetchDrivingRoute,
  fetchMultiWaypointRoute,
} from "@/services/osrmService";

// ── formatDistance ────────────────────────────────────────────────────────────

describe("formatDistance", () => {
  it("converts metres to km and rounds to 0 decimal places", () => {
    expect(formatDistance(450_000)).toBe("450 km");
    expect(formatDistance(1_500)).toBe("2 km");
    expect(formatDistance(0)).toBe("0 km");
  });

  it("handles values that produce a fractional km", () => {
    expect(formatDistance(1_499)).toBe("1 km");
    expect(formatDistance(1_500)).toBe("2 km"); // 1.5 rounds to 2
  });
});

// ── formatDuration ────────────────────────────────────────────────────────────

describe("formatDuration", () => {
  it("shows minutes only when less than 1 hour", () => {
    expect(formatDuration(0)).toBe("0 min");
    expect(formatDuration(30 * 60)).toBe("30 min");
    expect(formatDuration(3599)).toBe("60 min");
  });

  it("shows hours and minutes when 1 hour or more", () => {
    expect(formatDuration(3600)).toBe("1h 0m");
    expect(formatDuration(5400)).toBe("1h 30m");
    expect(formatDuration(9000)).toBe("2h 30m");
  });

  it("rounds the minutes component", () => {
    // 3660 s = 1h 1m (exact), 3690 s = 1h 1.5m → rounds to 2m
    expect(formatDuration(3660)).toBe("1h 1m");
    expect(formatDuration(3690)).toBe("1h 2m");
  });
});

// ── Fetch-dependent functions ─────────────────────────────────────────────────

/**
 * Helper to build a minimal mock Response.
 */
function mockResponse(body: unknown, ok = true): Response {
  return {
    ok,
    json: async () => body,
  } as unknown as Response;
}

beforeEach(() => {
  // Reset the fetch mock before every test
  global.fetch = jest.fn();
});

afterEach(() => {
  jest.resetAllMocks();
});

// ── nearestRoadPoint ──────────────────────────────────────────────────────────

describe("nearestRoadPoint", () => {
  it("returns the snapped coordinate on success", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(
      mockResponse({
        code: "Ok",
        waypoints: [{ location: [16.37, 48.21] }],
      }),
    );

    const result = await nearestRoadPoint({ lon: 16.37, lat: 48.21 });
    expect(result).toEqual({ lon: 16.37, lat: 48.21 });
  });

  it("returns null when the API response code is not Ok", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(
      mockResponse({ code: "NoRoute", waypoints: [] }),
    );

    const result = await nearestRoadPoint({ lon: 0, lat: 0 });
    expect(result).toBeNull();
  });

  it("returns null when fetch throws", async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("network error"));

    const result = await nearestRoadPoint({ lon: 0, lat: 0 });
    expect(result).toBeNull();
  });

  it("returns null when the HTTP status is not ok", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse({}, false));

    const result = await nearestRoadPoint({ lon: 0, lat: 0 });
    expect(result).toBeNull();
  });
});

// ── fetchMultiWaypointRoute ───────────────────────────────────────────────────

describe("fetchMultiWaypointRoute", () => {
  const viennaToLinz = [
    { lon: 16.37, lat: 48.21 },
    { lon: 14.29, lat: 48.31 },
  ];

  it("returns route data on success", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(
      mockResponse({
        code: "Ok",
        routes: [
          {
            distance: 185_000,
            duration: 6300,
            legs: [{ distance: 185_000, duration: 6300 }],
          },
        ],
      }),
    );

    const result = await fetchMultiWaypointRoute(viennaToLinz);
    expect(result).not.toBeNull();
    expect(result!.distance).toBe(185_000);
    expect(result!.duration).toBe(6300);
    expect(result!.legs).toHaveLength(1);
    expect(result!.legs[0]).toEqual({ distance: 185_000, duration: 6300 });
  });

  it("returns null when fewer than 2 waypoints are given", async () => {
    const result = await fetchMultiWaypointRoute([{ lon: 0, lat: 0 }]);
    expect(result).toBeNull();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("returns null when the API code is not Ok", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(
      mockResponse({ code: "NoRoute", routes: [] }),
    );

    const result = await fetchMultiWaypointRoute(viennaToLinz);
    expect(result).toBeNull();
  });

  it("returns null when routes array is empty", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(
      mockResponse({ code: "Ok", routes: [] }),
    );

    const result = await fetchMultiWaypointRoute(viennaToLinz);
    expect(result).toBeNull();
  });

  it("returns null when fetch throws", async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("timeout"));

    const result = await fetchMultiWaypointRoute(viennaToLinz);
    expect(result).toBeNull();
  });

  it("handles three waypoints and returns two legs", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(
      mockResponse({
        code: "Ok",
        routes: [
          {
            distance: 300_000,
            duration: 10_800,
            legs: [
              { distance: 185_000, duration: 6300 },
              { distance: 115_000, duration: 4500 },
            ],
          },
        ],
      }),
    );

    const result = await fetchMultiWaypointRoute([
      { lon: 16.37, lat: 48.21 },
      { lon: 14.29, lat: 48.31 },
      { lon: 13.04, lat: 47.81 },
    ]);

    expect(result).not.toBeNull();
    expect(result!.legs).toHaveLength(2);
    expect(result!.distance).toBe(300_000);
  });
});

// ── fetchDrivingRoute ─────────────────────────────────────────────────────────

describe("fetchDrivingRoute", () => {
  it("returns geometry, distance, and duration on success", async () => {
    // First two calls: nearestRoadPoint for origin + destination
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce(
        mockResponse({ code: "Ok", waypoints: [{ location: [16.37, 48.21] }] }),
      )
      .mockResolvedValueOnce(
        mockResponse({ code: "Ok", waypoints: [{ location: [14.29, 48.31] }] }),
      )
      // Third call: the actual route request
      .mockResolvedValueOnce(
        mockResponse({
          code: "Ok",
          routes: [
            {
              distance: 185_000,
              duration: 6300,
              geometry: {
                coordinates: [
                  [16.37, 48.21],
                  [15.0, 48.25],
                  [14.29, 48.31],
                ],
              },
            },
          ],
        }),
      );

    const result = await fetchDrivingRoute(
      { lon: 16.37, lat: 48.21 },
      { lon: 14.29, lat: 48.31 },
    );

    expect(result).not.toBeNull();
    expect(result!.distance).toBe(185_000);
    expect(result!.duration).toBe(6300);
    // Geometry coordinates should be flipped to [lat, lon] for Leaflet
    expect(result!.geometry[0]).toEqual([48.21, 16.37]);
  });

  it("falls back to original coords when nearestRoadPoint returns null", async () => {
    // Both nearest calls fail
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce(mockResponse({ code: "Error" }, false))
      .mockResolvedValueOnce(mockResponse({ code: "Error" }, false))
      // Route call succeeds using original coords
      .mockResolvedValueOnce(
        mockResponse({
          code: "Ok",
          routes: [
            {
              distance: 50_000,
              duration: 1800,
              geometry: { coordinates: [[16.37, 48.21], [14.29, 48.31]] },
            },
          ],
        }),
      );

    const result = await fetchDrivingRoute(
      { lon: 16.37, lat: 48.21 },
      { lon: 14.29, lat: 48.31 },
    );

    expect(result).not.toBeNull();
    expect(result!.distance).toBe(50_000);
  });

  it("returns null when the route request fails", async () => {
    // Both nearest calls succeed but route call fails
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce(
        mockResponse({ code: "Ok", waypoints: [{ location: [16.37, 48.21] }] }),
      )
      .mockResolvedValueOnce(
        mockResponse({ code: "Ok", waypoints: [{ location: [14.29, 48.31] }] }),
      )
      .mockResolvedValueOnce(mockResponse({ code: "NoRoute", routes: [] }));

    const result = await fetchDrivingRoute(
      { lon: 16.37, lat: 48.21 },
      { lon: 14.29, lat: 48.31 },
    );

    expect(result).toBeNull();
  });
});
