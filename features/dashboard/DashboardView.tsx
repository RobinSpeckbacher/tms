"use client";

import { useState, useMemo } from "react";
import dayjs from "dayjs";
import Calendar from "./components/Calendar";
import ShipmentsTable from "./components/ShipmentsTable";
import ShipmentForm from "./components/ShipmentForm";
import { DndContext } from "@dnd-kit/core";
import type { Shipment } from "@/types/planning";
import type { Transport } from "@/types/transport";
import type { CalendarEvent } from "@ilamy/calendar";
import { GripVertical, Package, Plus } from "lucide-react";
import Button from "@mui/joy/Button";
import { useDialog } from "@/hooks/useDialog";
import { useTrucks, useUpdateTruck } from "@/hooks/useTrucks";
import { toast } from "react-toastify";

/* ── Draggable Shipment Card ─────────────────────────────────────── */
function ShipmentCard({ shipment }: { shipment: Shipment }) {
  return (
    <div
      className="flex items-center gap-2 rounded-md border border-[#0f172b]/10 bg-white px-3 py-2 text-sm
                 cursor-grab active:cursor-grabbing hover:border-[#155dfc]/40 hover:shadow-sm transition-all"
      draggable
    >
      <GripVertical className="h-3.5 w-3.5 shrink-0 text-[#57688e]" />
      <div className="min-w-0 flex-1">
        <p className="font-medium text-[#0f172b] truncate">
          {shipment.referenz}
        </p>
        <p className="text-xs text-[#57688e] truncate">
          {shipment.ladeort} → {shipment.entladeort}
        </p>
      </div>
      {shipment.gewicht && (
        <span className="shrink-0 text-xs text-[#57688e]">
          {shipment.gewicht} kg
        </span>
      )}
    </div>
  );
}

export function DashboardView() {
  // ── Demo data (replace with real data) ────────────────────────────
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [transports] = useState<Transport[]>([]);
  const shipmentDialog = useDialog();
  const { data: trucks = [] } = useTrucks();
  const updateTruck = useUpdateTruck();

  // ── Map trucks → CalendarEvents ───────────────────────────────────
  const truckEvents = useMemo<CalendarEvent[]>(() => {
    return trucks.map((t) => {
      const start = dayjs(`${t.ladedatum}T${t.ladezeit || "08:00"}:00`);
      const end = start.add(1, "hour");
      const title = t.fraechter
        ? `${t.kennzeichen} \u00b7 ${t.fraechter.name}`
        : t.kennzeichen;
      return {
        id: `truck-${t.id}`,
        title,
        description: t.fahrer || "",
        start,
        end,
        allDay: false,
        backgroundColor: t.farbe || "#155dfc",
        color: "#fff",
        truckId: t.id,
        truckData: t,
      } as unknown as CalendarEvent;
    });
  }, [trucks]);

  // ── Derived state ─────────────────────────────────────────────────────

  // ── Handlers ──────────────────────────────────────────────────────────
  const handleEventUpdate = (event: CalendarEvent) => {
    const ext = event as unknown as Record<string, unknown>;
    const truckId = ext.truckId as string | undefined;
    if (!truckId) return;

    const start = dayjs(event.start as unknown as string);
    updateTruck.mutate(
      {
        id: truckId,
        ladedatum: start.format("YYYY-MM-DD"),
        ladezeit: start.format("HH:mm"),
      },
      {
        onError: () => toast.error("Fehler beim Verschieben"),
      },
    );
  };

  return (
    <DndContext
      onDragStart={(e) => {
        console.log("Drag started:", e);
      }}
      onDragEnd={(e) => {}}
    >
      <div className="flex h-full flex-col gap-6 overflow-y-auto ">
        {/* ── Toolbar ── */}

        {/* ── Calendar + Sendeaufträge ── */}
        <div className="flex h-[60vh] rounded-md border border-[#0f172b]/10 overflow-hidden shrink-0">
          {/* Sendeaufträge panel */}
          <aside className="w-64 shrink-0 border-r border-[#0f172b]/10 bg-[#f8f9fb] flex flex-col">
            <div className="flex items-center gap-2 px-3 py-2.5 border-b border-[#0f172b]/10">
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
              {shipments.length === 0 ? (
                <p className="text-xs text-[#57688e] text-center pt-8">
                  Keine offenen Aufträge
                </p>
              ) : (
                shipments.map((s) => <ShipmentCard key={s.id} shipment={s} />)
              )}
            </div>
          </aside>

          {/* Calendar */}
          <div className="flex-1 min-w-0 h-full mx-4 my-3 rounded-md border border-[#0f172b]/10 overflow-hidden">
            <Calendar events={truckEvents} onEventUpdate={handleEventUpdate} />
          </div>
        </div>

        <div className="flex min-h-[50vh] rounded-md border border-[#0f172b]/10 overflow-hidden shrink-0">
          <ShipmentsTable transports={transports} />
        </div>
      </div>

      <ShipmentForm
        open={shipmentDialog.open}
        onClose={shipmentDialog.onClose}
        onSubmit={(s) => setShipments((prev) => [...prev, s])}
      />
    </DndContext>
  );
}
