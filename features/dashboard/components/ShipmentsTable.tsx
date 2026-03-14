"use client";

import { useState, useMemo } from "react";
import type { Transport } from "@/types/transport";
import Input from "@mui/joy/Input";
import Typography from "@mui/joy/Typography";
import { Search } from "lucide-react";

const columns = [
  { key: "referenceNumber", header: "Sendungsnr." },
  { key: "scheduledPickup", header: "Beladung" },
  { key: "scheduledDelivery", header: "Entladung" },
  { key: "client", header: "Auftraggeber" },
  { key: "originCity", header: "Ladeort" },
  { key: "originPlz", header: "PLZ Laden" },
  { key: "destCity", header: "Entladeort" },
  { key: "destPlz", header: "PLZ Entladen" },
] as const;

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
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return transports;
    const q = search.toLowerCase();
    return transports.filter(
      (t) =>
        t.referenceNumber.toLowerCase().includes(q) ||
        t.origin.city.toLowerCase().includes(q) ||
        t.destination.city.toLowerCase().includes(q) ||
        (t.origin.postalCode ?? "").includes(q) ||
        (t.destination.postalCode ?? "").includes(q) ||
        t.origin.name.toLowerCase().includes(q) ||
        t.destination.name.toLowerCase().includes(q),
    );
  }, [transports, search]);

  return (
    <div className="flex h-full w-full flex-col">
      {/* Header + Search */}
      <div className="flex items-center justify-between gap-3 border-b border-[#0f172b]/10 px-4 py-2.5">
        <Typography level="title-sm" sx={{ color: "#0f172b", fontWeight: 600 }}>
          Sendungen
        </Typography>
        <Input
          size="sm"
          placeholder="Suchen…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          startDecorator={<Search className="h-3.5 w-3.5 text-[#57688e]" />}
          sx={{
            width: 240,
            "--Input-focusedHighlight": "#155dfc",
            fontSize: "0.75rem",
          }}
        />
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10">
            <tr className="border-b border-[#0f172b]/10 bg-[#f8f9fb]">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-2.5 text-left text-[0.7rem] font-semibold text-[#57688e] uppercase tracking-wide whitespace-nowrap"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#0f172b]/5">
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-12 text-center text-xs text-[#57688e]"
                >
                  {transports.length === 0
                    ? "Keine Sendungen vorhanden"
                    : "Keine Treffer für diese Suche"}
                </td>
              </tr>
            ) : (
              filtered.map((t) => (
                <tr
                  key={t.id}
                  onClick={() => onRowClick?.(t)}
                  className="hover:bg-[#155dfc]/3 transition-colors cursor-pointer"
                >
                  <td className="px-4 py-2.5 font-medium text-[#0f172b] whitespace-nowrap">
                    {t.referenceNumber}
                  </td>
                  <td className="px-4 py-2.5 text-[#57688e] whitespace-nowrap">
                    {formatDate(t.scheduledPickup)}
                  </td>
                  <td className="px-4 py-2.5 text-[#57688e] whitespace-nowrap">
                    {formatDate(t.scheduledDelivery)}
                  </td>
                  <td className="px-4 py-2.5 text-[#0f172b] whitespace-nowrap">
                    {t.origin.name}
                  </td>
                  <td className="px-4 py-2.5 text-[#0f172b] whitespace-nowrap">
                    {t.origin.city}
                  </td>
                  <td className="px-4 py-2.5 text-[#57688e] whitespace-nowrap">
                    {t.origin.postalCode ?? "—"}
                  </td>
                  <td className="px-4 py-2.5 text-[#0f172b] whitespace-nowrap">
                    {t.destination.city}
                  </td>
                  <td className="px-4 py-2.5 text-[#57688e] whitespace-nowrap">
                    {t.destination.postalCode ?? "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
