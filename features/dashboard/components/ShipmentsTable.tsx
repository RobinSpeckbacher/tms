"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import type { Transport } from "@/types/transport";
import Typography from "@mui/joy/Typography";
import { DataTable } from "@/components/common/DataTable";

function formatDate(iso: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

interface ShipmentsTableProps {
  transports: Transport[];
  onRowClick?: (transport: Transport) => void;
}

export default function ShipmentsTable({
  transports,
  onRowClick,
}: ShipmentsTableProps) {
  const columns = useMemo<ColumnDef<Transport, unknown>[]>(
    () => [
      {
        accessorKey: "referenceNumber",
        header: "Sendungsnr.",
        cell: ({ getValue }) => (
          <span className="font-medium">{getValue<string>()}</span>
        ),
      },
      {
        accessorKey: "scheduledPickup",
        header: "Beladung",
        cell: ({ getValue }) => (
          <span className="text-[#57688e]">
            {formatDate(getValue<string>())}
          </span>
        ),
      },
      {
        accessorKey: "scheduledDelivery",
        header: "Entladung",
        cell: ({ getValue }) => (
          <span className="text-[#57688e]">
            {formatDate(getValue<string>())}
          </span>
        ),
      },
      {
        id: "client",
        accessorFn: (row) => row.origin.name,
        header: "Auftraggeber",
      },
      {
        id: "originCity",
        accessorFn: (row) => row.origin.city,
        header: "Ladeort",
      },
      {
        id: "originPlz",
        accessorFn: (row) => row.origin.postalCode ?? "—",
        header: "PLZ Laden",
        cell: ({ getValue }) => (
          <span className="text-[#57688e]">{getValue<string>()}</span>
        ),
      },
      {
        id: "destCity",
        accessorFn: (row) => row.destination.city,
        header: "Entladeort",
      },
      {
        id: "destPlz",
        accessorFn: (row) => row.destination.postalCode ?? "—",
        header: "PLZ Entladen",
        cell: ({ getValue }) => (
          <span className="text-[#57688e]">{getValue<string>()}</span>
        ),
      },
    ],
    [],
  );

  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex items-center border-b border-[#0f172b]/10 px-4 py-2.5">
        <Typography level="title-sm" sx={{ color: "#0f172b", fontWeight: 600 }}>
          Sendungen
        </Typography>
      </div>
      <DataTable
        columns={columns}
        data={transports}
        onRowClick={onRowClick}
        searchPlaceholder="Sendung suchen…"
        emptyMessage="Keine Sendungen vorhanden"
        noResultsMessage="Keine Treffer für diese Suche"
      />
    </div>
  );
}
