import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import { calculateExpectedDates, type RecurrenceType } from "../recurrence";

dayjs.extend(isoWeek);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a minimal recurrence config for test convenience. */
function cfg(
  overrides: Partial<{
    recurrence_type: RecurrenceType;
    recurrence_days: number[] | null;
    active: boolean;
    skipped_dates: string[];
  }>,
) {
  return {
    recurrence_type: "weekly" as RecurrenceType,
    recurrence_days: [1] as number[] | null,
    active: true,
    skipped_dates: [] as string[],
    ...overrides,
  };
}

/** Mon 2026-01-05 – a well-known Monday in ISO week 2 (even week). */
const MON_EVEN_WEEK = dayjs("2026-01-05"); // ISO week 2
/** Mon 2026-01-12 – ISO week 3 (odd week). */
const MON_ODD_WEEK = dayjs("2026-01-12"); // ISO week 3

// ---------------------------------------------------------------------------
// recurrence_type: "none" and inactive
// ---------------------------------------------------------------------------

describe('recurrence_type "none"', () => {
  it("returns [] for type none even when active", () => {
    const result = calculateExpectedDates(
      cfg({ recurrence_type: "none" }),
      dayjs("2026-01-05"),
      dayjs("2026-01-11"),
    );
    expect(result).toEqual([]);
  });
});

