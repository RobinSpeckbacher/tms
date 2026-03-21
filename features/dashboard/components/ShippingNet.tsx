"use client";

import { useState, useMemo } from "react";
import dayjs, { type Dayjs } from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import {
  ChevronLeft,
  ChevronRight,
  Package,
  MapPin,
  Weight,
  Layers,
  Ruler,
  X,
  Truck as TruckIcon,
  User,
  Calendar,
} from "lucide-react";
import type { Truck } from "@/hooks/useTrucks";
import type { SendungRow } from "@/hooks/useSendungen";

dayjs.extend(isoWeek);

/* ── Helpers ──────────────────────────────────────────────────────── */
const DAY_LABELS = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];

const PE_SHORT: Record<string, string> = {
  europalette: "EP",
  industriepalette: "IP",
  gitterbox: "GB",
  colli: "Colli",
  sonstige: "Stk",
};

function getMonday(d: Dayjs): Dayjs {
  const dow = d.day();
  return d.subtract(dow === 0 ? 6 : dow - 1, "day").startOf("day");
}

/* ── Sendung chip inside a cell ──────────────────────────────────── */
function SendungChip({
  sendung,
  onUnassign,
}: {
  sendung: SendungRow;
  onUnassign: () => void;
}) {
  const pe = sendung.packungseinheit
    ? PE_SHORT[sendung.packungseinheit]
    : null;

  return (
    <div className="group/chip relative rounded-md bg-white border border-slate-200/80
                    shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.08)]
                    hover:border-blue-300/60 p-1.5 text-[10px] transition-all">
      {/* Row 1: Referenz + remove */}
      <div className="flex items-center gap-1">
        <Package className="h-3 w-3 shrink-0 text-blue-500" />
        <span className="font-semibold text-slate-800 truncate">
          {sendung.referenz}
        </span>
        <button
          type="button"
          onClick={() => onUnassign()}
          className="ml-auto shrink-0 p-0.5 rounded text-slate-300 opacity-0 group-hover/chip:opacity-100
                     hover:bg-red-50 hover:text-red-500 transition-all"
        >
          <X className="h-3 w-3" />
        </button>
      </div>

      {/* Row 2: Route */}
      <div className="mt-0.5 flex items-center gap-1 text-slate-500">
        <MapPin className="h-2.5 w-2.5 text-emerald-500" />
        <span className="truncate">{sendung.lade_ort}</span>
        <span className="text-slate-300 mx-0.5">→</span>
        <MapPin className="h-2.5 w-2.5 text-rose-400" />
        <span className="truncate">{sendung.entlade_ort}</span>
      </div>

      {/* Row 3: Metrics */}
      {(sendung.gewicht || sendung.anzahl || sendung.lademeter) && (
        <div className="mt-1 flex items-center gap-1.5 flex-wrap">
          {sendung.gewicht != null && (
            <span className="inline-flex items-center gap-0.5 rounded bg-slate-50 px-1 py-px text-[9px] text-slate-500 font-medium">
              <Weight className="h-2.5 w-2.5" />
              {sendung.gewicht >= 1000
                ? `${(sendung.gewicht / 1000).toFixed(1)}t`
                : `${sendung.gewicht}kg`}
            </span>
          )}
          {sendung.anzahl != null && pe && (
            <span className="inline-flex items-center gap-0.5 rounded bg-slate-50 px-1 py-px text-[9px] text-slate-500 font-medium">
              <Layers className="h-2.5 w-2.5" />
              {sendung.anzahl} {pe}
            </span>
          )}
          {sendung.lademeter != null && (
            <span className="inline-flex items-center gap-0.5 rounded bg-slate-50 px-1 py-px text-[9px] text-slate-500 font-medium">
              <Ruler className="h-2.5 w-2.5" />
              {sendung.lademeter} ldm
            </span>
          )}
        </div>
      )}

      {/* Row 4: Kunde */}
      {sendung.kunde && (
        <p className="mt-0.5 text-[9px] text-slate-400 truncate">
          {sendung.kunde.name}
        </p>
      )}
    </div>
  );
}

