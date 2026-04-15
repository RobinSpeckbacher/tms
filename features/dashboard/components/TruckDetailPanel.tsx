"use client";

import { useMemo, useState } from "react";
import {
  X,
  Package,
  MapPin,
  Weight,
  Layers,
  Ruler,
  Truck as TruckIcon,
  User,
  SquarePen,
  CalendarDays,
  FileText,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import type { Truck } from "@/hooks/useTrucks";
import type { SendungRow } from "@/hooks/useSendungen";
import { generateCmrPdf } from "@/services/cmrService";
import { TruckRouteSummarySection } from "./truck-detail-panel/TruckRouteSummarySection";

/* ── Helpers ──────────────────────────────────────────────────────── */
const PE_SHORT: Record<string, string> = {
  europalette: "EP",
  industriepalette: "IP",
  gitterbox: "GB",
  colli: "Colli",
  sonstige: "Stk",
};

function pct(used: number, max: number) {
  if (!max) return 0;
  return Math.round((used / max) * 100);
}

function barColor(p: number) {
  if (p >= 90) return "#ef4444";
  if (p >= 70) return "#f59e0b";
  return "#22c55e";
}

function hasText(value: string | null | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

/* ── Props ────────────────────────────────────────────────────────── */
interface TruckDetailPanelProps {
  truck: Truck | null;
  sendungen: SendungRow[];
  open: boolean;
  onClose: () => void;
  onEditTruck: (truck: Truck) => void;
  onEditSendung: (sendung: SendungRow) => void;
  onUnassignSendung: (sendungId: string) => void;
  onDropSendung: (truckId: string, sendungId: string) => void;
}

/* ── Component ────────────────────────────────────────────────────── */
export default function TruckDetailPanel({
  truck,
  sendungen,
  open,
  onClose,
  onEditTruck,
  onEditSendung,
  onUnassignSendung,
  onDropSendung,
}: TruckDetailPanelProps) {
  const accent = hasText(truck?.farbe) ? truck.farbe : "#155dfc";

  const capacity = useMemo(() => {
    let usedLdm = 0,
      usedKg = 0,
      usedPal = 0;
    for (const s of sendungen) {
      usedLdm += s.lademeter ?? 0;
      usedKg += s.gewicht ?? 0;
      usedPal += s.anzahl ?? 0;
    }
    const maxLdm = truck?.lademeter ?? 0;
    const maxKg = truck?.max_gewicht ?? 0;
    const maxPal = truck?.max_paletten ?? 0;
    const pctLdm = pct(usedLdm, maxLdm);
    const pctKg = pct(usedKg, maxKg);
    const pctPal = pct(usedPal, maxPal);
    const mainPct = Math.max(pctLdm, pctKg, pctPal) || 0;
    return { usedLdm, usedKg, usedPal, maxLdm, maxKg, maxPal, mainPct };
  }, [sendungen, truck]);

  if (!open || !truck) return null;

  return (
    <TruckDetailPanelInner
      truck={truck}
      sendungen={sendungen}
      accent={accent}
      capacity={capacity}
      onClose={onClose}
      onEditTruck={onEditTruck}
      onEditSendung={onEditSendung}
      onUnassignSendung={onUnassignSendung}
      onDropSendung={onDropSendung}
    />
  );
}

function TruckDetailPanelInner({
  truck,
  sendungen,
  accent,
  capacity,
  onClose,
  onEditTruck,
  onEditSendung,
  onUnassignSendung,
  onDropSendung,
}: {
  truck: Truck;
  sendungen: SendungRow[];
  accent: string;
  capacity: {
    usedLdm: number;
    usedKg: number;
    usedPal: number;
    maxLdm: number;
    maxKg: number;
    maxPal: number;
    mainPct: number;
  };
  onClose: () => void;
  onEditTruck: (truck: Truck) => void;
  onEditSendung: (sendung: SendungRow) => void;
  onUnassignSendung: (sendungId: string) => void;
  onDropSendung: (truckId: string, sendungId: string) => void;
}) {
  const [cmrLoading, setCmrLoading] = useState(false);

  const handleGenerateCmr = async () => {
    setCmrLoading(true);
    try {
      await generateCmrPdf(truck, sendungen);
    } catch {
      // silently fail — user will see no PDF opened
    } finally {
      setCmrLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div
        className="absolute inset-0 bg-black/20 transition-opacity"
        aria-hidden
      />
      <div
        className="relative h-full w-full max-w-md bg-white border-l border-slate-200 shadow-xl
                   flex flex-col translate-x-0 transition-transform duration-200"
        onClick={(e) => e.stopPropagation()}
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = "move";
        }}
        onDrop={(e) => {
          e.preventDefault();
          const sendungId = e.dataTransfer.getData("text/plain");
          if (sendungId) onDropSendung(truck.id, sendungId);
        }}
      >
        {/* ── Header ── */}
        <div className="shrink-0 border-b border-slate-200 p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: accent + "18" }}
              >
                <TruckIcon className="h-5 w-5" style={{ color: accent }} />
              </div>
              <div className="min-w-0">
                <h2 className="text-base font-bold text-slate-800 truncate">
                  {truck.kennzeichen}
                </h2>
                <div className="flex items-center gap-2 mt-0.5">
                  {hasText(truck.fahrer) && (
                    <span className="flex items-center gap-1 text-xs text-slate-500">
                      <User className="h-3 w-3" />
                      {truck.fahrer}
                    </span>
                  )}
                  {truck.fraechter && (
                    <span className="text-xs text-slate-400">
                      {truck.fraechter.name}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => {
                  void handleGenerateCmr();
                }}
                disabled={cmrLoading}
                className="p-1.5 rounded-md text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors disabled:opacity-50"
                title="CMR Frachtbrief generieren"
              >
                {cmrLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FileText className="h-4 w-4" />
                )}
              </button>
              <button
                onClick={() => onEditTruck(truck)}
                className="p-1.5 rounded-md text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                title="LKW bearbeiten"
              >
                <SquarePen className="h-4 w-4" />
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Date + status row */}
          <div className="flex items-center gap-3 mt-3 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" />
              {truck.ladedatum}
              {hasText(truck.ladezeit) ? ` ${truck.ladezeit}` : ""}
            </span>
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-semibold text-white"
              style={{ backgroundColor: accent }}
            >
              {truck.status}
            </span>
          </div>

          {/* Capacity bar */}
          {sendungen.length > 0 && capacity.mainPct > 0 && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                <span>Auslastung</span>
                <span
                  className="font-semibold"
                  style={{ color: barColor(capacity.mainPct) }}
                >
                  {capacity.mainPct}%
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(capacity.mainPct, 100)}%`,
                    backgroundColor: barColor(capacity.mainPct),
                  }}
                />
              </div>
              <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-400">
                <span>
                  {capacity.usedKg}/{capacity.maxKg} kg
                </span>
                <span>
                  {capacity.usedPal}/{capacity.maxPal} Pal
                </span>
                <span>
                  {capacity.usedLdm}/{capacity.maxLdm} ldm
                </span>
              </div>
              {capacity.mainPct >= 100 && (
                <div className="mt-2 flex items-center gap-1.5 rounded-md bg-red-50 border border-red-200 px-2.5 py-1.5 text-xs text-red-600">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                  <span className="font-medium">
                    Achtung: LKW ist möglicherweise überladen (
                    {capacity.mainPct}%)
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Sendungen list ── */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-4 py-3">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Sendungen ({sendungen.length})
            </h3>

            {sendungen.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-8 w-8 text-slate-200 mx-auto mb-2" />
                <p className="text-sm text-slate-400">
                  Keine Sendungen zugewiesen
                </p>
                <p className="text-xs text-slate-300 mt-1">
                  Sendung hierher ziehen zum Zuweisen
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {sendungen.map((s) => {
                  const pe = hasText(s.packungseinheit)
                    ? (PE_SHORT[s.packungseinheit] ?? null)
                    : null;
                  return (
                    <div
                      key={s.id}
                      className="group rounded-lg border border-slate-200 bg-white
                                 hover:border-slate-300 hover:shadow-sm transition-all p-3"
                    >
                      {/* Row 1: Referenz + remove */}
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 shrink-0 text-blue-500" />
                        <span className="text-sm font-semibold text-slate-800 truncate">
                          {s.referenz}
                        </span>
                        <button
                          onClick={() => onEditSendung(s)}
                          className="ml-auto p-1 rounded text-slate-300 opacity-0 group-hover:opacity-100
                                     hover:bg-blue-50 hover:text-blue-600 transition-all"
                          title="Sendung bearbeiten"
                        >
                          <SquarePen className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => onUnassignSendung(s.id)}
                          className="p-1 rounded text-slate-300 opacity-0 group-hover:opacity-100
                                     hover:bg-red-50 hover:text-red-500 transition-all"
                          title="Zuweisung entfernen"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Row 2: Route */}
                      <div className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-500">
                        <MapPin className="h-3 w-3 text-emerald-500" />
                        <span className="truncate">{s.lade_ort}</span>
                        <span className="text-slate-300">→</span>
                        <MapPin className="h-3 w-3 text-rose-400" />
                        <span className="truncate">{s.entlade_ort}</span>
                      </div>

                      {/* Row 3: Dates */}
                      <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-400">
                        <CalendarDays className="h-3 w-3" />
                        <span>
                          {s.ladedatum}
                          {hasText(s.ladezeit)
                            ? ` ${s.ladezeit.slice(0, 5)}`
                            : ""}
                          {" – "}
                          {s.entladedatum}
                          {hasText(s.entladezeit)
                            ? ` ${s.entladezeit.slice(0, 5)}`
                            : ""}
                        </span>
                      </div>

                      {/* Row 4: Metrics */}
                      {(s.gewicht != null ||
                        s.anzahl != null ||
                        s.lademeter != null) && (
                        <div className="mt-2 flex items-center gap-2 flex-wrap">
                          {s.gewicht != null && (
                            <span className="inline-flex items-center gap-1 rounded-md bg-slate-50 px-2 py-0.5 text-[11px] text-slate-500 font-medium">
                              <Weight className="h-3 w-3" />
                              {s.gewicht >= 1000
                                ? `${(s.gewicht / 1000).toFixed(1)}t`
                                : `${s.gewicht}kg`}
                            </span>
                          )}
                          {s.anzahl != null && hasText(pe) && (
                            <span className="inline-flex items-center gap-1 rounded-md bg-slate-50 px-2 py-0.5 text-[11px] text-slate-500 font-medium">
                              <Layers className="h-3 w-3" />
                              {s.anzahl} {pe}
                            </span>
                          )}
                          {s.lademeter != null && (
                            <span className="inline-flex items-center gap-1 rounded-md bg-slate-50 px-2 py-0.5 text-[11px] text-slate-500 font-medium">
                              <Ruler className="h-3 w-3" />
                              {s.lademeter} ldm
                            </span>
                          )}
                        </div>
                      )}

                      {/* Row 5: Kunde */}
                      {s.kunde && (
                        <p className="mt-1 text-[11px] text-slate-400 truncate">
                          {s.kunde.name}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Route section ── */}
          <TruckRouteSummarySection
            sendungen={sendungen}
            preisProKilometer={truck.preis_pro_km}
            kosten={truck.kosten}
            standortOrt={truck.standort_ort}
          />
        </div>
      </div>
    </div>
  );
}
