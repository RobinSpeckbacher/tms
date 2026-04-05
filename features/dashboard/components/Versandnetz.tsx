"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
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
  Route,
  Calendar,
  Plus,
  Filter,
  Check,
  Clock,
  AlertTriangle,
} from "lucide-react";
import type { Truck } from "@/hooks/useTrucks";
import type { Relation } from "@/hooks/useRelationen";
import type { SendungRow } from "@/hooks/useSendungen";

dayjs.extend(isoWeek);

/* ── Types ────────────────────────────────────────────────────────── */
type ViewMode = "day" | "3day" | "week";

/* ── Helpers ──────────────────────────────────────────────────────── */
const DAY_LABELS = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];

const PE_SHORT: Record<string, string> = {
  europalette: "EP",
  industriepalette: "IP",
  gitterbox: "GB",
  colli: "Colli",
  sonstige: "Stk",
};

function formatTime(time: string | undefined | null): string {
  if (time == null || time.trim() === "") return "";
  return time.slice(0, 5);
}

const RELATION_COLORS = [
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

const VIEW_LABELS: Record<ViewMode, string> = {
  day: "Tag",
  "3day": "3 Tage",
  week: "Woche",
};

/* ── Capacity helpers ─────────────────────────────────────────────── */
function pct(used: number, max: number) {
  if (!max) return 0;
  return Math.round((used / max) * 100);
}

function barColor(percent: number) {
  if (percent >= 90) return "#ef4444";
  if (percent >= 70) return "#f59e0b";
  return "#22c55e";
}

/* ── Sendung chip (inside a truck card) ──────────────────────────── */
function SendungChip({
  sendung,
  onUnassign,
}: {
  sendung: SendungRow;
  onUnassign: () => void;
}) {
  const pe =
    sendung.packungseinheit != null && sendung.packungseinheit.trim() !== ""
      ? (PE_SHORT[sendung.packungseinheit] ?? null)
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
          {sendung.anzahl != null && pe != null && pe.trim() !== "" && (
            <span className="inline-flex items-center gap-0.5 text-[8px] text-slate-400">
              <Layers className="h-2 w-2" />
              {sendung.anzahl} {pe}
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

/* ── Truck card (calendar-event-style, inside a cell) ────────────── */
function TruckCard({
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
    let usedLdm = 0,
      usedKg = 0,
      usedPal = 0;
    for (const s of sendungen) {
      usedLdm += s.lademeter ?? 0;
      usedKg += s.gewicht ?? 0;
      usedPal += s.anzahl ?? 0;
    }
    const maxLdm = truck.lademeter ?? 0;
    const maxKg = truck.max_gewicht ?? 0;
    const maxPal = truck.max_paletten ?? 0;
    const mainPct = Math.max(
      pct(usedLdm, maxLdm),
      pct(usedKg, maxKg),
      pct(usedPal, maxPal),
    );
    return { mainPct };
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
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = "move";
      }}
      onDragEnter={(e) => {
        e.preventDefault();
        dragCounterRef.current++;
        setIsDragOver(true);
      }}
      onDragLeave={() => {
        dragCounterRef.current--;
        if (dragCounterRef.current === 0) setIsDragOver(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounterRef.current = 0;
        setIsDragOver(false);
        const sendungId = e.dataTransfer.getData("text/plain");
        if (sendungId) onDropSendung(truck.id, sendungId);
      }}
    >
      {/* Truck header */}
      <div className="px-1.5 pt-1.5 pb-1 bg-slate-50/80">
        <div className="flex items-center gap-1">
          <TruckIcon className="h-3 w-3 shrink-0" style={{ color: accent }} />
          <span className="font-bold text-slate-800 truncate">
            {truck.kennzeichen}
          </span>
        </div>
        {/* Time range */}
        <div className="flex items-center gap-0.5 text-[9px] text-slate-400 mt-0.5">
          <Clock className="h-2.5 w-2.5 shrink-0" />
          <span>
            {formatTime(truck.ladezeit) || "08:00"} –{" "}
            {formatTime(truck.entladezeit) || "17:00"}
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

      {/* Capacity bar */}
      {sendungen.length > 0 && capacity.mainPct > 0 && (
        <div className="px-1.5 pb-1 flex items-center gap-1">
          <span className="inline-flex items-center gap-0.5 rounded bg-blue-50 px-1 py-0.5 text-[9px] font-semibold text-blue-600">
            <Package className="h-2.5 w-2.5" />
            {sendungen.length}
          </span>
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
            className="text-[8px] font-semibold tabular-nums"
            style={{ color: barColor(capacity.mainPct) }}
          >
            {capacity.mainPct}%
          </span>
        </div>
      )}

      {/* Overload warning */}
      {capacity.mainPct >= 100 && (
        <div className="px-1.5 pb-1 flex items-center gap-0.5 text-[8px] text-red-600 font-medium">
          <AlertTriangle className="h-2.5 w-2.5 shrink-0" />
          <span>Überladen ({capacity.mainPct}%)</span>
        </div>
      )}

      {/* Sendungen list */}
      {sendungen.length > 0 && (
        <div className="px-1 pb-1 space-y-0.5">
          {sendungen.map((s) => (
            <SendungChip
              key={s.id}
              sendung={s}
              onUnassign={() => onUnassignSendung(s.id)}
            />
          ))}
        </div>
      )}

      {/* Drop hint overlay */}
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

/* ── Cell component (relation × day column) ──────────────────────── */
function NetCell({
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
          <TruckCard
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

/* ── Inline form for creating a new Relation ─────────────────────── */
function NewRelationRow({
  onSave,
  onCancel,
}: {
  onSave: (nummer: string, name: string, farbe: string) => void;
  onCancel: () => void;
}) {
  const [nummer, setNummer] = useState("");
  const [name, setName] = useState("");
  const [farbe, setFarbe] = useState(
    () => RELATION_COLORS[Math.floor(Math.random() * RELATION_COLORS.length)],
  );

  const handleSubmit = () => {
    const trimNummer = nummer.trim();
    const trimName = name.trim();
    if (!trimNummer || !trimName) return;
    onSave(trimNummer, trimName, farbe);
  };

  return (
    <div className="flex items-center gap-2 px-2.5 py-2 border-b border-slate-200/70 bg-blue-50/40">
      <div
        className="w-1 h-8 rounded shrink-0"
        style={{ backgroundColor: farbe }}
      />
      <input
        autoFocus
        placeholder="Nr."
        value={nummer}
        onChange={(e) => setNummer(e.target.value)}
        className="w-16 rounded border border-slate-300 px-1.5 py-1 text-[11px] font-semibold
                   text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
      />
      <input
        placeholder="Name der Relation"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        className="flex-1 rounded border border-slate-300 px-1.5 py-1 text-[11px]
                   text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
      />
      <select
        value={farbe}
        onChange={(e) => setFarbe(e.target.value)}
        className="rounded border border-slate-300 px-1 py-1 text-[11px] text-slate-600
                   focus:outline-none focus:ring-1 focus:ring-blue-400"
        style={{ color: farbe }}
      >
        {RELATION_COLORS.map((c) => (
          <option key={c} value={c} style={{ color: c }}>
            ■ {c}
          </option>
        ))}
      </select>
      <button
        onClick={handleSubmit}
        disabled={!nummer.trim() || !name.trim()}
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

/* ── Filter dropdown for relations ────────────────────────────────── */
function RelationFilter({
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
            {relationen.map((r) => (
              <button
                key={r.id}
                onClick={() => onToggle(r.id)}
                className="flex items-center gap-2 w-full px-3 py-1.5 text-[11px] hover:bg-slate-50 transition-colors"
              >
                <div
                  className="w-2.5 h-2.5 rounded-sm shrink-0"
                  style={{ backgroundColor: r.farbe || "#155dfc" }}
                />
                <span className="flex-1 text-left text-slate-700 truncate">
                  {r.nummer} {r.name}
                </span>
                {activeIds.has(r.id) && (
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

/* ── Grid skeleton (loading state) ────────────────────────────────── */
function GridSkeleton({ cols }: { cols: number }) {
  return (
    <div className="p-4 space-y-3">
      {/* Header skeleton */}
      <div className="flex gap-2">
        <div className="w-48 h-10 rounded-md bg-slate-200/60 animate-pulse shrink-0" />
        {Array.from({ length: cols }).map((_, i) => (
          <div
            key={i}
            className="flex-1 h-10 rounded-md bg-slate-200/50 animate-pulse"
          />
        ))}
        <div className="w-28 h-10 rounded-md bg-slate-200/40 animate-pulse shrink-0" />
      </div>
      {/* Row skeletons */}
      {Array.from({ length: 5 }).map((_, r) => (
        <div key={r} className="flex gap-2">
          <div className="w-48 h-16 rounded-md bg-slate-100 animate-pulse shrink-0" />
          {Array.from({ length: cols }).map((_, c) => (
            <div
              key={c}
              className="flex-1 h-16 rounded-md bg-slate-50 animate-pulse"
              style={{ animationDelay: `${(r * cols + c) * 75}ms` }}
            />
          ))}
          <div className="w-28 h-16 rounded-md bg-slate-50 animate-pulse shrink-0" />
        </div>
      ))}
    </div>
  );
}

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
          .filter((r) => !disabledRelationIds.has(r.id))
          .map((r) => r.id),
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
    () => relationen.filter((r) => activeRelationIds.has(r.id)),
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
    for (const r of relationen) map.set(r.id, []);
    for (const t of trucks) {
      if (t.relation_id != null && t.relation_id.trim() !== "") {
        const list = map.get(t.relation_id);
        if (list) list.push(t);
      }
    }
    return map;
  }, [relationen, trucks]);

  // Get trucks for a specific relation + day
  const getCellTrucks = (relationId: string, day: Dayjs) => {
    const dayStr = day.format("YYYY-MM-DD");
    const relationTrucks = trucksByRelation.get(relationId) ?? [];
    return relationTrucks.filter((t) => t.ladedatum === dayStr);
  };

  const getDaySummary = (day: Dayjs) => {
    const dayStr = day.format("YYYY-MM-DD");
    let truckCount = 0;
    let sendungCount = 0;
    for (const t of trucks) {
      if (
        t.ladedatum === dayStr &&
        t.relation_id != null &&
        t.relation_id.trim() !== "" &&
        activeRelationIds.has(t.relation_id)
      ) {
        truckCount++;
        sendungCount += (truckSendungenMap.get(t.id) ?? []).length;
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
      (t) => visibleDayStrs.has(t.ladedatum),
    );
    let sendungCount = 0;
    let totalKg = 0;
    let totalLdm = 0;
    for (const t of relationTrucks) {
      const sendungen = truckSendungenMap.get(t.id) ?? [];
      sendungCount += sendungen.length;
      for (const s of sendungen) {
        totalKg += s.gewicht ?? 0;
        totalLdm += s.lademeter ?? 0;
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
      <div className="flex items-center gap-3 px-4 h-11 bg-white border-b border-slate-200 shrink-0">
        {/* Nav arrows */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => navigate(1)}
            className="p-1.5 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Date label — fixed width to prevent layout jumps */}
        <div className="flex items-center gap-2 w-64 shrink-0">
          <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
          <span className="text-sm font-semibold text-slate-800 truncate transition-opacity duration-100">
            {dateLabel}
          </span>
          <span
            className="text-[10px] font-medium text-slate-400 bg-slate-100 rounded px-1.5 py-0.5 shrink-0 transition-opacity duration-100"
            style={{
              opacity: viewMode === "week" ? 1 : 0,
              pointerEvents: viewMode === "week" ? "auto" : "none",
            }}
          >
            KW {weekNum}
          </span>
        </div>

        <button
          onClick={goToday}
          className="text-[11px] font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100
                     rounded-md px-2.5 py-1 transition-colors shrink-0"
        >
          Heute
        </button>

        {/* Current time */}
        <div className="flex items-center gap-1 text-[11px] text-slate-400 shrink-0">
          <Clock className="h-3 w-3" />
          <span className="font-mono font-medium" suppressHydrationWarning>
            {now.format("HH:mm")}
          </span>
        </div>

        {/* View switcher */}
        <div className="flex rounded-md border border-slate-200 overflow-hidden text-[11px] ml-2 shrink-0">
          {(["day", "3day", "week"] as ViewMode[]).map((v) => (
            <button
              key={v}
              onClick={() => setViewMode(v)}
              className={`px-2.5 py-1 font-medium transition-colors
                ${
                  viewMode === v
                    ? "bg-blue-600 text-white"
                    : "text-slate-500 hover:bg-slate-50"
                }`}
            >
              {VIEW_LABELS[v]}
            </button>
          ))}
        </div>

        {/* Right side: filter, relation count, buttons */}
        <div className="ml-auto flex items-center gap-2">
          {relationen.length > 0 && (
            <RelationFilter
              relationen={relationen}
              activeIds={activeRelationIds}
              onToggle={toggleRelation}
            />
          )}

          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <Route className="h-3.5 w-3.5" />
            <span>{filteredRelationen.length} Relationen</span>
          </div>

          <button
            onClick={() => setShowNewRow(true)}
            className="flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-[11px]
                       font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <Plus className="h-3 w-3" />
            Relation
          </button>

          <button
            onClick={onCreateTruck}
            className="flex items-center gap-1 rounded-md bg-blue-600 px-2.5 py-1 text-[11px]
                       font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-3 w-3" />
            Neuer LKW
          </button>
        </div>
      </div>

      {/* ── New Relation inline form ── */}
      {showNewRow && (
        <NewRelationRow
          onSave={handleSaveNewRelation}
          onCancel={() => setShowNewRow(false)}
        />
      )}

      {/* ── Grid ── */}
      <div className="flex-1 overflow-auto">
        <div>
          {isLoading === true ? (
            <GridSkeleton cols={visibleDays.length} />
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
                        <NetCell
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
