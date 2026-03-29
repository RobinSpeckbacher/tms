"use client";

import { useState, useMemo } from "react";
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
  SquarePen,
  MapPin,
  CalendarDays,
  Weight,
  Layers,
  LayoutGrid,
  List,
} from "lucide-react";
import Button from "@mui/joy/Button";
import { useDialog } from "@/hooks/useDialog";
import { useTrucks } from "@/hooks/useTrucks";
import { useSendungen, type SendungRow } from "@/hooks/useSendungen";
import {
  useTruckSendungen,
  useAssignSendung,
  useUnassignSendung,
} from "@/hooks/useTruckSendungen";
import { useRelationen, useCreateRelation } from "@/hooks/useRelationen";
import { toast } from "react-toastify";

/* ── Packungseinheit abbreviations ────────────────────────────────── */
const PE_LABELS: Record<string, string> = {
  europalette: "EP",
  industriepalette: "IP",
  gitterbox: "GB",
  colli: "Colli",
  sonstige: "Stk",
};

function formatWeight(kg: number) {
  return kg >= 1000
    ? `${(kg / 1000).toFixed(kg % 1000 === 0 ? 0 : 1)}t`
    : `${kg} kg`;
}

function formatShortDate(d: string) {
  return dayjs(d).format("DD.MM.");
}

/* ── Shipment Card (truck-inspired) ──────────────────────────────── */
function ShipmentCard({
  sendung,
  onEdit,
}: {
  sendung: SendungRow;
  onEdit: () => void;
}) {
  const pe = sendung.packungseinheit
    ? (PE_LABELS[sendung.packungseinheit] ?? sendung.packungseinheit)
    : null;
  const hasMetrics = sendung.gewicht || sendung.anzahl || sendung.lademeter;

  return (
    <div
      className="group relative flex overflow-hidden rounded-lg border border-[#0f172b]/10 bg-white
                 cursor-grab active:cursor-grabbing hover:border-[#155dfc]/40 hover:shadow-md active:shadow-lg
                 active:scale-[1.02] transition-all"
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", sendung.id);
        e.dataTransfer.effectAllowed = "move";
      }}
    >
      {/* ── Left accent strip ── */}
      <div className="w-1.5 shrink-0 bg-[#155dfc]/15 group-hover:bg-[#155dfc]/30 transition-colors" />

      {/* ── Card body ── */}
      <div className="flex-1 min-w-0 px-2.5 py-2">
        {/* Row 1: Referenz + edit */}
        <div className="flex items-start gap-1">
          <p className="flex-1 text-xs font-semibold text-[#0f172b] truncate leading-tight">
            {sendung.referenz}
          </p>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            onMouseDown={(e) => e.stopPropagation()}
            draggable={false}
            className="shrink-0 rounded p-0.5 text-[#57688e] opacity-0 group-hover:opacity-100
                       hover:bg-[#155dfc]/10 hover:text-[#155dfc] transition-all"
            title="Bearbeiten"
          >
            <SquarePen className="h-3 w-3" />
          </button>
        </div>

        {/* Row 2: Route */}
        <div className="mt-1 flex items-center gap-1 text-[11px] text-[#57688e]">
          <MapPin className="h-3 w-3 shrink-0 text-green-500" />
          <span className="truncate">{sendung.lade_ort}</span>
          <span className="text-[#0f172b]/25 mx-0.5">→</span>
          <MapPin className="h-3 w-3 shrink-0 text-red-500" />
          <span className="truncate">{sendung.entlade_ort}</span>
        </div>

        {/* Row 3: Dates */}
        <div className="mt-1 flex items-center gap-1 text-[11px] text-[#57688e]">
          <CalendarDays className="h-3 w-3 shrink-0" />
          <span>
            {formatShortDate(sendung.ladedatum)}
            {sendung.ladezeit ? ` ${sendung.ladezeit.slice(0, 5)}` : ""}
            {" – "}
            {formatShortDate(sendung.entladedatum)}
            {sendung.entladezeit ? ` ${sendung.entladezeit.slice(0, 5)}` : ""}
          </span>
        </div>

        {/* Row 4: Metrics chips */}
        {hasMetrics && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {sendung.gewicht != null && (
              <span className="inline-flex items-center gap-0.5 rounded bg-[#f1f5f9] px-1.5 py-0.5 text-[10px] font-medium text-[#475569]">
                <Weight className="h-2.5 w-2.5" />
                {formatWeight(sendung.gewicht)}
              </span>
            )}
            {sendung.anzahl != null && pe && (
              <span className="inline-flex items-center gap-0.5 rounded bg-[#f1f5f9] px-1.5 py-0.5 text-[10px] font-medium text-[#475569]">
                <Layers className="h-2.5 w-2.5" />
                {sendung.anzahl} {pe}
              </span>
            )}
            {sendung.lademeter != null && (
              <span className="inline-flex items-center rounded bg-[#f1f5f9] px-1.5 py-0.5 text-[10px] font-medium text-[#475569]">
                {sendung.lademeter} ldm
              </span>
            )}
          </div>
        )}

        {/* Row 5: Kunde */}
        {sendung.kunde && (
          <p className="mt-1 truncate text-[10px] text-[#94a3b8]">
            {sendung.kunde.name}
          </p>
        )}
      </div>
    </div>
  );
}