describe("inactive vorlage", () => {
  it("returns [] when active is false", () => {
    const result = calculateExpectedDates(
      cfg({ active: false, recurrence_type: "daily" }),
      dayjs("2026-01-05"),
      dayjs("2026-01-11"),
    );
    expect(result).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// recurrence_type: "daily"
// ---------------------------------------------------------------------------

describe('recurrence_type "daily"', () => {
  it("returns every day in the range (inclusive)", () => {
    const result = calculateExpectedDates(
      cfg({ recurrence_type: "daily", recurrence_days: null }),
      dayjs("2026-01-05"),
      dayjs("2026-01-07"),
    );
    expect(result).toEqual(["2026-01-05", "2026-01-06", "2026-01-07"]);
  });

  it("returns a single day when start equals end", () => {
    const result = calculateExpectedDates(
      cfg({ recurrence_type: "daily", recurrence_days: null }),
      dayjs("2026-01-05"),
      dayjs("2026-01-05"),
    );
    expect(result).toEqual(["2026-01-05"]);
  });

  it("returns [] when end is before start", () => {
    const result = calculateExpectedDates(
      cfg({ recurrence_type: "daily", recurrence_days: null }),
      dayjs("2026-01-10"),
      dayjs("2026-01-05"),
    );
    expect(result).toEqual([]);
  });

  it("excludes skipped dates", () => {
    const result = calculateExpectedDates(
      cfg({
        recurrence_type: "daily",
        recurrence_days: null,
        skipped_dates: ["2026-01-06"],
      }),
      dayjs("2026-01-05"),
      dayjs("2026-01-07"),
    );
    expect(result).toEqual(["2026-01-05", "2026-01-07"]);
  });
});

// ---------------------------------------------------------------------------
// recurrence_type: "weekly"
// ---------------------------------------------------------------------------

describe('recurrence_type "weekly"', () => {
  it("returns only the specified weekday (Monday=1) across a week", () => {
    // 2026-01-05 Mon → 2026-01-11 Sun
    const result = calculateExpectedDates(
      cfg({ recurrence_type: "weekly", recurrence_days: [1] }),
      dayjs("2026-01-05"),
      dayjs("2026-01-11"),
    );
    expect(result).toEqual(["2026-01-05"]);
  });

  it("returns multiple weekdays when configured", () => {
    // Mon + Wed in the same week
    const result = calculateExpectedDates(
      cfg({ recurrence_type: "weekly", recurrence_days: [1, 3] }),
      dayjs("2026-01-05"),
      dayjs("2026-01-11"),
    );
    expect(result).toEqual(["2026-01-05", "2026-01-07"]);
  });

  it("returns dates across multiple weeks", () => {
    // Two Mondays: 2026-01-05, 2026-01-12
    const result = calculateExpectedDates(
      cfg({ recurrence_type: "weekly", recurrence_days: [1] }),
      dayjs("2026-01-05"),
      dayjs("2026-01-14"),
    );
    expect(result).toEqual(["2026-01-05", "2026-01-12"]);
  });

  it("returns [] when recurrence_days is empty", () => {
    const result = calculateExpectedDates(
      cfg({ recurrence_type: "weekly", recurrence_days: [] }),
      dayjs("2026-01-05"),
      dayjs("2026-01-11"),
    );
    expect(result).toEqual([]);
  });

  it("returns [] when recurrence_days is null", () => {
    const result = calculateExpectedDates(
      cfg({ recurrence_type: "weekly", recurrence_days: null }),
      dayjs("2026-01-05"),
      dayjs("2026-01-11"),
    );
    expect(result).toEqual([]);
  });

  it("does not include non-configured weekdays", () => {
    // Only Wednesday configured; range covers the full week
    const result = calculateExpectedDates(
      cfg({ recurrence_type: "weekly", recurrence_days: [3] }),
      dayjs("2026-01-05"),
      dayjs("2026-01-11"),
    );
    expect(result).not.toContain("2026-01-05"); // Monday
    expect(result).not.toContain("2026-01-06"); // Tuesday
    expect(result).toContain("2026-01-07"); // Wednesday
  });

  it("excludes skipped dates even when they fall on a configured weekday", () => {
    const result = calculateExpectedDates(
      cfg({
        recurrence_type: "weekly",
        recurrence_days: [1],
        skipped_dates: ["2026-01-05", "2026-01-12"],
      }),
      dayjs("2026-01-05"),
      dayjs("2026-01-14"),
    );
    expect(result).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// recurrence_type: "biweekly"
// ---------------------------------------------------------------------------

describe('recurrence_type "biweekly"', () => {
  /**
   * The implementation uses `isoWeek() % 2 === 1` (odd ISO weeks = active).
   * ISO week numbers are fixed to the calendar year, not relative to a start date.
   */

  it("generates on the configured weekday in odd ISO weeks only", () => {
    // MON_ODD_WEEK = 2026-01-12, ISO week 3 (odd) → should appear
    const result = calculateExpectedDates(
      cfg({ recurrence_type: "biweekly", recurrence_days: [1] }),
      MON_ODD_WEEK,
      MON_ODD_WEEK.add(6, "day"),
    );
    expect(result).toContain("2026-01-12");
  });

  it("does NOT generate in even ISO weeks", () => {
    // MON_EVEN_WEEK = 2026-01-05, ISO week 2 (even) → should NOT appear
    const result = calculateExpectedDates(
      cfg({ recurrence_type: "biweekly", recurrence_days: [1] }),
      MON_EVEN_WEEK,
      MON_EVEN_WEEK.add(6, "day"),
    );
    expect(result).not.toContain("2026-01-05");
    expect(result).toEqual([]);
  });

  it("generates every other week over a 4-week span", () => {
    // 2026-01-05 (week 2, even) → 2026-02-01 (week 5, odd)
    // Expected Mondays in odd weeks: 2026-01-12 (w3), 2026-01-26 (w5)
    const result = calculateExpectedDates(
      cfg({ recurrence_type: "biweekly", recurrence_days: [1] }),
      dayjs("2026-01-05"),
      dayjs("2026-02-01"),
    );
    expect(result).toEqual(["2026-01-12", "2026-01-26"]);
  });

  it("returns [] when recurrence_days is empty", () => {
    const result = calculateExpectedDates(
      cfg({ recurrence_type: "biweekly", recurrence_days: [] }),
      MON_ODD_WEEK,
      MON_ODD_WEEK.add(13, "day"),
    );
    expect(result).toEqual([]);
  });

  it("excludes skipped dates", () => {
    const result = calculateExpectedDates(
      cfg({
        recurrence_type: "biweekly",
        recurrence_days: [1],
        skipped_dates: ["2026-01-12"],
      }),
      dayjs("2026-01-05"),
      dayjs("2026-02-01"),
    );
    expect(result).not.toContain("2026-01-12");
    expect(result).toContain("2026-01-26");
  });
});

// ---------------------------------------------------------------------------
// recurrence_type: "monthly"
// ---------------------------------------------------------------------------

describe('recurrence_type "monthly"', () => {
  it("returns only the specified day-of-month", () => {
    // Day 15 of each month; range covers Jan–Mar 2026
    const result = calculateExpectedDates(
      cfg({ recurrence_type: "monthly", recurrence_days: [15] }),
      dayjs("2026-01-01"),
      dayjs("2026-03-31"),
    );
    expect(result).toEqual(["2026-01-15", "2026-02-15", "2026-03-15"]);
  });

  it("returns [] when the day-of-month never falls in the range", () => {
    // Day 31; February 2026 has 28 days → no match
    const result = calculateExpectedDates(
      cfg({ recurrence_type: "monthly", recurrence_days: [31] }),
      dayjs("2026-02-01"),
      dayjs("2026-02-28"),
    );
    expect(result).toEqual([]);
  });

  it("returns [] when recurrence_days is empty", () => {
    const result = calculateExpectedDates(
      cfg({ recurrence_type: "monthly", recurrence_days: [] }),
      dayjs("2026-01-01"),
      dayjs("2026-03-31"),
    );
    expect(result).toEqual([]);
  });

  it("returns a single date when range starts and ends on the configured day", () => {
    const result = calculateExpectedDates(
      cfg({ recurrence_type: "monthly", recurrence_days: [15] }),
      dayjs("2026-01-15"),
      dayjs("2026-01-15"),
    );
    expect(result).toEqual(["2026-01-15"]);
  });

  it("excludes skipped dates", () => {
    const result = calculateExpectedDates(
      cfg({
        recurrence_type: "monthly",
        recurrence_days: [15],
        skipped_dates: ["2026-02-15"],
      }),
      dayjs("2026-01-01"),
      dayjs("2026-03-31"),
    );
    expect(result).toEqual(["2026-01-15", "2026-03-15"]);
  });
});

// ---------------------------------------------------------------------------
// Skipped-dates edge cases shared across types
// ---------------------------------------------------------------------------

describe("skipped_dates edge cases", () => {
  it("handles an empty skipped_dates array (no crash)", () => {
    expect(() =>
      calculateExpectedDates(
        cfg({ recurrence_type: "daily", skipped_dates: [] }),
        dayjs("2026-01-01"),
        dayjs("2026-01-03"),
      ),
    ).not.toThrow();
  });

  it("skipped date outside the range has no effect", () => {
    const result = calculateExpectedDates(
      cfg({
        recurrence_type: "daily",
        skipped_dates: ["2025-12-31"],
      }),
      dayjs("2026-01-01"),
      dayjs("2026-01-03"),
    );
    expect(result).toEqual(["2026-01-01", "2026-01-02", "2026-01-03"]);
  });
});