/* ── Cell component (truck × day) ────────────────────────────────── */
function NetCell({
  truckId,
  sendungen,
  isToday,
  onDropSendung,
  onUnassignSendung,
}: {
  truckId: string;
  sendungen: SendungRow[];
  isToday: boolean;
  onDropSendung: (truckId: string, sendungId: string) => void;
  onUnassignSendung: (sendungId: string) => void;
}) {
  const [isDragOver, setIsDragOver] = useState(false);

  return (
    <td
      className={`border-r border-b border-slate-200/70 p-1.5 align-top transition-all
        ${isToday ? "bg-blue-50/40" : "bg-white"}
        ${isDragOver ? "bg-blue-50 ring-2 ring-inset ring-blue-400/40" : ""}`}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragOver(false);
        const sendungId = e.dataTransfer.getData("text/plain");
        if (sendungId) onDropSendung(truckId, sendungId);
      }}
    >
      <div className="flex flex-col gap-1.5 min-h-10">
        {sendungen.map((s) => (
          <SendungChip
            key={s.id}
            sendung={s}
            onUnassign={() => onUnassignSendung(s.id)}
          />
        ))}
      </div>

      {/* Drop zone */}
      {isDragOver && sendungen.length === 0 && (
        <div className="flex items-center justify-center h-9 rounded-md border-2 border-dashed
                        border-blue-400/50 bg-blue-50/60 mt-1">
          <span className="text-[10px] text-blue-500 font-semibold">
            ✚ Ablegen
          </span>
        </div>
      )}
    </td>
  );
}

/* ── Props ────────────────────────────────────────────────────────── */
interface ShippingNetProps {
  trucks: Truck[];
  truckSendungenMap: Map<string, SendungRow[]>;
  onDropSendung: (truckId: string, sendungId: string) => void;
  onUnassignSendung: (sendungId: string) => void;
}

