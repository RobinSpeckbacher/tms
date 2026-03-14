"use client";

import { useEffect, useRef } from "react";
import { Draggable } from "@fullcalendar/interaction";
import Sheet from "@mui/joy/Sheet";
import Box from "@mui/joy/Box";
import Typography from "@mui/joy/Typography";
import Stack from "@mui/joy/Stack";
import type { Shipment } from "@/types/planning";
import { ShipmentCard } from "./ShipmentCard";

interface OpenShipmentsPanelProps {
  shipments: Shipment[];
}

/**
 * Left panel listing all open (unassigned) shipments.
 * Initialises FullCalendar's Draggable so cards can be dropped onto the timeline.
 */
export function OpenShipmentsPanel({ shipments }: OpenShipmentsPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const draggable = new Draggable(containerRef.current, {
      itemSelector: ".fc-draggable-shipment",
      eventData: (el: HTMLElement) => {
        const raw = el.getAttribute("data-event");
        return raw ? (JSON.parse(raw) as object) : {};
      },
    });
    return () => draggable.destroy();
  }, [shipments]);

  return (
    <Sheet
      variant="outlined"
      sx={{
        width: 260,
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        borderRight: "1px solid",
        borderColor: "divider",
        borderRadius: 0,
        border: "none",
        borderRightWidth: 1,
        borderRightStyle: "solid",
        borderRightColor: "divider",
      }}
    >
      {/* Panel header */}
      <Box
        sx={{
          px: 2,
          py: 1.5,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography level="title-sm">Offene Ladungen</Typography>
        <Typography level="body-xs" sx={{ color: "neutral.500" }}>
          {shipments.length} {shipments.length === 1 ? "Ladung" : "Ladungen"} ·
          auf LKW ziehen
        </Typography>
      </Box>

      {/* Draggable card list */}
      <Box ref={containerRef} sx={{ flex: 1, overflow: "auto", p: 1.5 }}>
        {shipments.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 6 }}>
            <Typography level="body-xs" sx={{ color: "neutral.400" }}>
              Alle Ladungen vergeben
            </Typography>
          </Box>
        ) : (
          <Stack spacing={1}>
            {shipments.map((s) => (
              <ShipmentCard key={s.id} shipment={s} />
            ))}
          </Stack>
        )}
      </Box>
    </Sheet>
  );
}
