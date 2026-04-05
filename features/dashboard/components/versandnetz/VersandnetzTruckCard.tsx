"use client";

import { useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Clock,
  Layers,
  MapPin,
  Package,
  Ruler,
  Truck as TruckIcon,
  User,
  Weight,
  X,
} from "lucide-react";
import type { Truck } from "@/hooks/useTrucks";
import type { SendungRow } from "@/hooks/useSendungen";

const packagingUnitShortLabels: Record<string, string> = {
  europalette: "EP",
  industriepalette: "IP",
  gitterbox: "GB",
  colli: "Colli",
  sonstige: "Stk",
};

function formatTimeLabel(timeValue: string | undefined | null): string {
  if (timeValue == null || timeValue.trim() === "") return "";
  return timeValue.slice(0, 5);
}

function calculateUtilizationPercent(used: number, max: number) {
  if (!max) return 0;
  return Math.round((used / max) * 100);
}

function getUtilizationColor(percent: number) {
  if (percent >= 90) return "#ef4444";
  if (percent >= 70) return "#f59e0b";
  return "#22c55e";
}

export function ShipmentAssignmentChip({
  sendung,
  onUnassign,
}: {
  sendung: SendungRow;
  onUnassign: () => void;
}) {
  const packagingUnitLabel =
    sendung.packungseinheit != null && sendung.packungseinheit.trim() !== ""
      ? (packagingUnitShortLabels[sendung.packungseinheit] ?? null)
      : null;

  return (
    <div
      className="group/chip relative rounded bg-white/80 border border-slate-200/60
                    p-1 text-[9px] transition-all hover:bg-white"
    >
      <div className="flex items-center gap-0.5">
        <Package className="h-2.5 w-2.5 shrink-0 text-blue-500" />
        <span className="font-semibold text-slate-700 truncate">
          {sendung.referenz}
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onUnassign();
          }}
          className="ml-auto shrink-0 p-0.5 rounded text-slate-300 opacity-0 group-hover/chip:opacity-100
                     hover:bg-red-50 hover:text-red-500 transition-all"
        >
          <X className="h-2.5 w-2.5" />
        </button>
      </div>
      <div className="mt-0.5 flex items-center gap-0.5 text-slate-500">
        <MapPin className="h-2 w-2 text-emerald-500" />
        <span className="truncate">{sendung.lade_ort}</span>
        <span className="text-slate-300 mx-0.5">→</span>
        <span className="truncate">{sendung.entlade_ort}</span>
      </div>
      {(sendung.gewicht != null ||
        sendung.anzahl != null ||
        sendung.lademeter != null) && (
        <div className="mt-0.5 flex items-center gap-1 flex-wrap">
          {sendung.gewicht != null && (
            <span className="inline-flex items-center gap-0.5 text-[8px] text-slate-400">
              <Weight className="h-2 w-2" />
              {sendung.gewicht >= 1000
                ? `${(sendung.gewicht / 1000).toFixed(1)}t`
                : `${sendung.gewicht}kg`}
            </span>
          )}
          {sendung.anzahl != null &&
            packagingUnitLabel != null &&
            packagingUnitLabel.trim() !== "" && (
              <span className="inline-flex items-center gap-0.5 text-[8px] text-slate-400">
                <Layers className="h-2 w-2" />
                {sendung.anzahl} {packagingUnitLabel}
              </span>
            )}
          {sendung.lademeter != null && (
            <span className="inline-flex items-center gap-0.5 text-[8px] text-slate-400">
              <Ruler className="h-2 w-2" />
              {sendung.lademeter} ldm
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export function TruckScheduleCard({
  truck,
  sendungen,
  onDropSendung,
  onUnassignSendung,
  onClick,
}: {
  truck: Truck;
  sendungen: SendungRow[];
  onDropSendung: (truckId: string, sendungId: string) => void;
  onUnassignSendung: (sendungId: string) => void;
  onClick?: () => void;
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const dragCounterRef = useRef(0);
  const accent = truck.farbe || "#155dfc";

  const capacity = useMemo(() => {
    let usedLademeter = 0;
    let usedWeight = 0;
    let usedPallets = 0;

    for (const sendung of sendungen) {
      usedLademeter += sendung.lademeter ?? 0;
      usedWeight += sendung.gewicht ?? 0;
      usedPallets += sendung.anzahl ?? 0;
    }

    const maxLademeter = truck.lademeter ?? 0;
    const maxWeight = truck.max_gewicht ?? 0;
    const maxPallets = truck.max_paletten ?? 0;

    const mainPercent = Math.max(
      calculateUtilizationPercent(usedLademeter, maxLademeter),
      calculateUtilizationPercent(usedWeight, maxWeight),
      calculateUtilizationPercent(usedPallets, maxPallets),
    );

    return { mainPercent };
  }, [sendungen, truck]);

  return (
    <div
      className={`group/truck relative rounded-md border overflow-hidden text-[10px] transition-all cursor-pointer
        ${
          isDragOver
            ? "ring-2 ring-blue-400/50 border-blue-300"
            : "border-slate-200/80 hover:border-slate-300 hover:shadow-sm"
        }`}
      style={{ borderLeftWidth: 3, borderLeftColor: accent }}
      onClick={(event) => {
        event.stopPropagation();
        onClick?.();
      }}
      onDragOver={(event) => {
        event.preventDefault();
        event.stopPropagation();
        event.dataTransfer.dropEffect = "move";
      }}
      onDragEnter={(event) => {
        event.preventDefault();
        dragCounterRef.current++;
        setIsDragOver(true);
      }}
      onDragLeave={() => {
        dragCounterRef.current--;
        if (dragCounterRef.current === 0) setIsDragOver(false);
      }}
      onDrop={(event) => {
        event.preventDefault();
        event.stopPropagation();
        dragCounterRef.current = 0;
        setIsDragOver(false);
        const sendungId = event.dataTransfer.getData("text/plain");
        if (sendungId) onDropSendung(truck.id, sendungId);
      }}
    >
      <div className="px-1.5 pt-1.5 pb-1 bg-slate-50/80">
        <div className="flex items-center gap-1">
          <TruckIcon className="h-3 w-3 shrink-0" style={{ color: accent }} />
          <span className="font-bold text-slate-800 truncate">
            {truck.kennzeichen}
          </span>
        </div>
        <div className="flex items-center gap-0.5 text-[9px] text-slate-400 mt-0.5">
          <Clock className="h-2.5 w-2.5 shrink-0" />
          <span>
            {formatTimeLabel(truck.ladezeit) || "08:00"} –{" "}
            {formatTimeLabel(truck.entladezeit) || "17:00"}
          </span>
        </div>
        {truck.fahrer != null && truck.fahrer.trim() !== "" && (
          <div className="flex items-center gap-0.5 text-[9px] text-slate-500 mt-0.5">
            <User className="h-2.5 w-2.5 shrink-0" />
            <span className="truncate">{truck.fahrer}</span>
          </div>
        )}
        {truck.fraechter && (
          <p className="text-[8px] text-slate-400 truncate mt-0.5 pl-3">
            {truck.fraechter.name}
          </p>
        )}
      </div>

      {sendungen.length > 0 && capacity.mainPercent > 0 && (
        <div className="px-1.5 pb-1 flex items-center gap-1">
          <span className="inline-flex items-center gap-0.5 rounded bg-blue-50 px-1 py-0.5 text-[9px] font-semibold text-blue-600">
            <Package className="h-2.5 w-2.5" />
            {sendungen.length}
          </span>
          <div className="flex-1 h-1 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.min(capacity.mainPercent, 100)}%`,
                backgroundColor: getUtilizationColor(capacity.mainPercent),
              }}
            />
          </div>
          <span
            className="text-[8px] font-semibold tabular-nums"
            style={{ color: getUtilizationColor(capacity.mainPercent) }}
          >
            {capacity.mainPercent}%
          </span>
        </div>
      )}

      {capacity.mainPercent >= 100 && (
        <div className="px-1.5 pb-1 flex items-center gap-0.5 text-[8px] text-red-600 font-medium">
          <AlertTriangle className="h-2.5 w-2.5 shrink-0" />
          <span>Überladen ({capacity.mainPercent}%)</span>
        </div>
      )}

      {sendungen.length > 0 && (
        <div className="px-1 pb-1 space-y-0.5">
          {sendungen.map((sendung) => (
            <ShipmentAssignmentChip
              key={sendung.id}
              sendung={sendung}
              onUnassign={() => onUnassignSendung(sendung.id)}
            />
          ))}
        </div>
      )}

      {isDragOver && (
        <div
          className="absolute inset-0 flex items-center justify-center rounded-md
                        bg-blue-50/80 border-2 border-dashed border-blue-400/50"
        >
          <span className="text-[9px] font-semibold text-blue-600">
            ✚ Ablegen
          </span>
        </div>
      )}
    </div>
  );
}
