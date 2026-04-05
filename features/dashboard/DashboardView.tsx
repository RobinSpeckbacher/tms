"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import dayjs from "dayjs";
import { motion, AnimatePresence } from "motion/react";
import Versandnetz from "./components/Versandnetz";
import ShipmentsTable from "./components/ShipmentsTable";
import type { EnrichedSendung } from "./components/ShipmentsTable";
import ShipmentForm from "./components/ShipmentForm";
import SendungDetailModal from "./components/SendungDetailModal";
import TruckDetailPanel from "./components/TruckDetailPanel";
import TruckForm from "./components/TruckForm";
import VorlagenSlideOver from "./components/VorlagenSlideOver";
import { OpenShipmentCard } from "./dashboard-view/OpenShipmentCard";
import { DashboardShipmentsPanelHeader } from "./dashboard-view/DashboardShipmentsPanelHeader";
import { DashboardSelectionToolbar } from "./dashboard-view/DashboardSelectionToolbar";
import type { CalendarEvent } from "@ilamy/calendar";
import { LayoutGrid, List, TriangleAlert } from "lucide-react";
import Button from "@mui/joy/Button";
import { useDialog } from "@/hooks/useDialog";
import { useTrucks } from "@/hooks/useTrucks";
import {
  useSendungen,
  useCancelSendung,
  useBulkCancelSendungen,
  type SendungRow,
} from "@/hooks/useSendungen";
import {
  useTruckSendungen,
  useAssignSendung,
  useUnassignSendung,
} from "@/hooks/useTruckSendungen";
import { useRelationen, useCreateRelation } from "@/hooks/useRelationen";
import {
  useVorlagen,
  useGenerateRecurringSendungen,
} from "@/hooks/useVorlagen";
import {
  useTruckVorlagen,
  useGenerateRecurringTrucksWithShipments,
} from "@/hooks/useTruckVorlagen";
import { useUser } from "@clerk/nextjs";
import { toast } from "react-toastify";

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
  const cancelSendung = useCancelSendung();
  const bulkCancelSendungen = useBulkCancelSendungen();
  const offeneSendungen = useMemo(
    () => sendungen.filter((sendung) => sendung.status === "offen"),
    [sendungen],
  );
  const [selectedOffeneSendungIds, setSelectedOffeneSendungIds] = useState<
    string[]
  >([]);
  const [confirmSingleCancel, setConfirmSingleCancel] = useState<{
    id: string;
    referenz: string;
  } | null>(null);
  const [mainView, setMainView] = useState<"versandnetz" | "sendungen">(
    "versandnetz",
  );
  const [selectedCalendarWeek, setSelectedCalendarWeek] = useState<
    number | "all"
  >(getISOWeek(new Date().toISOString()));
  const [isAuftraegePanelExpanded, setIsAuftraegePanelExpanded] =
    useState(true);
  const availableCalendarWeeks = useMemo(() => {
    const weeks = new Set(
      offeneSendungen.map((sendung) => getISOWeek(sendung.ladedatum)),
    );
    return Array.from(weeks).sort((a, b) => a - b);
  }, [offeneSendungen]);
  const [searchQuery, setSearchQuery] = useState("");
  const filteredSendungen = useMemo(() => {
    let result =
      selectedCalendarWeek === "all"
        ? offeneSendungen
        : offeneSendungen.filter(
            (sendung) => getISOWeek(sendung.ladedatum) === selectedCalendarWeek,
          );
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (sendung) =>
          sendung.referenz.toLowerCase().includes(query) ||
          sendung.lade_ort.toLowerCase().includes(query) ||
          sendung.entlade_ort.toLowerCase().includes(query) ||
          (sendung.kunde != null &&
            sendung.kunde.name.toLowerCase().includes(query)),
      );
    }
    return result;
  }, [offeneSendungen, selectedCalendarWeek, searchQuery]);
  useEffect(() => {
    const visibleIds = new Set(filteredSendungen.map((sendung) => sendung.id));
    setSelectedOffeneSendungIds((prev) => {
      const next = prev.filter((id) => visibleIds.has(id));
      if (next.length === prev.length) {
        return prev;
      }
      return next;
    });
  }, [filteredSendungen]);

  const pendingCancelSendungId =
    cancelSendung.isPending && typeof cancelSendung.variables === "string"
      ? cancelSendung.variables
      : null;
  const allFilteredSelected =
    filteredSendungen.length > 0 &&
    filteredSendungen.every((sendung) =>
      selectedOffeneSendungIds.includes(sendung.id),
    );
  const shipmentDialog = useDialog<SendungRow>();
  const sendungDetailDialog = useDialog<EnrichedSendung>();
  const [detailTruckId, setDetailTruckId] = useState<string | null>(null);
  const [truckFormOpen, setTruckFormOpen] = useState(false);
  const [editTruckEvent, setEditTruckEvent] = useState<CalendarEvent | null>(
    null,
  );
  const [vorlagenOpen, setVorlagenOpen] = useState(false);
  const { data: trucks = [], isLoading: trucksLoading } = useTrucks();
  const { data: truckSendungen = [] } = useTruckSendungen();
  const assignSendung = useAssignSendung();
  const unassignSendung = useUnassignSendung();
  const { data: relationen = [], isLoading: relationenLoading } =
    useRelationen();
  const createRelation = useCreateRelation();
  const { data: vorlagen = [], isLoading: isVorlagenLoading } = useVorlagen();
  const { data: truckVorlagen = [], isLoading: isTruckVorlagenLoading } =
    useTruckVorlagen();
  const generateStandaloneSendungen = useGenerateRecurringSendungen();
  const generateTrucksWithShipments = useGenerateRecurringTrucksWithShipments();

  // Run each generation exactly once after its query finishes loading.
  // Using a ref prevents duplicate runs across re-renders.
  const standaloneSendungenGenerationHasRunRef = useRef(false);
  const truckGenerationHasRunRef = useRef(false);

  useEffect(() => {
    if (isVorlagenLoading || standaloneSendungenGenerationHasRunRef.current)
      return;
    standaloneSendungenGenerationHasRunRef.current = true;
    const activeStandaloneVorlagen = vorlagen.filter(
      (vorlage) =>
        vorlage.active &&
        vorlage.recurrence_type !== "none" &&
        (vorlage.truck_vorlage_links?.length ?? 0) === 0,
    );
    if (activeStandaloneVorlagen.length) {
      generateStandaloneSendungen.mutate(activeStandaloneVorlagen);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVorlagenLoading]);

  useEffect(() => {
    if (isTruckVorlagenLoading || truckGenerationHasRunRef.current) return;
    truckGenerationHasRunRef.current = true;
    const activeTruckVorlagen = truckVorlagen.filter(
      (truckVorlage) =>
        truckVorlage.active && truckVorlage.recurrence_type !== "none",
    );
    if (activeTruckVorlagen.length) {
      generateTrucksWithShipments.mutate(activeTruckVorlagen);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTruckVorlagenLoading]);

  // Pre-index for O(1) lookups in derived memos
  const sendungenById = useMemo(
    () => new Map(sendungen.map((sendung) => [sendung.id, sendung])),
    [sendungen],
  );
  const trucksById = useMemo(
    () => new Map(trucks.map((truck) => [truck.id, truck])),
    [trucks],
  );
  const assignmentBySendungId = useMemo(
    () =>
      new Map(
        truckSendungen.map((truckShipmentAssignment) => [
          truckShipmentAssignment.sendung_id,
          truckShipmentAssignment,
        ]),
      ),
    [truckSendungen],
  );

  // Map truckId → assigned SendungRows for Calendar
  const truckSendungenMap = useMemo(() => {
    const map = new Map<string, SendungRow[]>();
    for (const truckShipmentAssignment of truckSendungen) {
      const sendung = sendungenById.get(truckShipmentAssignment.sendung_id);
      if (!sendung) continue;
      const list = map.get(truckShipmentAssignment.truck_id) ?? [];
      list.push(sendung);
      map.set(truckShipmentAssignment.truck_id, list);
    }
    return map;
  }, [truckSendungen, sendungenById]);

  // ── Enriched sendungen (with Frächter & EK from truck assignment) ──────
  const enrichedSendungen = useMemo<EnrichedSendung[]>(() => {
    return sendungen.map((sendung) => {
      const assignment = assignmentBySendungId.get(sendung.id);
      const truck = assignment
        ? (trucksById.get(assignment.truck_id) ?? null)
        : null;
      return {
        ...sendung,
        fraechter_name: truck?.fraechter?.name ?? null,
        einkaufspreis: truck?.kosten ?? null,
        truck_id: truck?.id ?? null,
        truck_interne_ref: truck?.interne_ref ?? null,
        truck_kennzeichen: truck?.kennzeichen ?? null,
        truck_fahrer: truck?.fahrer ?? null,
        truck_telefon_fahrer: truck?.telefon_fahrer ?? null,
        truck_status: truck?.status ?? null,
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

  const handleCancelSendung = (id: string) => {
    cancelSendung.mutate(id, {
      onSuccess: () => {
        setSelectedOffeneSendungIds((prev) =>
          prev.filter((selectedId) => selectedId !== id),
        );
        toast.success("Sendung storniert");
      },
      onError: () => toast.error("Fehler beim Stornieren"),
    });
  };

  const handleBulkCancelSendungen = () => {
    if (selectedOffeneSendungIds.length === 0) return;
    bulkCancelSendungen.mutate(selectedOffeneSendungIds, {
      onSuccess: () => {
        const count = selectedOffeneSendungIds.length;
        setSelectedOffeneSendungIds([]);
        toast.success(`${count} Sendung${count === 1 ? "" : "en"} storniert`);
      },
      onError: () => toast.error("Fehler beim Stornieren"),
    });
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

  const detailTruck =
    detailTruckId != null && detailTruckId !== ""
      ? (trucks.find((truck) => truck.id === detailTruckId) ?? null)
      : null;
  const detailSendungen =
    detailTruckId != null && detailTruckId !== ""
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
                  <DashboardShipmentsPanelHeader
                    availableCalendarWeeks={availableCalendarWeeks}
                    selectedCalendarWeek={selectedCalendarWeek}
                    onCalendarWeekChange={setSelectedCalendarWeek}
                    searchQuery={searchQuery}
                    onSearchQueryChange={setSearchQuery}
                    isAuftraegePanelExpanded={isAuftraegePanelExpanded}
                    onToggleAuftraegePanelExpanded={() =>
                      setIsAuftraegePanelExpanded((prev) => !prev)
                    }
                    sendungenLoading={sendungenLoading}
                    offeneSendungenCount={offeneSendungen.length}
                    onNewShipmentClick={() => shipmentDialog.onOpen()}
                    onVorlagenClick={() => setVorlagenOpen(true)}
                  />

                  <AnimatePresence initial={false}>
                    {isAuftraegePanelExpanded && (
                      <motion.div
                        key="sendeauftraege-panel-content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        {selectedOffeneSendungIds.length > 0 && (
                          <DashboardSelectionToolbar
                            selectedCount={selectedOffeneSendungIds.length}
                            allFilteredSelected={allFilteredSelected}
                            onToggleAll={() => {
                              const shouldSelectAll = !allFilteredSelected;
                              setSelectedOffeneSendungIds(
                                shouldSelectAll
                                  ? filteredSendungen.map(
                                      (sendung) => sendung.id,
                                    )
                                  : [],
                              );
                            }}
                            bulkCancelIsPending={bulkCancelSendungen.isPending}
                            onBulkCancel={handleBulkCancelSendungen}
                          />
                        )}

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
                                  Keine Aufträge in KW {selectedCalendarWeek}
                                </p>
                              </div>
                            ) : (
                              filteredSendungen.map((sendung, index) => (
                                <motion.div
                                  key={sendung.id}
                                  className="w-64 shrink-0"
                                  initial={{ opacity: 0, x: 8 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{
                                    duration: 0.2,
                                    delay: index * 0.03,
                                  }}
                                >
                                  <OpenShipmentCard
                                    sendung={sendung}
                                    onCancel={() =>
                                      setConfirmSingleCancel({
                                        id: sendung.id,
                                        referenz: sendung.referenz,
                                      })
                                    }
                                    onToggleSelect={(checked) => {
                                      setSelectedOffeneSendungIds((prev) => {
                                        if (checked) {
                                          return prev.includes(sendung.id)
                                            ? prev
                                            : [...prev, sendung.id];
                                        }
                                        return prev.filter(
                                          (id) => id !== sendung.id,
                                        );
                                      });
                                    }}
                                    isSelected={selectedOffeneSendungIds.includes(
                                      sendung.id,
                                    )}
                                    isCancelPending={
                                      pendingCancelSendungId === sendung.id
                                    }
                                    onEdit={() => shipmentDialog.onOpen(sendung)}
                                    fallbackCreatorName={viewerDisplayName}
                                    fallbackCreatorAvatarUrl={viewerAvatarUrl}
                                  />
                                </motion.div>
                              ))
                            )}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
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
                  onRowClick={(sendung) => sendungDetailDialog.onOpen(sendung)}
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
        onEdit={(sendung) => {
          sendungDetailDialog.onClose();
          shipmentDialog.onOpen(sendung);
        }}
      />

      <TruckDetailPanel
        truck={detailTruck}
        sendungen={detailSendungen}
        open={detailTruckId !== null}
        onClose={() => setDetailTruckId(null)}
        onEditTruck={(truck) => {
          // Build a CalendarEvent-like object for TruckForm
          const truckLadezeit =
            truck.ladezeit != null && truck.ladezeit.trim() !== ""
              ? truck.ladezeit
              : "08:00";
          const truckFahrer =
            truck.fahrer != null && truck.fahrer.trim() !== ""
              ? truck.fahrer
              : "";
          const start = dayjs(`${truck.ladedatum}T${truckLadezeit}:00`);
          const end = start.add(2, "hour");
          const truckCalendarEvent = {
            id: `truck-${truck.id}`,
            title: truck.kennzeichen,
            description: truckFahrer,
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
        onEditSendung={(sendung) => {
          setDetailTruckId(null);
          shipmentDialog.onOpen(sendung);
        }}
        onDropSendung={handleDropSendung}
      />

      <VorlagenSlideOver
        open={vorlagenOpen}
        onClose={() => setVorlagenOpen(false)}
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

      {confirmSingleCancel && (
        <div
          className="fixed inset-0 z-1400 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setConfirmSingleCancel(null)}
        >
          <div
            className="w-full max-w-sm rounded-xl border border-[#0f172b]/10 bg-white p-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-2">
              <div className="mt-0.5 rounded-full bg-red-50 p-1.5 text-red-600">
                <TriangleAlert className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#0f172b]">
                  Sendung wirklich stornieren?
                </p>
                <p className="mt-1 text-xs text-[#57688e]">
                  Sendung {confirmSingleCancel.referenz} wird auf
                  &quot;storniert&quot; gesetzt.
                </p>
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <Button
                size="sm"
                variant="plain"
                color="neutral"
                onClick={() => setConfirmSingleCancel(null)}
              >
                Abbrechen
              </Button>
              <Button
                size="sm"
                color="danger"
                variant="solid"
                onClick={() => {
                  handleCancelSendung(confirmSingleCancel.id);
                  setConfirmSingleCancel(null);
                }}
              >
                Ja, stornieren
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
