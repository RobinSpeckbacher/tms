"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import type { SendungRow } from "@/hooks/useSendungen";
import Typography from "@mui/joy/Typography";
import { FileCheck, FileX } from "lucide-react";
import { DataTable } from "@/components/common/DataTable";

/* ── Enriched row with carrier/cost from truck assignment ────────── */
export interface EnrichedSendung extends SendungRow {
  fraechter_name: string | null;
  einkaufspreis: number | null;
}

/* ── Helpers ─────────────────────────────────────────────────────── */
function formatDate(iso: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function eur(value: number | null | undefined) {
  if (value == null) return "—";
  return value.toLocaleString("de-DE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  });
}

function weight(kg: number | null | undefined) {
  if (kg == null) return "—";
  return kg >= 1000
    ? `${(kg / 1000).toFixed(kg % 1000 === 0 ? 0 : 1)} t`
    : `${kg} kg`;
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  offen: { bg: "bg-amber-50", text: "text-amber-700" },
  zugewiesen: { bg: "bg-blue-50", text: "text-blue-700" },
  unterwegs: { bg: "bg-indigo-50", text: "text-indigo-700" },
  abgeschlossen: { bg: "bg-emerald-50", text: "text-emerald-700" },
  storniert: { bg: "bg-red-50", text: "text-red-700" },
};

/* ── Aggregation helpers ─────────────────────────────────────────── */
function sum(rows: EnrichedSendung[], key: keyof EnrichedSendung) {
  return rows.reduce((acc, r) => acc + (Number(r[key]) || 0), 0);
}

function avg(total: number, count: number) {
  return count > 0 ? total / count : 0;
}

/* ── Component ───────────────────────────────────────────────────── */
interface ShipmentsTableProps {
  sendungen: EnrichedSendung[];
  onRowClick?: (sendung: EnrichedSendung) => void;
}

export default function ShipmentsTable({
  sendungen,
  onRowClick,
}: ShipmentsTableProps) {
  /* Pre-compute totals for footer */
  const totals = useMemo(() => {
    const totalVk = sum(sendungen, "verkaufspreis");
    const totalEk = sum(sendungen, "einkaufspreis");
    const withVk = sendungen.filter((s) => s.verkaufspreis != null).length;
    const withEk = sendungen.filter((s) => s.einkaufspreis != null).length;
    const totalMarge = totalVk - totalEk;
    const margeCount = sendungen.filter(
      (s) => s.verkaufspreis != null && s.einkaufspreis != null,
    ).length;

    return {
      count: sendungen.length,
      totalVk,
      avgVk: avg(totalVk, withVk),
      totalEk,
      avgEk: avg(totalEk, withEk),
      totalMarge,
      avgMarge: avg(totalMarge, margeCount),
      totalGewicht: sum(sendungen, "gewicht"),
      totalLdm: sum(sendungen, "lademeter"),
    };
  }, [sendungen]);

  const columns = useMemo<ColumnDef<EnrichedSendung, unknown>[]>(
    () => [
      {
        accessorKey: "referenz",
        header: "Sendungsnr.",
        cell: ({ getValue }) => (
          <span className="font-semibold text-[#0f172b]">
            {getValue<string>()}
          </span>
        ),
        footer: () => <span>{totals.count} Sendungen</span>,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => {
          const s = getValue<string>();
          const c = STATUS_COLORS[s] ?? {
            bg: "bg-gray-50",
            text: "text-gray-700",
          };
          return (
            <span
              className={`inline-flex rounded-full px-2 py-0.5 text-[0.65rem] font-medium capitalize ${c.bg} ${c.text}`}
            >
              {s}
            </span>
          );
        },
      },
      {
        id: "cmr",
        header: "CMR",
        accessorFn: (row) => (row.cmr_path ? "ja" : "nein"),
        cell: ({ row: { original } }) =>
          original.cmr_path ? (
            <span
              className="inline-flex items-center gap-1 text-emerald-600"
              title={`CMR: ${original.cmr_file_name ?? "vorhanden"}`}
            >
              <FileCheck className="h-3.5 w-3.5" />
              <span className="text-[0.65rem] font-medium">Ja</span>
            </span>
          ) : (
            <span
              className="inline-flex items-center gap-1 text-[#57688e]/40"
              title="Keine CMR"
            >
              <FileX className="h-3.5 w-3.5" />
              <span className="text-[0.65rem]">—</span>
            </span>
          ),
      },
      {
        id: "kunde",
        accessorFn: (row) => row.kunde?.name ?? "—",
        header: "Kunde",
      },
      {
        accessorKey: "lade_ort",
        header: "Ladeort",
      },
      {
        accessorKey: "lade_plz",
        header: "PLZ",
        cell: ({ getValue }) => (
          <span className="text-[#57688e]">{getValue<string>() ?? "—"}</span>
        ),
      },
      {
        accessorKey: "lade_land",
        header: "Land",
        cell: ({ getValue }) => (
          <span className="text-[#57688e]">{getValue<string>() ?? "—"}</span>
        ),
      },
      {
        accessorKey: "entlade_ort",
        header: "Entladeort",
      },
      {
        accessorKey: "entlade_plz",
        header: "PLZ",
        cell: ({ getValue }) => (
          <span className="text-[#57688e]">{getValue<string>() ?? "—"}</span>
        ),
      },
      {
        accessorKey: "entlade_land",
        header: "Land",
        cell: ({ getValue }) => (
          <span className="text-[#57688e]">{getValue<string>() ?? "—"}</span>
        ),
      },
      {
        accessorKey: "ladedatum",
        header: "Beladung",
        cell: ({ getValue }) => (
          <span className="text-[#57688e]">
            {formatDate(getValue<string>())}
          </span>
        ),
      },
      {
        accessorKey: "entladedatum",
        header: "Entladung",
        cell: ({ getValue }) => (
          <span className="text-[#57688e]">
            {formatDate(getValue<string>())}
          </span>
        ),
      },
      {
        id: "fraechter",
        accessorFn: (row) => row.fraechter_name ?? "—",
        header: "Frächter",
        cell: ({ getValue }) => {
          const v = getValue<string>();
          return v === "—" ? (
            <span className="text-[#57688e]/50">—</span>
          ) : (
            <span>{v}</span>
          );
        },
      },
      {
        id: "ladung",
        header: "Gewicht / LDM",
        accessorFn: (row) => row.gewicht ?? row.lademeter ?? null,
        cell: ({ row: { original } }) => {
          const parts: string[] = [];
          if (original.gewicht != null) parts.push(weight(original.gewicht));
          if (original.lademeter != null)
            parts.push(`${original.lademeter} ldm`);
          return (
            <span className="text-[#57688e]">
              {parts.length > 0 ? parts.join(" · ") : "—"}
            </span>
          );
        },
        footer: () => (
          <span>
            {weight(totals.totalGewicht)} · {totals.totalLdm.toFixed(2)} ldm
          </span>
        ),
      },
      {
        id: "marge",
        header: "Marge (€)",
        accessorFn: (row) => {
          if (row.verkaufspreis == null || row.einkaufspreis == null)
            return null;
          return row.verkaufspreis - row.einkaufspreis;
        },
        cell: ({ getValue }) => {
          const v = getValue<number | null>();
          if (v == null) return <span className="text-[#57688e]/50">—</span>;
          return (
            <span
              className={`font-medium ${v >= 0 ? "text-emerald-600" : "text-red-600"}`}
            >
              {eur(v)}
            </span>
          );
        },
        footer: () => (
          <div className="space-y-0.5">
            <div
              className={
                totals.totalMarge >= 0 ? "text-emerald-600" : "text-red-600"
              }
            >
              Σ {eur(totals.totalMarge)}
            </div>
            <div className="text-[0.65rem] font-normal text-[#57688e]">
              Ø {eur(totals.avgMarge)}
            </div>
          </div>
        ),
      },
    ],
    [totals],
  );

  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex items-center border-b border-[#0f172b]/10 px-4 py-2.5">
        <Typography level="title-sm" sx={{ color: "#0f172b", fontWeight: 600 }}>
          Sendungen
        </Typography>
        <span className="ml-2 rounded-full bg-[#155dfc]/10 px-2 py-0.5 text-[0.65rem] font-medium text-[#155dfc]">
          {sendungen.length}
        </span>
      </div>
      <DataTable
        columns={columns}
        data={sendungen}
        onRowClick={onRowClick}
        searchPlaceholder="Sendung suchen…"
        emptyMessage="Keine Sendungen vorhanden"
        noResultsMessage="Keine Treffer für diese Suche"
      />
    </div>
  );
}
