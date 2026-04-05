import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import { calculateExpectedDates } from "../lib/recurrence";

dayjs.extend(isoWeek);

// ── Helpers ──────────────────────────────────────────────────────────────────

function config(overrides: Partial<Parameters<typeof calculateExpectedDates>[0]>) {
  return {
    recurrence_type: "weekly" as const,
    recurrence_days: [1],
    active: true,
    skipped_dates: [],
    ...overrides,
  };
}

function range(start: string, end: string) {
  return [dayjs(start), dayjs(end)] as const;
}

// ── Inactive / none ───────────────────────────────────────────────────────────

describe("inactive or recurrence_type=none", () => {
  it("returns [] when active=false", () => {
    const result = calculateExpectedDates(
      config({ active: false, recurrence_type: "daily" }),
      ...range("2024-01-01", "2024-01-07"),
    );
    expect(result).toEqual([]);
  });

  it("returns [] when recurrence_type=none", () => {
    const result = calculateExpectedDates(
      config({ recurrence_type: "none" }),
      ...range("2024-01-01", "2024-01-07"),
    );
    expect(result).toEqual([]);
  });

  it("returns [] when active=false even if recurrence_type=daily", () => {
    expect(
      calculateExpectedDates(
        config({ active: false, recurrence_type: "daily" }),
        ...range("2024-01-01", "2024-01-03"),
      ),
    ).toEqual([]);
  });
});

// ── Daily ─────────────────────────────────────────────────────────────────────

describe("daily recurrence", () => {
  it("generates every day in the range", () => {
    const result = calculateExpectedDates(
      config({ recurrence_type: "daily", recurrence_days: null }),
      ...range("2024-01-01", "2024-01-05"),
    );
    expect(result).toEqual([
      "2024-01-01",
      "2024-01-02",
      "2024-01-03",
      "2024-01-04",
      "2024-01-05",
    ]);
  });

  it("returns a single date when start=end and it matches", () => {
    const result = calculateExpectedDates(
      config({ recurrence_type: "daily", recurrence_days: null }),
      ...range("2024-06-15", "2024-06-15"),
    );
    expect(result).toEqual(["2024-06-15"]);
  });
});

// ── Weekly ────────────────────────────────────────────────────────────────────

describe("weekly recurrence", () => {
  // 2024-01-01 = Monday (ISO weekday 1)
  it("generates only on specified weekdays", () => {
    const result = calculateExpectedDates(
      config({ recurrence_type: "weekly", recurrence_days: [1, 3] }), // Mon + Wed
      ...range("2024-01-01", "2024-01-07"),
    );
    expect(result).toEqual(["2024-01-01", "2024-01-03"]);
  });

  it("returns [] when recurrence_days is empty", () => {
    const result = calculateExpectedDates(
      config({ recurrence_type: "weekly", recurrence_days: [] }),
      ...range("2024-01-01", "2024-01-07"),
    );
    expect(result).toEqual([]);
  });

  it("returns [] when recurrence_days is null", () => {
    const result = calculateExpectedDates(
      config({ recurrence_type: "weekly", recurrence_days: null }),
      ...range("2024-01-01", "2024-01-07"),
    );
    expect(result).toEqual([]);
  });

  it("generates every matching weekday across multiple weeks", () => {
    const result = calculateExpectedDates(
      config({ recurrence_type: "weekly", recurrence_days: [5] }), // Friday
      ...range("2024-01-01", "2024-01-21"),
    );
    expect(result).toEqual(["2024-01-05", "2024-01-12", "2024-01-19"]);
  });
});

// ── Biweekly ──────────────────────────────────────────────────────────────────

describe("biweekly recurrence", () => {
  // 2024-01-01 = Monday = ISO week 1 (odd → matches)
  // 2024-01-08 = Monday = ISO week 2 (even → skip)
  // 2024-01-15 = Monday = ISO week 3 (odd → matches)
  it("generates only on odd ISO weeks", () => {
    const result = calculateExpectedDates(
      config({ recurrence_type: "biweekly", recurrence_days: [1] }), // Monday
      ...range("2024-01-01", "2024-01-21"),
    );
    expect(result).toEqual(["2024-01-01", "2024-01-15"]);
  });

  it("returns [] when recurrence_days is empty", () => {
    const result = calculateExpectedDates(
      config({ recurrence_type: "biweekly", recurrence_days: [] }),
      ...range("2024-01-01", "2024-01-21"),
    );
    expect(result).toEqual([]);
  });
});

