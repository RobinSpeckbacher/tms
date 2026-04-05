"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import dayjs, { type Dayjs } from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import { Weight, Ruler, Route, Clock } from "lucide-react";
import type { Truck } from "@/hooks/useTrucks";
import type { Relation } from "@/hooks/useRelationen";
import type { SendungRow } from "@/hooks/useSendungen";
import {
  NewRelationInlineFormRow,
  RelationDayCell,
  VersandnetzLoadingGrid,
} from "./versandnetz/VersandnetzSubcomponents";
import {
  VersandnetzHeader,
  type ViewMode,
} from "./versandnetz/VersandnetzHeader";

dayjs.extend(isoWeek);

/* ── Helpers ──────────────────────────────────────────────────────── */
const DAY_LABELS = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];

/* ── Props ────────────────────────────────────────────────────────── */
interface VersandnetzProps {
  relationen: Relation[];
  trucks: Truck[];
  truckSendungenMap: Map<string, SendungRow[]>;
  onDropSendung: (truckId: string, sendungId: string) => void;
  onUnassignSendung: (sendungId: string) => void;
  onCreateRelation: (nummer: string, name: string, farbe: string) => void;
  onCreateTruck: () => void;
  onTruckClick: (truckId: string) => void;
  isLoading?: boolean;
}

