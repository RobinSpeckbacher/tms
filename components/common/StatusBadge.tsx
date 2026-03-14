import { cn } from "@/utils/cn";
import type { TransportStatus } from "@/types";

const transportStatusConfig: Record<
  TransportStatus,
  { label: string; className: string }
> = {
  geplant: {
    label: "Geplant",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  zugewiesen: {
    label: "Zugewiesen",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  unterwegs: {
    label: "Unterwegs",
    className: "bg-purple-50 text-purple-700 border-purple-200",
  },
  zugestellt: {
    label: "Zugestellt",
    className: "bg-green-50 text-green-700 border-green-200",
  },
  storniert: {
    label: "Storniert",
    className: "bg-red-50 text-red-700 border-red-200",
  },
};

interface TransportStatusBadgeProps {
  status: TransportStatus;
  className?: string;
}

export function StatusBadge({ status, className }: TransportStatusBadgeProps) {
  const config = transportStatusConfig[status];
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        config.className,
        className,
      )}
    >
      {config.label}
    </span>
  );
}
