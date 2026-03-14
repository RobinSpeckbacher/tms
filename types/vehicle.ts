export type VehicleStatus =
  | 'verfügbar'
  | 'im_einsatz'
  | 'in_wartung'
  | 'außer_betrieb';

export type VehicleType = 'sprinter' | 'lkw_7_5t' | 'lkw_18t' | 'sattelzug';

export interface VehicleCapacity {
  weight: number; // max payload in kg
  volume: number; // cargo volume in m³
}

export interface Vehicle {
  id: string;
  licensePlate: string;
  type: VehicleType;
  brand: string;
  model: string;
  year: number;
  status: VehicleStatus;
  capacity: VehicleCapacity;
  currentDriverId?: string;
  mileage?: number; // in km
  lastInspection?: string; // ISO date
  nextInspection?: string; // ISO date
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
