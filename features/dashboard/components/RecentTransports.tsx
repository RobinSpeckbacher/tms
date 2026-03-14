import type { Transport } from "@/types";
import { StatusBadge } from "@/components/common/StatusBadge";
import { formatDate } from "@/utils/formatters";

interface RecentTransportsProps {
  transports: Transport[];
}

export function RecentTransports({ transports }: RecentTransportsProps) {
  if (transports.length === 0) {
    return (
      <div className="px-6 py-10 text-center text-sm text-slate-400">
        Keine Transporte vorhanden.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/50">
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Referenz
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Von
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Nach
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Abholung
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Lieferung
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {transports.map((transport) => (
            <tr
              key={transport.id}
              className="hover:bg-slate-50/70 transition-colors"
            >
              <td className="px-6 py-4 font-mono text-xs text-slate-600 font-medium">
                {transport.referenceNumber}
              </td>
              <td className="px-6 py-4 text-slate-700">
                <span className="font-medium">{transport.origin.city}</span>
                <span className="block text-xs text-slate-400 truncate max-w-32">
                  {transport.origin.name}
                </span>
              </td>
              <td className="px-6 py-4 text-slate-700">
                <span className="font-medium">
                  {transport.destination.city}
                </span>
                <span className="block text-xs text-slate-400 truncate max-w-32">
                  {transport.destination.name}
                </span>
              </td>
              <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                {formatDate(transport.scheduledPickup)}
              </td>
              <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                {formatDate(transport.scheduledDelivery)}
              </td>
              <td className="px-6 py-4">
                <StatusBadge status={transport.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
