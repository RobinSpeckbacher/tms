import type { Truck, Shipment } from '@/types/planning';

/**
 * Helper: get the Monday of the current week as YYYY-MM-DD.
 * All mock dates are relative to this so we always see data in the week view.
 */
function getMonday(): Date {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const m = new Date(d);
  m.setDate(diff);
  m.setHours(0, 0, 0, 0);
  return m;
}

const monday = getMonday();

/** Builds an ISO date string for a given weekday offset (0 = Mo, 4 = Fr) and hour. */
function weekDt(dayOffset: number, hour: number, minute = 0): string {
  const d = new Date(monday);
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

function weekDate(dayOffset: number): string {
  const d = new Date(monday);
  d.setDate(d.getDate() + dayOffset);
  return d.toISOString().split('T')[0];
}

// ── LKW (resources for the calendar) ────────────────────────────────────
export const mockPlanningTrucks: Truck[] = [
  {
    id: 'truck-1',
    licensePlate: 'HH-TM 100',
    driverName: 'Thomas Berger',
    status: 'im_einsatz',
    date: weekDate(0),
    position: [53.55, 9.99], // Hamburg
  },
  {
    id: 'truck-2',
    licensePlate: 'S-TM 202',
    driverName: 'Anna Hofmann',
    status: 'im_einsatz',
    date: weekDate(0),
    position: [48.78, 9.18], // Stuttgart
  },
  {
    id: 'truck-3',
    licensePlate: 'B-TM 305',
    driverName: 'Klaus Meier',
    status: 'verfügbar',
    date: weekDate(0),
    position: [52.52, 13.41], // Berlin
  },
  {
    id: 'truck-4',
    licensePlate: 'K-TM 410',
    driverName: 'Sandra Koch',
    status: 'verfügbar',
    date: weekDate(0),
    position: [50.94, 6.96], // Köln
  },
];

// ── Offene Ladungen ─────────────────────────────────────────────────────
export const mockPlanningShipments: Shipment[] = [
  {
    id: 'ship-1',
    referenz: 'SHP-2026-001',
    ladeort: 'Hamburg',
    entladeort: 'München',
    start: weekDt(0, 6),
    end: weekDt(0, 18),
    status: 'offen',
    gewicht: 12000,
    ladeortCoords: [53.55, 9.99],
    entladeortCoords: [48.14, 11.58],
  },
  {
    id: 'ship-2',
    referenz: 'SHP-2026-002',
    ladeort: 'Berlin',
    entladeort: 'Frankfurt',
    start: weekDt(1, 7),
    end: weekDt(1, 16),
    status: 'offen',
    gewicht: 8500,
    ladeortCoords: [52.52, 13.41],
    entladeortCoords: [50.11, 8.68],
  },
  {
    id: 'ship-3',
    referenz: 'SHP-2026-003',
    ladeort: 'Stuttgart',
    entladeort: 'Bremen',
    start: weekDt(2, 8),
    end: weekDt(2, 20),
    status: 'offen',
    gewicht: 14000,
    ladeortCoords: [48.78, 9.18],
    entladeortCoords: [53.08, 8.80],
  },
  {
    id: 'ship-4',
    referenz: 'SHP-2026-004',
    ladeort: 'Köln',
    entladeort: 'Leipzig',
    start: weekDt(2, 9),
    end: weekDt(2, 17),
    status: 'offen',
    gewicht: 6200,
    ladeortCoords: [50.94, 6.96],
    entladeortCoords: [51.34, 12.37],
  },
  {
    id: 'ship-5',
    referenz: 'SHP-2026-005',
    ladeort: 'Dortmund',
    entladeort: 'Nürnberg',
    start: weekDt(3, 7, 30),
    end: weekDt(3, 15, 30),
    status: 'offen',
    gewicht: 9800,
    ladeortCoords: [51.51, 7.47],
    entladeortCoords: [49.45, 11.08],
  },
  {
    id: 'ship-6',
    referenz: 'SHP-2026-006',
    ladeort: 'Düsseldorf',
    entladeort: 'Dresden',
    start: weekDt(3, 6),
    end: weekDt(3, 19),
    status: 'offen',
    gewicht: 11000,
    ladeortCoords: [51.22, 6.77],
    entladeortCoords: [51.05, 13.74],
  },
  {
    id: 'ship-7',
    referenz: 'SHP-2026-007',
    ladeort: 'Mannheim',
    entladeort: 'Hannover',
    start: weekDt(4, 8),
    end: weekDt(4, 18),
    status: 'offen',
    gewicht: 7400,
    ladeortCoords: [49.49, 8.47],
    entladeortCoords: [52.38, 9.73],
  },
  {
    id: 'ship-8',
    referenz: 'SHP-2026-008',
    ladeort: 'Kiel',
    entladeort: 'Heidelberg',
    start: weekDt(4, 5),
    end: weekDt(4, 20),
    status: 'offen',
    gewicht: 4800,
    ladeortCoords: [54.32, 10.12],
    entladeortCoords: [49.40, 8.67],
  },
];
