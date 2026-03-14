export type TruckStatus = 'verfügbar' | 'geplant' | 'im_einsatz';
export type ShipmentStatus = 'offen' | 'zugewiesen';

/** [latitude, longitude] */
export type LatLng = [number, number];

export interface Truck {
  id: string;
  licensePlate: string;
  driverName: string;
  status: TruckStatus;
  /** ISO date string: YYYY-MM-DD */
  date: string;
  /** Current/home position */
  position?: LatLng;
}

export interface Shipment {
  id: string;
  referenz: string;
  ladeort: string;
  entladeort: string;
  /** ISO datetime */
  start: string;
  /** ISO datetime */
  end: string;
  status: ShipmentStatus;
  /** Payload weight in kg */
  gewicht?: number;
  /** Coordinates for the loading point */
  ladeortCoords?: LatLng;
  /** Coordinates for the unloading point */
  entladeortCoords?: LatLng;
}

export interface Assignment {
  id: string;
  /** References Truck.id */
  resourceId: string;
  title: string;
  start: string;
  end: string;
  shipmentId: string;
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
}
