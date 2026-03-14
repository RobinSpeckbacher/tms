export type DriverStatus =
  | 'verfügbar'
  | 'im_einsatz'
  | 'urlaub'
  | 'krank'
  | 'inaktiv';

export interface Driver {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  licenseNumber: string;
  licenseClass: string[];
  status: DriverStatus;
  currentVehicleId?: string;
  currentTransportId?: string;
  hiredAt?: string; // ISO date
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