/* ── Main Component ──────────────────────────────────────────────── */
export default function Versandnetz({
  relationen,
  trucks,
  truckSendungenMap,
  onDropSendung,
  onUnassignSendung,
  onCreateRelation,
  onCreateTruck,
  onTruckClick,
  isLoading,
}: VersandnetzProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [currentDate, setCurrentDate] = useState(() => dayjs());
  const [showNewRow, setShowNewRow] = useState(false);
  const [disabledRelationIds, setDisabledRelationIds] = useState<Set<string>>(
    () => new Set(),
  );

  const activeRelationIds = useMemo(
    () =>
      new Set(
        relationen
          .filter((relation) => !disabledRelationIds.has(relation.id))
          .map((relation) => relation.id),
      ),
    [relationen, disabledRelationIds],
  );

  const toggleRelation = useCallback((id: string) => {
    setDisabledRelationIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const filteredRelationen = useMemo(
    () => relationen.filter((relation) => activeRelationIds.has(relation.id)),
    [relationen, activeRelationIds],
  );

  // Compute visible days based on view mode
  // Week view starts from currentDate (today), not Monday
  const visibleDays = useMemo(() => {
    const days: Dayjs[] = [];
    const start = currentDate.startOf("day");
    if (viewMode === "day") {
      days.push(start);
    } else if (viewMode === "3day") {
      for (let i = 0; i < 3; i++) days.push(start.add(i, "day"));
    } else {
      for (let i = 0; i < 7; i++) days.push(start.add(i, "day"));
    }
    return days;
  }, [viewMode, currentDate]);

  const todayStr = dayjs().format("YYYY-MM-DD");
  const weekNum = currentDate.isoWeek();

  // Live clock
  const [now, setNow] = useState(() => dayjs());
  useEffect(() => {
    const id = setInterval(() => setNow(dayjs()), 60_000);
    return () => clearInterval(id);
  }, []);

  // Navigation
  const navigate = useCallback(
    (dir: -1 | 1) => {
      const amount = viewMode === "day" ? 1 : viewMode === "3day" ? 3 : 7;
      setCurrentDate((d) => d.add(dir * amount, "day"));
    },
    [viewMode],
  );

  const goToday = useCallback(() => setCurrentDate(dayjs().startOf("day")), []);

  // Date range label
  const dateLabel = useMemo(() => {
    if (viewMode === "day") {
      return currentDate.format("dddd, DD. MMMM YYYY");
    }
    const first = visibleDays[0];
    const last = visibleDays[visibleDays.length - 1];
    return `${first.format("DD.MM.")} – ${last.format("DD.MM.YYYY")}`;
  }, [viewMode, currentDate, visibleDays]);

  // Group trucks by relation_id
  const trucksByRelation = useMemo(() => {
    const map = new Map<string, Truck[]>();
    for (const relation of relationen) map.set(relation.id, []);
    for (const truck of trucks) {
      if (truck.relation_id != null && truck.relation_id.trim() !== "") {
        const list = map.get(truck.relation_id);
        if (list) list.push(truck);
      }
    }
    return map;
  }, [relationen, trucks]);

  // Get trucks for a specific relation + day
  const getCellTrucks = (relationId: string, day: Dayjs) => {
    const dayStr = day.format("YYYY-MM-DD");
    const relationTrucks = trucksByRelation.get(relationId) ?? [];
    return relationTrucks.filter((truck) => truck.ladedatum === dayStr);
  };

  const getDaySummary = (day: Dayjs) => {
    const dayStr = day.format("YYYY-MM-DD");
    let truckCount = 0;
    let sendungCount = 0;
    for (const truck of trucks) {
      if (
        truck.ladedatum === dayStr &&
        truck.relation_id != null &&
        truck.relation_id.trim() !== "" &&
        activeRelationIds.has(truck.relation_id)
      ) {
        truckCount++;
        sendungCount += (truckSendungenMap.get(truck.id) ?? []).length;
      }
    }
    return { truckCount, sendungCount };
  };

  // Gesamt: scope to visible days
  const getRelationSummary = (relationId: string) => {
    const visibleDayStrs = new Set(
      visibleDays.map((d) => d.format("YYYY-MM-DD")),
    );
    const relationTrucks = (trucksByRelation.get(relationId) ?? []).filter(
      (truck) => visibleDayStrs.has(truck.ladedatum),
    );
    let sendungCount = 0;
    let totalKg = 0;
    let totalLdm = 0;
    for (const truck of relationTrucks) {
      const sendungen = truckSendungenMap.get(truck.id) ?? [];
      sendungCount += sendungen.length;
      for (const sendung of sendungen) {
        totalKg += sendung.gewicht ?? 0;
        totalLdm += sendung.lademeter ?? 0;
      }
    }
    return {
      truckCount: relationTrucks.length,
      sendungCount,
      totalKg,
      totalLdm,
    };
  };

  // Gesamt header label
  const gesamtLabel = useMemo(() => {
    if (viewMode === "day") return "Gesamt Tag";
    if (viewMode === "3day") return "Gesamt 3T";
    return "Gesamt KW";
  }, [viewMode]);

  const handleSaveNewRelation = (
    nummer: string,
    name: string,
    farbe: string,
  ) => {
    onCreateRelation(nummer, name, farbe);
    setShowNewRow(false);
  };

  return (
    <div
      className="flex flex-col h-full bg-white rounded-lg overflow-hidden"
      onDragOver={(e) => {
        // Prevent browser default drop zone on the whole page
        e.preventDefault();
        e.dataTransfer.dropEffect = "none";
      }}
    >
      {/* ── Navigation bar ── */}
      <VersandnetzHeader
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        currentDate={currentDate}
        onNavigate={navigate}
        onGoToday={goToday}
        dateLabel={dateLabel}
        weekNum={weekNum}
        now={now}
        relationen={relationen}
        activeRelationIds={activeRelationIds}
        onToggleRelation={toggleRelation}
        filteredRelationenCount={filteredRelationen.length}
        onAddRelationClick={() => setShowNewRow(true)}
        onCreateTruck={onCreateTruck}
      />

      {/* ── New Relation inline form ── */}
      {showNewRow && (
        <NewRelationInlineFormRow
          onSave={handleSaveNewRelation}
          onCancel={() => setShowNewRow(false)}
        />
      )}

      {/* ── Grid ── */}
      <div className="flex-1 overflow-auto">
        <div>
          {isLoading === true ? (
            <VersandnetzLoadingGrid cols={visibleDays.length} />
          ) : (
            <table
              className="w-full border-collapse"
              style={{
                minWidth:
                  viewMode === "day" ? 500 : viewMode === "3day" ? 700 : 1000,
              }}
            >
              <thead className="sticky top-0 z-10">
                <tr>
                  {/* Relation column header */}
                  <th className="w-48 bg-slate-800 p-2.5 text-left border-r border-slate-700">
                    <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                      Relation
                    </span>
                  </th>

                  {/* Day headers */}
                  {visibleDays.map((day) => {
                    const summary = getDaySummary(day);
                    const isToday = day.format("YYYY-MM-DD") === todayStr;
                    return (
                      <th
                        key={day.format("YYYY-MM-DD")}
                        className={`border-r border-slate-700 p-2.5 text-left align-top
                      ${isToday ? "bg-blue-600" : "bg-slate-800"}
                      ${viewMode === "day" ? "min-w-80" : "min-w-36"}`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-[11px] font-bold ${isToday ? "text-white" : "text-slate-200"}`}
                          >
                            {DAY_LABELS[day.day()]}
                          </span>
                          <span
                            className={`text-[11px] font-medium ${isToday ? "text-blue-100" : "text-slate-400"}`}
                          >
                            {day.format("DD.MM.")}
                          </span>
                          {isToday && (
                            <span
                              className="ml-auto flex items-center gap-1 text-[9px] font-semibold bg-white/20 text-white rounded px-1.5 py-0.5"
                              suppressHydrationWarning
                            >
                              <Clock className="h-2.5 w-2.5" />
                              {now.format("HH:mm")}
                            </span>
                          )}
                        </div>
                        {(summary.truckCount > 0 ||
                          summary.sendungCount > 0) && (
                          <div
                            className={`mt-1 flex items-center gap-2 text-[10px] font-normal
                        ${isToday ? "text-blue-200" : "text-slate-500"}`}
                          >
                            <span>{summary.truckCount} LKW</span>
                            <span className="opacity-50">·</span>
                            <span>{summary.sendungCount} S.</span>
                          </div>
                        )}
                      </th>
                    );
                  })}

                  {/* Summary column header */}
                  <th className="w-28 bg-slate-800 p-2.5 text-left border-l border-slate-700">
                    <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                      {gesamtLabel}
                    </span>
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredRelationen.length === 0 && !showNewRow && (
                  <tr>
                    <td
                      colSpan={visibleDays.length + 2}
                      className="p-12 text-center"
                    >
                      <Route className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-sm text-slate-400">
                        {relationen.length === 0
                          ? "Keine Relationen vorhanden"
                          : "Alle Relationen werden gefiltert"}
                      </p>
                      {relationen.length === 0 && (
                        <button
                          onClick={() => setShowNewRow(true)}
                          className="mt-2 text-xs font-medium text-blue-600 hover:text-blue-700"
                        >
                          + Erste Relation erstellen
                        </button>
                      )}
                    </td>
                  </tr>
                )}

                {filteredRelationen.map((relation, idx) => {
                  const accent = relation.farbe || "#155dfc";
                  const summary = getRelationSummary(relation.id);
                  const isEven = idx % 2 === 0;
                  return (
                    <tr
                      key={relation.id}
                      className={`group/row transition-colors
                    ${isEven ? "bg-white" : "bg-slate-50/60"}
                    hover:bg-blue-50/30`}
                    >
                      {/* Relation label */}
                      <td
                        className="border-r border-b border-slate-200/70 p-0 align-top"
                        style={{
                          borderLeftWidth: 4,
                          borderLeftColor: accent,
                        }}
                      >
                        <div className="flex h-full">
                          <div className="flex-1 p-2.5 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <Route
                                className="h-3.5 w-3.5 shrink-0"
                                style={{ color: accent }}
                              />
                              <span className="text-[11px] font-bold text-slate-800 truncate">
                                {relation.nummer}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-500 truncate mt-0.5 pl-5">
                              {relation.name}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Day cells — show truck cards */}
                      {visibleDays.map((day) => (
                        <RelationDayCell
                          key={day.format("YYYY-MM-DD")}
                          trucks={getCellTrucks(relation.id, day)}
                          truckSendungenMap={truckSendungenMap}
                          isToday={day.format("YYYY-MM-DD") === todayStr}
                          onDropSendung={onDropSendung}
                          onUnassignSendung={onUnassignSendung}
                          onTruckClick={onTruckClick}
                        />
                      ))}

                      {/* Relation summary — scoped to visible days */}
                      <td className="border-l border-b border-slate-200/70 p-2.5 align-top">
                        {summary.truckCount > 0 ? (
                          <div className="space-y-1">
                            <div className="text-[11px] font-bold text-slate-800">
                              {summary.truckCount} LKW
                            </div>
                            <div className="text-[10px] text-slate-500">
                              {summary.sendungCount} Sendung
                              {summary.sendungCount !== 1 ? "en" : ""}
                            </div>
                            <div className="flex flex-col gap-0.5">
                              <span className="inline-flex items-center gap-1 text-[10px] text-slate-500">
                                <Weight className="h-2.5 w-2.5" />
                                {summary.totalKg} kg
                              </span>
                              <span className="inline-flex items-center gap-1 text-[10px] text-slate-500">
                                <Ruler className="h-2.5 w-2.5" />
                                {summary.totalLdm} ldm
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-300 italic">
                            Leer
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
