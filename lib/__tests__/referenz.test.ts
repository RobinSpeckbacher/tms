/**
 * Tests for the shipment referenz generation helper used in
 * useGenerateRecurringSendungen and useGenerateRecurringTrucksWithShipments.
 *
 * The referenz format is:
 *   V-{YYYYMMDD}-{first 8 hex chars of vorlage id (dashes stripped, uppercased)}
 *
 * This file validates the format and proves that collisions no longer occur
 * when vorlagen share the same first 4 UUID chars (the original bug used
 * only 4 chars, leading to duplicate-key errors in the DB).
 */

import dayjs from "dayjs";

// ---------------------------------------------------------------------------
// The helper extracted as a pure function (mirrors what the hooks do inline).
// ---------------------------------------------------------------------------

function buildSendungReferenz(loadingDate: string, vorlageId: string): string {
  return `V-${dayjs(loadingDate).format("YYYYMMDD")}-${vorlageId.replace(/-/g, "").slice(0, 8).toUpperCase()}`;
}

// ---------------------------------------------------------------------------
// Format tests
// ---------------------------------------------------------------------------

describe("buildSendungReferenz – format", () => {
  it("produces the expected format V-YYYYMMDD-XXXXXXXX", () => {
    const ref = buildSendungReferenz(
      "2026-04-15",
      "abcd1234-ef56-7890-abcd-ef1234567890",
    );
    expect(ref).toBe("V-20260415-ABCD1234");
  });

  it("strips dashes from the vorlage ID before slicing", () => {
    // UUID whose first segment is only 4 chars before the dash:
    // Without stripping: slice(0,8) would include the dash → "ABCD-EF5"
    // With stripping: "ABCDEF56"
    const ref = buildSendungReferenz(
      "2026-01-01",
      "abcd-ef56-7890-abcd-ef1234567890",
    );
    // The trailing ID segment must contain no dashes
    const lastSegment = ref.split("-").at(-1)!;
    expect(lastSegment).not.toContain("-");
    expect(ref).toBe("V-20260101-ABCDEF56");
  });

  it("uppercases the ID fragment", () => {
    const ref = buildSendungReferenz(
      "2026-04-15",
      "aabbccdd-0000-0000-0000-000000000000",
    );
    expect(ref).toBe("V-20260415-AABBCCDD");
  });
});

// ---------------------------------------------------------------------------
// Collision tests
// ---------------------------------------------------------------------------

describe("buildSendungReferenz – no collisions", () => {
  it("two vorlagen sharing first 4 UUID chars produce DIFFERENT referenzen", () => {
    // This was the original bug: slice(0,4) → both map to "ABCD"
    const vorlageA = "abcd1111-0000-0000-0000-000000000000";
    const vorlageB = "abcd2222-0000-0000-0000-000000000000";
    const date = "2026-04-15";

    const refA = buildSendungReferenz(date, vorlageA);
    const refB = buildSendungReferenz(date, vorlageB);

    expect(refA).not.toBe(refB);
    expect(refA).toBe("V-20260415-ABCD1111");
    expect(refB).toBe("V-20260415-ABCD2222");
  });

  it("same vorlage on different dates produces different referenzen", () => {
    const vorlageId = "abcd1234-0000-0000-0000-000000000000";
    const ref1 = buildSendungReferenz("2026-04-15", vorlageId);
    const ref2 = buildSendungReferenz("2026-04-22", vorlageId);
    expect(ref1).not.toBe(ref2);
  });

  it("same vorlage on same date always produces the same referenz (idempotent)", () => {
    const vorlageId = "abcd1234-0000-0000-0000-000000000000";
    const date = "2026-04-15";
    const ref1 = buildSendungReferenz(date, vorlageId);
    const ref2 = buildSendungReferenz(date, vorlageId);
    expect(ref1).toBe(ref2);
  });

  it("produces unique referenzen for 100 distinct UUIDs on the same date", () => {
    const date = "2026-04-15";
    const refs = new Set<string>();
    for (let i = 0; i < 100; i++) {
      // Craft IDs that differ only after the 4th character (old bug scenario)
      const id = `abcd${String(i).padStart(4, "0")}-0000-0000-0000-000000000000`;
      refs.add(buildSendungReferenz(date, id));
    }
    // Every referenz must be unique
    expect(refs.size).toBe(100);
  });
});

// ---------------------------------------------------------------------------
// Regression: the OLD 4-char slice WOULD have collided
// ---------------------------------------------------------------------------

describe("regression: old 4-char slice collides (documents the original bug)", () => {
  function oldBuildSendungReferenz(
    loadingDate: string,
    vorlageId: string,
  ): string {
    // The original implementation that caused duplicate-key errors
    return `V-${dayjs(loadingDate).format("YYYYMMDD")}-${vorlageId.slice(0, 4).toUpperCase()}`;
  }

  it("old implementation produces IDENTICAL referenzen for two vorlagen sharing 4-char prefix", () => {
    const vorlageA = "abcd1111-0000-0000-0000-000000000000";
    const vorlageB = "abcd2222-0000-0000-0000-000000000000";
    const date = "2026-04-15";

    // Demonstrate the collision that caused the DB error
    expect(oldBuildSendungReferenz(date, vorlageA)).toBe(
      oldBuildSendungReferenz(date, vorlageB),
    );
  });
});
