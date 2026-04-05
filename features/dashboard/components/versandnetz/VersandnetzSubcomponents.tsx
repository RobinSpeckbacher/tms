"use client";

import { useState } from "react";
import { Check, Filter } from "lucide-react";
import type { Truck } from "@/hooks/useTrucks";
import type { Relation } from "@/hooks/useRelationen";
import type { SendungRow } from "@/hooks/useSendungen";
import {
  ShipmentAssignmentChip,
  TruckScheduleCard,
} from "./VersandnetzTruckCard";

export { ShipmentAssignmentChip, TruckScheduleCard };

export const relationAccentColors = [
  "#155dfc",
  "#7c3aed",
  "#0891b2",
  "#059669",
  "#d97706",
  "#dc2626",
  "#db2777",
  "#4f46e5",
  "#0d9488",
  "#ca8a04",
];

export function RelationDayCell({
  trucks,
  truckSendungenMap,
  isToday,
  onDropSendung,
  onUnassignSendung,
  onTruckClick,
}: {
  trucks: Truck[];
  truckSendungenMap: Map<string, SendungRow[]>;
  isToday: boolean;
  onDropSendung: (truckId: string, sendungId: string) => void;
  onUnassignSendung: (sendungId: string) => void;
  onTruckClick: (truckId: string) => void;
}) {
  return (
    <td
      className={`border-r border-b border-slate-200/70 p-1.5 align-top
        ${isToday ? "bg-blue-50/40" : "bg-white"}`}
    >
      <div className="flex flex-col gap-1.5 min-h-12">
        {trucks.map((truck) => (
          <TruckScheduleCard
            key={truck.id}
            truck={truck}
            sendungen={truckSendungenMap.get(truck.id) ?? []}
            onDropSendung={onDropSendung}
            onUnassignSendung={onUnassignSendung}
            onClick={() => onTruckClick(truck.id)}
          />
        ))}
      </div>
    </td>
  );
}

export function NewRelationInlineFormRow({
  onSave,
  onCancel,
}: {
  onSave: (nummer: string, name: string, farbe: string) => void;
  onCancel: () => void;
}) {
  const [relationNumber, setRelationNumber] = useState("");
  const [relationName, setRelationName] = useState("");
  const [relationColor, setRelationColor] = useState(
    () =>
      relationAccentColors[
        Math.floor(Math.random() * relationAccentColors.length)
      ],
  );

  const handleSubmit = () => {
    const trimmedNumber = relationNumber.trim();
    const trimmedName = relationName.trim();
    if (!trimmedNumber || !trimmedName) return;
    onSave(trimmedNumber, trimmedName, relationColor);
  };

  return (
    <div className="flex items-center gap-2 px-2.5 py-2 border-b border-slate-200/70 bg-blue-50/40">
      <div
        className="w-1 h-8 rounded shrink-0"
        style={{ backgroundColor: relationColor }}
      />
      <input
        autoFocus
        placeholder="Nr."
        value={relationNumber}
        onChange={(event) => setRelationNumber(event.target.value)}
        className="w-16 rounded border border-slate-300 px-1.5 py-1 text-[11px] font-semibold
                   text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
      />
      <input
        placeholder="Name der Relation"
        value={relationName}
        onChange={(event) => setRelationName(event.target.value)}
        onKeyDown={(event) => event.key === "Enter" && handleSubmit()}
        className="flex-1 rounded border border-slate-300 px-1.5 py-1 text-[11px]
                   text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
      />
      <select
        value={relationColor}
        onChange={(event) => setRelationColor(event.target.value)}
        className="rounded border border-slate-300 px-1 py-1 text-[11px] text-slate-600
                   focus:outline-none focus:ring-1 focus:ring-blue-400"
        style={{ color: relationColor }}
      >
        {relationAccentColors.map((colorValue) => (
          <option
            key={colorValue}
            value={colorValue}
            style={{ color: colorValue }}
          >
            ■ {colorValue}
          </option>
        ))}
      </select>
      <button
        onClick={handleSubmit}
        disabled={!relationNumber.trim() || !relationName.trim()}
        className="rounded bg-blue-600 px-2 py-1 text-[11px] font-semibold text-white
                   hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        Speichern
      </button>
      <button
        onClick={onCancel}
        className="rounded px-2 py-1 text-[11px] font-medium text-slate-500
                   hover:bg-slate-100 transition-colors"
      >
        Abbrechen
      </button>
    </div>
  );
}

export function RelationVisibilityFilterMenu({
  relationen,
  activeIds,
  onToggle,
}: {
  relationen: Relation[];
  activeIds: Set<string>;
  onToggle: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition-colors
          ${
            activeIds.size < relationen.length
              ? "bg-blue-50 text-blue-600 hover:bg-blue-100"
              : "text-slate-500 hover:bg-slate-100"
          }`}
      >
        <Filter className="h-3 w-3" />
        Filter
        {activeIds.size < relationen.length && (
          <span className="ml-0.5 bg-blue-600 text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center">
            {activeIds.size}
          </span>
        )}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-30 w-56 rounded-lg border border-slate-200 bg-white shadow-lg py-1">
            {relationen.map((relation) => (
              <button
                key={relation.id}
                onClick={() => onToggle(relation.id)}
                className="flex items-center gap-2 w-full px-3 py-1.5 text-[11px] hover:bg-slate-50 transition-colors"
              >
                <div
                  className="w-2.5 h-2.5 rounded-sm shrink-0"
                  style={{ backgroundColor: relation.farbe || "#155dfc" }}
                />
                <span className="flex-1 text-left text-slate-700 truncate">
                  {relation.nummer} {relation.name}
                </span>
                {activeIds.has(relation.id) && (
                  <Check className="h-3 w-3 text-blue-600 shrink-0" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function VersandnetzLoadingGrid({ cols }: { cols: number }) {
  return (
    <div className="p-4 space-y-3">
      <div className="flex gap-2">
        <div className="w-48 h-10 rounded-md bg-slate-200/60 animate-pulse shrink-0" />
        {Array.from({ length: cols }).map((_, columnIndex) => (
          <div
            key={columnIndex}
            className="flex-1 h-10 rounded-md bg-slate-200/50 animate-pulse"
          />
        ))}
        <div className="w-28 h-10 rounded-md bg-slate-200/40 animate-pulse shrink-0" />
      </div>
      {Array.from({ length: 5 }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-2">
          <div className="w-48 h-16 rounded-md bg-slate-100 animate-pulse shrink-0" />
          {Array.from({ length: cols }).map((_, columnIndex) => (
            <div
              key={columnIndex}
              className="flex-1 h-16 rounded-md bg-slate-50 animate-pulse"
              style={{
                animationDelay: `${(rowIndex * cols + columnIndex) * 75}ms`,
              }}
            />
          ))}
          <div className="w-28 h-16 rounded-md bg-slate-50 animate-pulse shrink-0" />
        </div>
      ))}
    </div>
  );
}
