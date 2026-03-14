"use client";

import { useState } from "react";
import Calendar from "./components/Calendar";
import ShipmentsTable from "./components/ShipmentsTable";
import { DndContext } from "@dnd-kit/core";
import type { Shipment } from "@/types/planning";
import type { Transport } from "@/types/transport";
import { GripVertical, Package } from "lucide-react";

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
  const [shipments] = useState<Shipment[]>([]);
  const [transports] = useState<Transport[]>([]);

  // ── Derived state ─────────────────────────────────────────────────────

  // ── Handlers ──────────────────────────────────────────────────────────

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
              <span className="ml-auto text-xs text-[#57688e]">
                {shipments.length}
              </span>
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
            <Calendar />
          </div>
        </div>

        <div className="flex min-h-[50vh] rounded-md border border-[#0f172b]/10 overflow-hidden shrink-0">
          <ShipmentsTable transports={transports} />
        </div>
      </div>
    </DndContext>
  );
}
