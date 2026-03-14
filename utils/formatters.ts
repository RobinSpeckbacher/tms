import type {
  TransportStatus,
  TransportPriority,
  VehicleStatus,
  VehicleType,
  DriverStatus,
} from '@/types';

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatTransportStatus(status: TransportStatus): string {
  const labels: Record<TransportStatus, string> = {
    geplant: 'Geplant',
    zugewiesen: 'Zugewiesen',
    unterwegs: 'Unterwegs',
    zugestellt: 'Zugestellt',
    storniert: 'Storniert',
  };
  return labels[status];
}

export function formatTransportPriority(priority: TransportPriority): string {
  const labels: Record<TransportPriority, string> = {
    normal: 'Normal',
    express: 'Express',
    urgent: 'Dringend',
  };
  return labels[priority];
}

export function formatVehicleType(type: VehicleType): string {
  const labels: Record<VehicleType, string> = {
    sprinter: 'Sprinter',
    lkw_7_5t: 'LKW 7,5t',
    lkw_18t: 'LKW 18t',
    sattelzug: 'Sattelzug',
  };
  return labels[type];
}

export function formatVehicleStatus(status: VehicleStatus): string {
  const labels: Record<VehicleStatus, string> = {
    verfügbar: 'Verfügbar',
    im_einsatz: 'Im Einsatz',
    in_wartung: 'In Wartung',
    außer_betrieb: 'Außer Betrieb',
  };
  return labels[status];
}

export function formatDriverStatus(status: DriverStatus): string {
  const labels: Record<DriverStatus, string> = {
    verfügbar: 'Verfügbar',
    im_einsatz: 'Im Einsatz',
    urlaub: 'Urlaub',
    krank: 'Krank',
    inaktiv: 'Inaktiv',
  };
  return labels[status];
}

export function formatWeight(kg: number): string {
  if (kg >= 1000) return `${(kg / 1000).toFixed(1)} t`;
  return `${kg} kg`;
}

export function formatVolume(m3: number): string {
  return `${m3} m³`;
}

export function formatDriverName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`;
}
