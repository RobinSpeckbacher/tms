"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import type { EventReceiveArg } from "@fullcalendar/interaction";
import type { Truck, Shipment, Assignment } from "@/types/planning";
import {
  mockPlanningTrucks,
  mockPlanningShipments,
} from "@/data/planningMockData";
import Sheet from "@mui/joy/Sheet";
import Box from "@mui/joy/Box";
import { DashboardToolbar } from "./components/DashboardToolbar";
import { OpenShipmentsPanel } from "./components/OpenShipmentsPanel";
import { CreateTruckModal } from "./components/CreateTruckModal";
import { EventDetailModal } from "./components/EventDetailModal";

const TruckScheduler = dynamic(
  () => import("./components/TruckScheduler").then((m) => m.TruckScheduler),
  { ssr: false },
);

const DashboardMap = dynamic(
  () => import("./components/DashboardMap").then((m) => m.DashboardMap),
  { ssr: false },
);

const ASSIGNMENT_COLORS = [
  { bg: "#3b82f6", border: "#2563eb" },
  { bg: "#8b5cf6", border: "#7c3aed" },
  { bg: "#10b981", border: "#059669" },
  { bg: "#f59e0b", border: "#d97706" },
  { bg: "#ef4444", border: "#dc2626" },
  { bg: "#0ea5e9", border: "#0284c7" },
];

let colorIndex = 0;
function nextColor() {
  const c = ASSIGNMENT_COLORS[colorIndex % ASSIGNMENT_COLORS.length];
  colorIndex++;
  return c;
}

export function DashboardView() {
  const today = new Date().toISOString().split("T")[0];

  const [selectedDate, setSelectedDate] = useState<string>(today);
  const [trucks, setTrucks] = useState<Truck[]>(mockPlanningTrucks);
  const [shipments, setShipments] = useState<Shipment[]>(mockPlanningShipments);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [showCreateTruck, setShowCreateTruck] = useState(false);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<
    string | null
  >(null);

  // ── Derived state ─────────────────────────────────────────────────────
  const assignedShipmentIds = new Set(assignments.map((a) => a.shipmentId));
  const openShipments = shipments.filter(
    (s) => s.status === "offen" && !assignedShipmentIds.has(s.id),
  );
  const selectedAssignment = assignments.find(
    (a) => a.id === selectedAssignmentId,
  );
  const selectedShipment = selectedAssignment
    ? shipments.find((s) => s.id === selectedAssignment.shipmentId)
    : undefined;
  const selectedTruck = selectedAssignment
    ? trucks.find((t) => t.id === selectedAssignment.resourceId)
    : undefined;

  // ── Handlers ──────────────────────────────────────────────────────────
  const handleCreateTruck = useCallback((truck: Truck) => {
    setTrucks((prev) => [...prev, truck]);
  }, []);

  const handleEventReceive = useCallback(
    (info: EventReceiveArg) => {
      const { event } = info;
      const shipmentId = event.extendedProps.shipmentId as string | undefined;

      if (!shipmentId || assignedShipmentIds.has(shipmentId)) {
        info.revert();
        return;
      }

      const resourceId = event.getResources()[0]?.id;
      if (!resourceId) {
        info.revert();
        return;
      }

      const color = nextColor();
      const endFallback = new Date(
        new Date(event.startStr).getTime() + 8 * 3_600_000,
      ).toISOString();

      const newAssignment: Assignment = {
        id: `assign-${Date.now()}`,
        resourceId,
        title: event.title,
        start: event.startStr,
        end: event.endStr || endFallback,
        shipmentId,
        backgroundColor: color.bg,
        borderColor: color.border,
        textColor: "#fff",
      };

      setAssignments((prev) => [...prev, newAssignment]);
      setShipments((prev) =>
        prev.map((s) =>
          s.id === shipmentId ? { ...s, status: "zugewiesen" as const } : s,
        ),
      );
    },
    [assignedShipmentIds],
  );

  const handleUnassign = useCallback((assignmentId: string) => {
    setAssignments((prev) => {
      const target = prev.find((a) => a.id === assignmentId);
      if (target) {
        setShipments((s) =>
          s.map((sh) =>
            sh.id === target.shipmentId
              ? { ...sh, status: "offen" as const }
              : sh,
          ),
        );
      }
      return prev.filter((a) => a.id !== assignmentId);
    });
  }, []);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        gap: 1.5,
      }}
    >
      {/* ── Toolbar ── */}
      <DashboardToolbar
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        onCreateTruck={() => setShowCreateTruck(true)}
      />

      {/* ── Map section (upper) ── */}
      <Sheet
        variant="outlined"
        sx={{
          borderRadius: "md",
          overflow: "hidden",
          height: 320,
          flexShrink: 0,
        }}
      >
        <DashboardMap trucks={trucks} shipments={shipments} />
      </Sheet>

      {/* ── Timeline section (lower): shipment panel + calendar ── */}
      <Sheet
        variant="outlined"
        sx={{
          borderRadius: "md",
          display: "flex",
          flex: 1,
          minHeight: 0,
          overflow: "hidden",
        }}
      >
        <OpenShipmentsPanel shipments={openShipments} />
        <TruckScheduler
          trucks={trucks}
          assignments={assignments}
          selectedDate={selectedDate}
          onEventReceive={handleEventReceive}
          onEventClick={(id) => setSelectedAssignmentId(id)}
        />
      </Sheet>

      {/* ── Modals ── */}
      {showCreateTruck && (
        <CreateTruckModal
          selectedDate={selectedDate}
          onClose={() => setShowCreateTruck(false)}
          onCreate={handleCreateTruck}
        />
      )}
      {selectedAssignment && (
        <EventDetailModal
          assignment={selectedAssignment}
          shipment={selectedShipment}
          truck={selectedTruck}
          onClose={() => setSelectedAssignmentId(null)}
          onUnassign={handleUnassign}
        />
      )}
    </Box>
  );
}
