"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import dayjs from "dayjs";
import { motion, AnimatePresence } from "motion/react";
import Versandnetz from "./components/Versandnetz";
import ShipmentsTable from "./components/ShipmentsTable";
import type { EnrichedSendung } from "./components/ShipmentsTable";
import ShipmentForm from "./components/ShipmentForm";
import SendungDetailModal from "./components/SendungDetailModal";
import TruckDetailPanel from "./components/TruckDetailPanel";
import TruckForm from "./components/TruckForm";
import type { CalendarEvent } from "@ilamy/calendar";
import {
  Package,
  Plus,
  MoreVertical,
  MapPin,
  ArrowRight,
  CalendarDays,
  LayoutGrid,
  List,
} from "lucide-react";
import Button from "@mui/joy/Button";
import Tooltip from "@mui/joy/Tooltip";
import { useDialog } from "@/hooks/useDialog";
import { useTrucks } from "@/hooks/useTrucks";
import { useSendungen, type SendungRow } from "@/hooks/useSendungen";
import {
  useTruckSendungen,
  useAssignSendung,
  useUnassignSendung,
} from "@/hooks/useTruckSendungen";
import { useRelationen, useCreateRelation } from "@/hooks/useRelationen";
import { useUser } from "@clerk/nextjs";
import { toast } from "react-toastify";

function formatDateTime(date: string, time?: string | null) {
  const dateLabel = dayjs(date).format("DD.MM.YYYY");
  const timeLabel = time ? ` ${time.slice(0, 5)}` : "";
  return `${dateLabel}${timeLabel}`;
}

function formatAddressLine(
  plz?: string | null,
  ort?: string | null,
  land?: string | null,
) {
  return [plz, ort, land].filter(Boolean).join(" ");
}

function initials(name: string) {
  const parts = name
    .split(" ")
    .map((p) => p.trim())
    .filter(Boolean)
    .slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "U";
}