// ── Monthly ───────────────────────────────────────────────────────────────────

describe("monthly recurrence", () => {
  it("generates on the specified day of each month in range", () => {
    const result = calculateExpectedDates(
      config({ recurrence_type: "monthly", recurrence_days: [15] }),
      ...range("2024-01-01", "2024-03-31"),
    );
    expect(result).toEqual(["2024-01-15", "2024-02-15", "2024-03-15"]);
  });

  it("does not generate when day 31 does not exist in month (Feb)", () => {
    const result = calculateExpectedDates(
      config({ recurrence_type: "monthly", recurrence_days: [31] }),
      ...range("2024-02-01", "2024-02-29"),
    );
    expect(result).toEqual([]); // Feb has no day 31
  });

  it("generates on day 1 of each month", () => {
    const result = calculateExpectedDates(
      config({ recurrence_type: "monthly", recurrence_days: [1] }),
      ...range("2024-01-01", "2024-03-01"),
    );
    expect(result).toEqual(["2024-01-01", "2024-02-01", "2024-03-01"]);
  });
});

// ── Skipped dates ─────────────────────────────────────────────────────────────

describe("skipped_dates", () => {
  it("excludes a skipped date from daily generation", () => {
    const result = calculateExpectedDates(
      config({
        recurrence_type: "daily",
        recurrence_days: null,
        skipped_dates: ["2024-01-03"],
      }),
      ...range("2024-01-01", "2024-01-05"),
    );
    expect(result).toEqual(["2024-01-01", "2024-01-02", "2024-01-04", "2024-01-05"]);
  });

  it("excludes multiple skipped dates", () => {
    const result = calculateExpectedDates(
      config({
        recurrence_type: "weekly",
        recurrence_days: [1], // Monday
        skipped_dates: ["2024-01-01", "2024-01-15"],
      }),
      ...range("2024-01-01", "2024-01-21"),
    );
    // Mondays: Jan 1, 8, 15 → skip 1 and 15 → only Jan 8
    expect(result).toEqual(["2024-01-08"]);
  });

  it("ignores skipped dates outside the generation range", () => {
    const result = calculateExpectedDates(
      config({
        recurrence_type: "daily",
        recurrence_days: null,
        skipped_dates: ["2024-02-01"],
      }),
      ...range("2024-01-01", "2024-01-03"),
    );
    expect(result).toEqual(["2024-01-01", "2024-01-02", "2024-01-03"]);
  });
});

// ── Edge cases ────────────────────────────────────────────────────────────────

describe("edge cases", () => {
  it("returns [] when range is empty (start after end)", () => {
    const result = calculateExpectedDates(
      config({ recurrence_type: "daily", recurrence_days: null }),
      ...range("2024-01-05", "2024-01-01"),
    );
    expect(result).toEqual([]);
  });

  it("returns [] for weekly with no matching day in the range", () => {
    // Only Sunday (7) in the range but we want Saturday (6)
    const result = calculateExpectedDates(
      config({ recurrence_type: "weekly", recurrence_days: [6] }), // Saturday
      // 2024-01-01 is Monday, range ends on Sunday 2024-01-07
      ...range("2024-01-06", "2024-01-06"),
    );
    // 2024-01-06 = Saturday → should match
    expect(result).toEqual(["2024-01-06"]);
  });

  it("handles multiple weekdays including weekend days", () => {
    const result = calculateExpectedDates(
      config({ recurrence_type: "weekly", recurrence_days: [6, 7] }), // Sat + Sun
      ...range("2024-01-01", "2024-01-07"),
    );
    expect(result).toEqual(["2024-01-06", "2024-01-07"]);
  });
});
