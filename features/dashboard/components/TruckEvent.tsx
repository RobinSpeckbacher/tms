"use client";

import { useState, useMemo } from "react";
import type { CalendarEvent } from "@ilamy/calendar";
import type { SendungRow } from "@/hooks/useSendungen";
import type { Truck } from "@/hooks/useTrucks";
import { Package, Truck as TruckIcon, User, AlertTriangle } from "lucide-react";

/* ── Helpers ──────────────────────────────────────────────────────── */
function pct(used: number, max: number) {
  if (!max) return 0;
  return Math.round((used / max) * 100);
}

function barColor(percent: number) {
  if (percent >= 90) return "#ef4444";
  if (percent >= 70) return "#f59e0b";
  return "#22c55e";
}

/* ── Props ────────────────────────────────────────────────────────── */
interface TruckEventProps {
  event: CalendarEvent;
  assignedSendungen: SendungRow[];
  onDropSendung: (truckId: string, sendungId: string) => void;
  onUnassignSendung: (sendungId: string) => void;
  onClick?: () => void;
}

/* ── Component ────────────────────────────────────────────────────── */
export default function TruckEvent({
  event,
  assignedSendungen,
  onDropSendung,
  onClick,
}: TruckEventProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const ext = event as unknown as Record<string, unknown>;
  const truckId = ext.truckId as string;
  const truck = ext.truckData as Truck | undefined;
  const accent = (event.backgroundColor as string) || "#155dfc";
  const hasDriver =
    typeof truck?.fahrer === "string" && truck.fahrer.trim().length > 0;

  const capacity = useMemo(() => {
    let usedLdm = 0,
      usedKg = 0,
      usedPal = 0;
    for (const s of assignedSendungen) {
      usedLdm += s.lademeter ?? 0;
      usedKg += s.gewicht ?? 0;
      usedPal += s.anzahl ?? 0;
    }
    const maxLdm = truck?.lademeter ?? 0;
    const maxKg = truck?.max_gewicht ?? 0;
    const maxPal = truck?.max_paletten ?? 0;
    const mainPct =
      Math.max(
        pct(usedLdm, maxLdm),
        pct(usedKg, maxKg),
        pct(usedPal, maxPal),
      ) || 0;
    return { mainPct };
  }, [assignedSendungen, truck]);

  const count = assignedSendungen.length;

  return (
    <div
      className={`group/truck relative h-full w-full flex overflow-hidden rounded-md cursor-pointer
        bg-white border transition-all
        ${
          isDragOver
            ? "border-blue-400 ring-2 ring-blue-400/30 scale-[1.01]"
            : "border-slate-200 hover:border-slate-300 hover:shadow-md"
        }`}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
        const sendungId = e.dataTransfer.getData("text/plain");
        if (sendungId && truckId) onDropSendung(truckId, sendungId);
      }}
    >
      {/* Accent bar */}
      <div className="w-1 shrink-0" style={{ backgroundColor: accent }} />

      {/* Body */}
      <div className="flex-1 min-w-0 flex flex-col p-1.5 gap-1">
        {/* Row 1: Truck name */}
        <div className="flex items-center gap-1 min-w-0">
          <TruckIcon className="h-3 w-3 shrink-0" style={{ color: accent }} />
          <span className="text-[11px] font-bold text-slate-800 truncate">
            {truck?.kennzeichen ?? event.title}
          </span>
        </div>

        {/* Row 2: Driver */}
        {hasDriver && (
          <div className="flex items-center gap-1 text-[10px] text-slate-400">
            <User className="h-2.5 w-2.5 shrink-0" />
            <span className="truncate">{truck.fahrer}</span>
          </div>
        )}

        {/* Row 3: Sendung count badge + capacity */}
        <div className="flex items-center gap-1.5 mt-auto">
          <span className="inline-flex items-center gap-0.5 rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold text-blue-600">
            <Package className="h-2.5 w-2.5" />
            {count}
          </span>
          {count > 0 && capacity.mainPct > 0 && (
            <div className="flex items-center gap-1 flex-1 min-w-0">
              <div className="flex-1 h-1 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(capacity.mainPct, 100)}%`,
                    backgroundColor: barColor(capacity.mainPct),
                  }}
                />
              </div>
              <span
                className="text-[9px] font-semibold tabular-nums shrink-0"
                style={{ color: barColor(capacity.mainPct) }}
              >
                {capacity.mainPct}%
              </span>
            </div>
          )}
          {capacity.mainPct >= 100 && (
            <div className="flex items-center gap-0.5 text-[9px] text-red-600 font-medium">
              <AlertTriangle className="h-2.5 w-2.5 shrink-0" />
              <span>Überladen</span>
            </div>
          )}
        </div>

        {/* Drop zone overlay */}
        {isDragOver && (
          <div
            className="absolute inset-0 flex items-center justify-center rounded-md
                          bg-blue-50/80 border-2 border-dashed border-blue-400/50"
          >
            <span className="text-[10px] font-semibold text-blue-600">
              ✚ Ablegen
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