/* ── ISO calendar week (no dayjs plugin needed) ──────────────────── */
function getISOWeek(dateStr: string): number {
  const date = new Date(dateStr);
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

/* ── Shipment Card ───────────────────────────────────────────────── */
function ShipmentCard({
  sendung,
  onEdit,
  fallbackCreatorName,
  fallbackCreatorAvatarUrl,
}: {
  sendung: SendungRow;
  onEdit: () => void;
  fallbackCreatorName?: string | null;
  fallbackCreatorAvatarUrl?: string | null;
}) {
  const creatorName =
    (sendung as SendungRow & { created_by_name?: string | null })
      .created_by_name ?? null;
  const creatorAvatarUrl =
    (sendung as SendungRow & { created_by_avatar_url?: string | null })
      .created_by_avatar_url ?? null;
  const resolvedCreatorName = creatorName ?? fallbackCreatorName ?? "-";
  const resolvedCreatorAvatarUrl = creatorAvatarUrl ?? fallbackCreatorAvatarUrl;

  return (
    <div
      className="group relative flex overflow-hidden rounded-xl border border-[#0f172b]/10 bg-white
                 cursor-grab active:cursor-grabbing hover:border-[#155dfc]/40 hover:shadow-md
                 active:scale-[1.01] transition-all"
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", sendung.id);
        e.dataTransfer.effectAllowed = "move";
      }}
    >
      {/* Left accent strip */}
      <div className="w-1.5 shrink-0 bg-[#155dfc]" />

      {/* Card body */}
      <div className="flex-1 min-w-0 flex flex-col px-3 pt-2 pb-1.5 gap-1.5">
        {/* Row 1: Status + reference + edit */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="inline-flex text-[10px] font-semibold uppercase tracking-wide text-[#155dfc] bg-[#155dfc]/8 px-1.5 py-0.5 rounded">
                {sendung.status}
              </span>
              <span className="text-[11px] font-semibold text-[#64748b] truncate">
                {sendung.referenz}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            onMouseDown={(e) => e.stopPropagation()}
            draggable={false}
            aria-label="Sendung bearbeiten"
            className="shrink-0 rounded-md p-1 text-[#57688e] opacity-100
                       hover:bg-[#155dfc]/10 hover:text-[#155dfc] transition-all"
            title="Bearbeiten"
          >
            <MoreVertical className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Row 2: Route in one line */}
        <div className="flex flex-col gap-0.5">
          <span className="text-[9px] font-semibold uppercase tracking-wider text-[#94a3b8]">
            Strecke
          </span>
          <div className="flex items-center gap-1 text-xs text-[#0f172b]">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-green-600" />
            <span className="font-medium truncate max-w-24">
              {sendung.lade_ort}
            </span>
            <ArrowRight className="h-3.5 w-3.5 shrink-0 text-[#94a3b8]" />
            <MapPin className="h-3.5 w-3.5 shrink-0 text-red-500" />
            <span className="font-medium truncate">{sendung.entlade_ort}</span>
          </div>
        </div>

        {/* Row 3: compact stop details */}
        <div className="space-y-0.5">
          <p className="text-[11px] text-[#57688e] truncate">
            A: {sendung.lade_adresse ? `${sendung.lade_adresse}, ` : ""}
            {formatAddressLine(
              sendung.lade_plz,
              sendung.lade_ort,
              sendung.lade_land,
            ) || "-"}
          </p>
          <p className="text-[11px] text-[#57688e] truncate">
            Z: {sendung.entlade_adresse ? `${sendung.entlade_adresse}, ` : ""}
            {formatAddressLine(
              sendung.entlade_plz,
              sendung.entlade_ort,
              sendung.entlade_land,
            ) || "-"}
          </p>
        </div>

        {/* Row 4: Time window + meta */}
        <div className="mt-0.5 rounded-md border border-[#0f172b]/5 bg-[#f8f9fb] px-2 py-1">
          <div className="flex items-center justify-between gap-2 text-[11px] text-[#334155]">
            <div className="min-w-0 space-y-1">
              <div className="flex items-center gap-1.5 min-w-0">
                <CalendarDays className="h-3.5 w-3.5 shrink-0 text-[#57688e]" />
                <p className="truncate">
                  Ladung: {formatDateTime(sendung.ladedatum, sendung.ladezeit)}
                </p>
              </div>
              <div className="flex items-center gap-1.5 min-w-0">
                <CalendarDays className="h-3.5 w-3.5 shrink-0 text-[#57688e]" />
                <p className="truncate">
                  Entladung:{" "}
                  {formatDateTime(sendung.entladedatum, sendung.entladezeit)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <Tooltip title={resolvedCreatorName} variant="soft" size="sm">
                <span className="inline-flex">
                  {resolvedCreatorAvatarUrl ? (
                    <Image
                      src={resolvedCreatorAvatarUrl}
                      alt={resolvedCreatorName}
                      width={24}
                      height={24}
                      className="h-6 w-6 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#155dfc]/15 text-[10px] font-semibold text-[#155dfc]">
                      {initials(resolvedCreatorName)}
                    </div>
                  )}
                </span>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DashboardView() {
  const { user } = useUser();
  const firstLastName = [user?.firstName, user?.lastName]
    .filter((value): value is string => Boolean(value))
    .join(" ");
  const viewerDisplayName =
    user?.fullName ??
    (firstLastName || null) ??
    user?.username ??
    user?.primaryEmailAddress?.emailAddress ??
    null;
  const viewerAvatarUrl = user?.imageUrl ?? null;
  const { data: sendungen = [], isLoading: sendungenLoading } = useSendungen();
  const offeneSendungen = useMemo(
    () => sendungen.filter((s) => s.status === "offen"),
    [sendungen],
  );
  const [mainView, setMainView] = useState<"versandnetz" | "sendungen">(
    "versandnetz",
  );
  const [selectedKW, setSelectedKW] = useState<number | "all">(
    getISOWeek(new Date().toISOString()),
  );
  const availableKWs = useMemo(() => {
    const weeks = new Set(offeneSendungen.map((s) => getISOWeek(s.ladedatum)));
    return Array.from(weeks).sort((a, b) => a - b);
  }, [offeneSendungen]);
  const filteredSendungen = useMemo(() => {
    if (selectedKW === "all") return offeneSendungen;
    return offeneSendungen.filter(
      (s) => getISOWeek(s.ladedatum) === selectedKW,
    );
  }, [offeneSendungen, selectedKW]);
  const shipmentDialog = useDialog<SendungRow>();
  const sendungDetailDialog = useDialog<EnrichedSendung>();
  const [detailTruckId, setDetailTruckId] = useState<string | null>(null);
  const [truckFormOpen, setTruckFormOpen] = useState(false);
  const [editTruckEvent, setEditTruckEvent] = useState<CalendarEvent | null>(
    null,
  );
  const { data: trucks = [], isLoading: trucksLoading } = useTrucks();
  const { data: truckSendungen = [] } = useTruckSendungen();
  const assignSendung = useAssignSendung();
  const unassignSendung = useUnassignSendung();
  const { data: relationen = [], isLoading: relationenLoading } =
    useRelationen();
  const createRelation = useCreateRelation();

  // Pre-index for O(1) lookups in derived memos
  const sendungenById = useMemo(
    () => new Map(sendungen.map((s) => [s.id, s])),
    [sendungen],
  );
  const trucksById = useMemo(
    () => new Map(trucks.map((t) => [t.id, t])),
    [trucks],
  );
  const assignmentBySendungId = useMemo(
    () => new Map(truckSendungen.map((ts) => [ts.sendung_id, ts])),
    [truckSendungen],
  );

  // Map truckId → assigned SendungRows for Calendar
  const truckSendungenMap = useMemo(() => {
    const map = new Map<string, SendungRow[]>();
    for (const ts of truckSendungen) {
      const sendung = sendungenById.get(ts.sendung_id);
      if (!sendung) continue;
      const list = map.get(ts.truck_id) ?? [];
      list.push(sendung);
      map.set(ts.truck_id, list);
    }
    return map;
  }, [truckSendungen, sendungenById]);

  // ── Enriched sendungen (with Frächter & EK from truck assignment) ──────
  const enrichedSendungen = useMemo<EnrichedSendung[]>(() => {
    return sendungen.map((s) => {
      const assignment = assignmentBySendungId.get(s.id);
      const truck = assignment
        ? (trucksById.get(assignment.truck_id) ?? null)
        : null;
      return {
        ...s,
        fraechter_name: truck?.fraechter?.name ?? null,
        einkaufspreis: truck?.kosten ?? null,
      };
    });
  }, [sendungen, assignmentBySendungId, trucksById]);

  // ── Derived state ─────────────────────────────────────────────────────
  const isDataLoading = trucksLoading || relationenLoading;

  // ── Handlers ──────────────────────────────────────────────────────────

  const handleDropSendung = (truckId: string, sendungId: string) => {
    assignSendung.mutate(
      { truckId, sendungId },
      {
        onSuccess: () => toast.success("Sendung zugewiesen"),
        onError: () => toast.error("Fehler beim Zuweisen"),
      },
    );
  };

  const handleUnassignSendung = (sendungId: string) => {
    unassignSendung.mutate(sendungId, {
      onSuccess: () => toast.success("Zuweisung entfernt"),
      onError: () => toast.error("Fehler beim Entfernen"),
    });
  };

  const handleTruckClick = (truckId: string) => {
    setDetailTruckId(truckId);
  };

  const handleCreateRelation = (
    nummer: string,
    name: string,
    farbe: string,
  ) => {
    createRelation.mutate(
      { nummer, name, farbe },
      {
        onSuccess: () => toast.success("Relation erstellt"),
        onError: () => toast.error("Fehler beim Erstellen"),
      },
    );
  };

  const handleCreateTruck = () => {
    setTruckFormOpen(true);
    setEditTruckEvent(null);
  };

  const detailTruck = detailTruckId
    ? (trucks.find((t) => t.id === detailTruckId) ?? null)
    : null;
  const detailSendungen = detailTruckId
    ? (truckSendungenMap.get(detailTruckId) ?? [])
    : [];

  return (
    <>
      <div className="flex h-full flex-col overflow-hidden pr-2">
        {/* ── View Toggle (stays fixed) ── */}
        <div className="flex items-center gap-3 shrink-0 pb-4">
          <div className="flex rounded-md border border-[#0f172b]/15 overflow-hidden text-xs">
            <button
              onClick={() => setMainView("versandnetz")}
              className={`flex items-center gap-1.5 px-3 py-1.5 font-medium transition-colors ${
                mainView === "versandnetz"
                  ? "bg-[#155dfc] text-white"
                  : "text-[#57688e] hover:bg-[#155dfc]/10"
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              Versandnetz
            </button>
            <button
              onClick={() => setMainView("sendungen")}
              className={`flex items-center gap-1.5 px-3 py-1.5 font-medium transition-colors ${
                mainView === "sendungen"
                  ? "bg-[#155dfc] text-white"
                  : "text-[#57688e] hover:bg-[#155dfc]/10"
              }`}
            >
              <List className="h-3.5 w-3.5" />
              Sendungen
            </button>
          </div>
        </div>

        {/* ── Content area (fixed height, only this swaps) ── */}
        <div className="flex-1 min-h-0 relative">
          <AnimatePresence mode="wait">
            {mainView === "versandnetz" ? (
              /* ── Versandnetz + Sendeaufträge panel ── */
              <motion.div
                key="versandnetz"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15, ease: "easeInOut" }}
                className="flex flex-col h-full rounded-md border border-[#0f172b]/10 overflow-hidden"
              >
                {/* Sendeaufträge panel */}
                <section className="shrink-0 border-b border-[#0f172b]/10 bg-[#f8f9fb] flex flex-col">
                  {/* Header row */}
                  <div
                    className={`flex items-center gap-2 px-3 h-11 shrink-0 ${sendungenLoading || offeneSendungen.length > 0 ? "border-b border-[#0f172b]/10" : ""}`}
                  >
                    <Package className="h-4 w-4 text-[#155dfc]" />
                    <h3 className="text-sm font-semibold text-[#0f172b]">
                      Sendeaufträge
                    </h3>

                    {/* Inline empty state OR KW pills */}
                    {!sendungenLoading && offeneSendungen.length === 0 ? (
                      <span className="text-xs text-[#57688e] ml-2">
                        Keine offenen Aufträge
                      </span>
                    ) : (
                      <div className="flex items-center gap-1 ml-3">
                        {availableKWs.map((kw) => (
                          <button
                            key={kw}
                            onClick={() => setSelectedKW(kw)}
                            className={`text-[11px] font-medium px-2 py-0.5 rounded transition-colors ${
                              selectedKW === kw
                                ? "bg-[#155dfc] text-white"
                                : "text-[#57688e] hover:bg-[#155dfc]/10"
                            }`}
                          >
                            KW {kw}
                          </button>
                        ))}
                        <button
                          onClick={() => setSelectedKW("all")}
                          className={`text-[11px] font-medium px-2 py-0.5 rounded transition-colors ${
                            selectedKW === "all"
                              ? "bg-[#155dfc] text-white"
                              : "text-[#57688e] hover:bg-[#155dfc]/10"
                          }`}
                        >
                          Alle
                        </button>
                      </div>
                    )}

                    <Button
                      size="sm"
                      variant="plain"
                      startDecorator={<Plus className="h-3 w-3" />}
                      onClick={() => shipmentDialog.onOpen()}
                      sx={{
                        ml: "auto",
                        fontSize: "0.7rem",
                        color: "#57688e",
                        minHeight: 0,
                        px: 0.75,
                        py: 0.25,
                      }}
                    >
                      Neuer Auftrag
                    </Button>
                  </div>

                  {/* Card strip — only when loading or there are open shipments */}
                  {(sendungenLoading || offeneSendungen.length > 0) && (
                    <div className="overflow-x-auto flex flex-row gap-2 p-2 h-56">
                      {sendungenLoading ? (
                        <div className="flex gap-2">
                          {Array.from({ length: 4 }).map((_, i) => (
                            <div
                              key={i}
                              className="w-64 shrink-0 rounded-lg border border-[#0f172b]/5 bg-white p-2.5 animate-pulse"
                            >
                              <div className="h-3 w-24 bg-slate-200 rounded mb-2" />
                              <div className="h-2.5 w-full bg-slate-100 rounded mb-1.5" />
                              <div className="h-2.5 w-3/4 bg-slate-100 rounded mb-1.5" />
                              <div className="flex gap-1.5 mt-2">
                                <div className="h-4 w-12 bg-slate-100 rounded" />
                                <div className="h-4 w-14 bg-slate-100 rounded" />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : filteredSendungen.length === 0 ? (
                        <div className="flex items-center justify-center w-full">
                          <p className="text-xs text-[#57688e]">
                            Keine Aufträge in KW {selectedKW}
                          </p>
                        </div>
                      ) : (
                        filteredSendungen.map((s, i) => (
                          <motion.div
                            key={s.id}
                            className="w-64 shrink-0"
                            initial={{ opacity: 0, x: 8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.2, delay: i * 0.03 }}
                          >
                            <ShipmentCard
                              sendung={s}
                              onEdit={() => shipmentDialog.onOpen(s)}
                              fallbackCreatorName={viewerDisplayName}
                              fallbackCreatorAvatarUrl={viewerAvatarUrl}
                            />
                          </motion.div>
                        ))
                      )}
                    </div>
                  )}
                </section>

                {/* Main view: Versandnetz */}
                <div className="flex-1 min-h-0">
                  <Versandnetz
                    relationen={relationen}
                    trucks={trucks}
                    truckSendungenMap={truckSendungenMap}
                    onDropSendung={handleDropSendung}
                    onUnassignSendung={handleUnassignSendung}
                    onCreateRelation={handleCreateRelation}
                    onCreateTruck={handleCreateTruck}
                    onTruckClick={handleTruckClick}
                    isLoading={isDataLoading}
                  />
                </div>
              </motion.div>
            ) : (
              /* ── Sendungen table view ── */
              <motion.div
                key="sendungen"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15, ease: "easeInOut" }}
                className="flex h-full rounded-md border border-[#0f172b]/10 overflow-hidden"
              >
                <ShipmentsTable
                  sendungen={enrichedSendungen}
                  onRowClick={(s) => sendungDetailDialog.onOpen(s)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <ShipmentForm
        key={shipmentDialog.data?.id ?? "new"}
        open={shipmentDialog.open}
        onClose={shipmentDialog.onClose}
        sendung={shipmentDialog.data}
      />

      <SendungDetailModal
        open={sendungDetailDialog.open}
        onClose={sendungDetailDialog.onClose}
        sendung={sendungDetailDialog.data}
        onEdit={(s) => {
          sendungDetailDialog.onClose();
          shipmentDialog.onOpen(s);
        }}
      />

      <TruckDetailPanel
        truck={detailTruck}
        sendungen={detailSendungen}
        open={detailTruckId !== null}
        onClose={() => setDetailTruckId(null)}
        onEditTruck={(truck) => {
          // Build a CalendarEvent-like object for TruckForm
          const start = dayjs(
            `${truck.ladedatum}T${truck.ladezeit || "08:00"}:00`,
          );
          const end = start.add(2, "hour");
          const truckCalendarEvent = {
            id: `truck-${truck.id}`,
            title: truck.kennzeichen,
            description: truck.fahrer || "",
            start,
            end,
            allDay: false,
            backgroundColor: truck.farbe || "#155dfc",
            color: "#fff",
            truckId: truck.id,
            truckData: truck,
          } as unknown as CalendarEvent;
          setDetailTruckId(null);
          setEditTruckEvent(truckCalendarEvent);
          setTruckFormOpen(true);
        }}
        onUnassignSendung={handleUnassignSendung}
        onEditSendung={(s) => {
          setDetailTruckId(null);
          shipmentDialog.onOpen(s);
        }}
        onDropSendung={handleDropSendung}
      />

      <TruckForm
        open={truckFormOpen}
        selectedEvent={editTruckEvent}
        onClose={() => {
          setTruckFormOpen(false);
          setEditTruckEvent(null);
        }}
        onAdd={() => {
          setTruckFormOpen(false);
          setEditTruckEvent(null);
        }}
        onUpdate={() => {
          setTruckFormOpen(false);
          setEditTruckEvent(null);
        }}
      />
    </>
  );
}