/* ── Main Component ──────────────────────────────────────────────── */
export default function ShippingNet({
  trucks,
  truckSendungenMap,
  onDropSendung,
  onUnassignSendung,
}: ShippingNetProps) {
  const [weekStart, setWeekStart] = useState(() => getMonday(dayjs()));

  const weekDays = useMemo(() => {
    const days: Dayjs[] = [];
    for (let i = 0; i < 6; i++) days.push(weekStart.add(i, "day"));
    return days;
  }, [weekStart]);

  const todayStr = dayjs().format("YYYY-MM-DD");
  const weekNum = weekStart.isoWeek();

  const getCellSendungen = (truckId: string, day: Dayjs) => {
    const all = truckSendungenMap.get(truckId) ?? [];
    const dayStr = day.format("YYYY-MM-DD");
    return all.filter((s) => s.ladedatum === dayStr);
  };

  const getDaySummary = (day: Dayjs) => {
    const dayStr = day.format("YYYY-MM-DD");
    let count = 0,
      totalKg = 0,
      totalLdm = 0;
    for (const [, sendungen] of truckSendungenMap) {
      for (const s of sendungen) {
        if (s.ladedatum === dayStr) {
          count++;
          totalKg += s.gewicht ?? 0;
          totalLdm += s.lademeter ?? 0;
        }
      }
    }
    return { count, totalKg, totalLdm };
  };

  const getTruckSummary = (truckId: string) => {
    const all = truckSendungenMap.get(truckId) ?? [];
    let totalKg = 0,
      totalPal = 0,
      totalLdm = 0;
    for (const s of all) {
      totalKg += s.gewicht ?? 0;
      totalPal += s.anzahl ?? 0;
      totalLdm += s.lademeter ?? 0;
    }
    return { count: all.length, totalKg, totalPal, totalLdm };
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg overflow-hidden">
      {/* ── Navigation bar ── */}
      <div className="flex items-center gap-3 px-4 h-11 bg-white border-b border-slate-200 shrink-0">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setWeekStart((w) => w.subtract(1, "week"))}
            className="p-1.5 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => setWeekStart((w) => w.add(1, "week"))}
            className="p-1.5 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-slate-400" />
          <span className="text-sm font-semibold text-slate-800">
            {weekStart.format("DD.MM.")} – {weekStart.add(5, "day").format("DD.MM.YYYY")}
          </span>
          <span className="text-[10px] font-medium text-slate-400 bg-slate-100 rounded px-1.5 py-0.5">
            KW {weekNum}
          </span>
        </div>

        <button
          onClick={() => setWeekStart(getMonday(dayjs()))}
          className="ml-1 text-[11px] font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100
                     rounded-md px-2.5 py-1 transition-colors"
        >
          Heute
        </button>

        {/* Truck count */}
        <div className="ml-auto flex items-center gap-1.5 text-[11px] text-slate-400">
          <TruckIcon className="h-3.5 w-3.5" />
          <span>{trucks.length} LKW</span>
        </div>
      </div>

      {/* ── Grid ── */}
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse min-w-240">
          <thead className="sticky top-0 z-10">
            <tr>
              {/* Truck column header */}
              <th className="w-48 bg-slate-800 p-2.5 text-left border-r border-slate-700">
                <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                  Fahrzeug
                </span>
              </th>

              {/* Day headers */}
              {weekDays.map((day) => {
                const summary = getDaySummary(day);
                const isToday = day.format("YYYY-MM-DD") === todayStr;
                return (
                  <th
                    key={day.format("YYYY-MM-DD")}
                    className={`border-r border-slate-700 p-2.5 text-left align-top min-w-36
                      ${isToday ? "bg-blue-600" : "bg-slate-800"}`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[11px] font-bold ${isToday ? "text-white" : "text-slate-200"}`}>
                        {DAY_LABELS[day.day()]}
                      </span>
                      <span className={`text-[11px] font-medium ${isToday ? "text-blue-100" : "text-slate-400"}`}>
                        {day.format("DD.MM.")}
                      </span>
                      {isToday && (
                        <span className="ml-auto text-[9px] font-semibold bg-white/20 text-white rounded px-1.5 py-0.5">
                          Heute
                        </span>
                      )}
                    </div>
                    {summary.count > 0 && (
                      <div className={`mt-1 flex items-center gap-2 text-[10px] font-normal
                        ${isToday ? "text-blue-200" : "text-slate-500"}`}>
                        <span>{summary.count} S.</span>
                        <span className="opacity-50">·</span>
                        <span>{summary.totalKg} kg</span>
                        <span className="opacity-50">·</span>
                        <span>{summary.totalLdm} ldm</span>
                      </div>
                    )}
                  </th>
                );
              })}

              {/* Summary column header */}
              <th className="w-28 bg-slate-800 p-2.5 text-left border-l border-slate-700">
                <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                  Gesamt
                </span>
              </th>
            </tr>
          </thead>

          <tbody>
            {trucks.length === 0 && (
              <tr>
                <td
                  colSpan={weekDays.length + 2}
                  className="p-12 text-center"
                >
                  <TruckIcon className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">Keine Fahrzeuge vorhanden</p>
                </td>
              </tr>
            )}

            {trucks.map((truck, idx) => {
              const accent = truck.farbe || "#155dfc";
              const truckSum = getTruckSummary(truck.id);
              const isEven = idx % 2 === 0;
              return (
                <tr
                  key={truck.id}
                  className={`group/row transition-colors
                    ${isEven ? "bg-white" : "bg-slate-50/60"}
                    hover:bg-blue-50/30`}
                >
                  {/* Truck label */}
                  <td className="border-r border-b border-slate-200/70 p-0 align-top">
                    <div className="flex h-full">
                      <div className="w-1 shrink-0" style={{ backgroundColor: accent }} />
                      <div className="flex-1 p-2.5 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <TruckIcon className="h-3.5 w-3.5 shrink-0" style={{ color: accent }} />
                          <span className="text-[11px] font-bold text-slate-800 truncate">
                            {truck.kennzeichen}
                          </span>
                        </div>
                        {truck.fahrer && (
                          <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-1">
                            <User className="h-3 w-3 shrink-0" />
                            <span className="truncate">{truck.fahrer}</span>
                          </div>
                        )}
                        {truck.fraechter && (
                          <p className="text-[9px] text-slate-400 truncate mt-0.5 pl-4">
                            {truck.fraechter.name}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Day cells */}
                  {weekDays.map((day) => (
                    <NetCell
                      key={day.format("YYYY-MM-DD")}
                      truckId={truck.id}
                      sendungen={getCellSendungen(truck.id, day)}
                      isToday={day.format("YYYY-MM-DD") === todayStr}
                      onDropSendung={onDropSendung}
                      onUnassignSendung={onUnassignSendung}
                    />
                  ))}

                  {/* Truck summary */}
                  <td className="border-l border-b border-slate-200/70 p-2.5 align-top">
                    {truckSum.count > 0 ? (
                      <div className="space-y-1">
                        <div className="text-[11px] font-bold text-slate-800">
                          {truckSum.count} Sendung{truckSum.count > 1 ? "en" : ""}
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="inline-flex items-center gap-1 text-[10px] text-slate-500">
                            <Weight className="h-2.5 w-2.5" />{truckSum.totalKg} kg
                          </span>
                          <span className="inline-flex items-center gap-1 text-[10px] text-slate-500">
                            <Layers className="h-2.5 w-2.5" />{truckSum.totalPal} Pal
                          </span>
                          <span className="inline-flex items-center gap-1 text-[10px] text-slate-500">
                            <Ruler className="h-2.5 w-2.5" />{truckSum.totalLdm} ldm
                          </span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-300 italic">Leer</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