export function DashboardView() {
  const { data: sendungen = [], isLoading: sendungenLoading } = useSendungen();
  const offeneSendungen = useMemo(
    () => sendungen.filter((s) => s.status === "offen"),
    [sendungen],
  );
  const [mainView, setMainView] = useState<"versandnetz" | "sendungen">(
    "versandnetz",
  );
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
  const { data: relationen = [], isLoading: relationenLoading } = useRelationen();
  const createRelation = useCreateRelation();

  // Map truckId → assigned SendungRows for Calendar
  const truckSendungenMap = useMemo(() => {
    const map = new Map<string, SendungRow[]>();
    for (const ts of truckSendungen) {
      const sendung = sendungen.find((s) => s.id === ts.sendung_id);
      if (!sendung) continue;
      const list = map.get(ts.truck_id) ?? [];
      list.push(sendung);
      map.set(ts.truck_id, list);
    }
    return map;
  }, [truckSendungen, sendungen]);

  // ── Enriched sendungen (with Frächter & EK from truck assignment) ──────
  const enrichedSendungen = useMemo<EnrichedSendung[]>(() => {
    return sendungen.map((s) => {
      const assignment = truckSendungen.find((ts) => ts.sendung_id === s.id);
      const truck = assignment
        ? trucks.find((t) => t.id === assignment.truck_id)
        : null;
      return {
        ...s,
        fraechter_name: truck?.fraechter?.name ?? null,
        einkaufspreis: truck?.kosten ?? null,
      };
    });
  }, [sendungen, truckSendungen, trucks]);

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
            className="flex h-full rounded-md border border-[#0f172b]/10 overflow-hidden"
          >
            {/* Sendeaufträge panel */}
            <aside className="w-64 shrink-0 border-r border-[#0f172b]/10 bg-[#f8f9fb] flex flex-col">
              <div className="flex items-center gap-2 px-3 h-11 shrink-0 border-b border-[#0f172b]/10">
                <Package className="h-4 w-4 text-[#155dfc]" />
                <h3 className="text-sm font-semibold text-[#0f172b]">
                  Sendeaufträge
                </h3>
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
              <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
                {sendungenLoading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div
                        key={i}
                        className="rounded-lg border border-[#0f172b]/5 bg-white p-2.5 animate-pulse"
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
                ) : offeneSendungen.length === 0 ? (
                  <p className="text-xs text-[#57688e] text-center pt-8">
                    Keine offenen Aufträge
                  </p>
                ) : (
                  offeneSendungen.map((s, i) => (
                    <motion.div
                      key={s.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: i * 0.03 }}
                    >
                      <ShipmentCard
                        sendung={s}
                        onEdit={() => shipmentDialog.onOpen(s)}
                      />
                    </motion.div>
                  ))
                )}
              </div>
            </aside>

            {/* Main view: Versandnetz */}
            <div className="flex-1 min-w-0 h-full">
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
          const evt = {
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
          setEditTruckEvent(evt);
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
