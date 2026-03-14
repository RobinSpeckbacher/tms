export type TransportStatus =
  | 'geplant'
  | 'zugewiesen'
  | 'unterwegs'
  | 'zugestellt'
  | 'storniert';

export type TransportPriority = 'normal' | 'express' | 'urgent';

export interface TransportAddress {
  name: string;
  address: string;
  city: string;
  postalCode?: string;
  country?: string;
}

export interface TransportCargo {
  description: string;
  weight?: number; // in kg
  volume?: number; // in m³
  quantity?: number;
  hazardous?: boolean;
}

export interface Transport {
  id: string;
  referenceNumber: string;
  status: TransportStatus;
  priority: TransportPriority;
  origin: TransportAddress;
  destination: TransportAddress;
  scheduledPickup: string; // ISO date string
  scheduledDelivery: string; // ISO date string
  actualDelivery?: string;
  vehicleId?: string;
  driverId?: string;
  cargo: TransportCargo;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type CreateTransportDto = Omit<
  Transport,
  'id' | 'createdAt' | 'updatedAt' | 'actualDelivery'
> & {
  status?: TransportStatus;
};

export type UpdateTransportDto = Partial<Omit<Transport, 'id' | 'createdAt'>>;
