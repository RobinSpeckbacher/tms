/**
 * Unit tests for utils/formatters.ts
 *
 * All functions are pure (no I/O), so no mocks are required.
 * Locale-sensitive functions (formatDate, formatDateTime) use de-DE formatting.
 */

import {
  formatDate,
  formatDateTime,
  formatTransportStatus,
  formatTransportPriority,
  formatVehicleType,
  formatVehicleStatus,
  formatDriverStatus,
  formatWeight,
  formatVolume,
  formatDriverName,
} from "@/utils/formatters";

// ── formatDate ────────────────────────────────────────────────────────────────

describe("formatDate", () => {
  it("formats a ISO date string to DD.MM.YYYY", () => {
    expect(formatDate("2024-03-15")).toBe("15.03.2024");
  });

  it("handles the first day of the year", () => {
    expect(formatDate("2024-01-01")).toBe("01.01.2024");
  });

  it("handles the last day of the year", () => {
    expect(formatDate("2024-12-31")).toBe("31.12.2024");
  });
});

// ── formatDateTime ────────────────────────────────────────────────────────────

describe("formatDateTime", () => {
  it("includes date and time parts", () => {
    const result = formatDateTime("2024-03-15T14:30:00");
    // Should contain the date portion
    expect(result).toContain("15.03.2024");
    // Should contain the time portion (14:30)
    expect(result).toMatch(/14[:\.]30/);
  });
});

// ── formatTransportStatus ─────────────────────────────────────────────────────

describe("formatTransportStatus", () => {
  it.each([
    ["geplant", "Geplant"],
    ["zugewiesen", "Zugewiesen"],
    ["unterwegs", "Unterwegs"],
    ["zugestellt", "Zugestellt"],
    ["storniert", "Storniert"],
  ] as const)("maps '%s' → '%s'", (status, expected) => {
    expect(formatTransportStatus(status)).toBe(expected);
  });
});

// ── formatTransportPriority ───────────────────────────────────────────────────

describe("formatTransportPriority", () => {
  it.each([
    ["normal", "Normal"],
    ["express", "Express"],
    ["urgent", "Dringend"],
  ] as const)("maps '%s' → '%s'", (priority, expected) => {
    expect(formatTransportPriority(priority)).toBe(expected);
  });
});

// ── formatVehicleType ─────────────────────────────────────────────────────────

describe("formatVehicleType", () => {
  it.each([
    ["sprinter", "Sprinter"],
    ["lkw_7_5t", "LKW 7,5t"],
    ["lkw_18t", "LKW 18t"],
    ["sattelzug", "Sattelzug"],
  ] as const)("maps '%s' → '%s'", (type, expected) => {
    expect(formatVehicleType(type)).toBe(expected);
  });
});

// ── formatVehicleStatus ───────────────────────────────────────────────────────

describe("formatVehicleStatus", () => {
  it.each([
    ["verfügbar", "Verfügbar"],
    ["im_einsatz", "Im Einsatz"],
    ["in_wartung", "In Wartung"],
    ["außer_betrieb", "Außer Betrieb"],
  ] as const)("maps '%s' → '%s'", (status, expected) => {
    expect(formatVehicleStatus(status)).toBe(expected);
  });
});

// ── formatDriverStatus ────────────────────────────────────────────────────────

describe("formatDriverStatus", () => {
  it.each([
    ["verfügbar", "Verfügbar"],
    ["im_einsatz", "Im Einsatz"],
    ["urlaub", "Urlaub"],
    ["krank", "Krank"],
    ["inaktiv", "Inaktiv"],
  ] as const)("maps '%s' → '%s'", (status, expected) => {
    expect(formatDriverStatus(status)).toBe(expected);
  });
});

// ── formatWeight ──────────────────────────────────────────────────────────────

describe("formatWeight", () => {
  it("shows kg for values under 1000", () => {
    expect(formatWeight(500)).toBe("500 kg");
    expect(formatWeight(999)).toBe("999 kg");
  });

  it("converts to tonnes for values >= 1000", () => {
    expect(formatWeight(1000)).toBe("1.0 t");
    expect(formatWeight(2500)).toBe("2.5 t");
    expect(formatWeight(10000)).toBe("10.0 t");
  });

  it("rounds tonnes to one decimal place", () => {
    expect(formatWeight(1234)).toBe("1.2 t");
    expect(formatWeight(9876)).toBe("9.9 t");
  });

  it("handles 0 kg", () => {
    expect(formatWeight(0)).toBe("0 kg");
  });
});

// ── formatVolume ──────────────────────────────────────────────────────────────

describe("formatVolume", () => {
  it("appends the m³ unit", () => {
    expect(formatVolume(10)).toBe("10 m³");
    expect(formatVolume(0.5)).toBe("0.5 m³");
    expect(formatVolume(100)).toBe("100 m³");
  });
});

// ── formatDriverName ──────────────────────────────────────────────────────────

describe("formatDriverName", () => {
  it("concatenates first and last name with a space", () => {
    expect(formatDriverName("Max", "Mustermann")).toBe("Max Mustermann");
  });

  it("handles single-word names", () => {
    expect(formatDriverName("Max", "")).toBe("Max ");
  });
});
