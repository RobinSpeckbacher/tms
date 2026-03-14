"use client";

import { useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import resourceTimelinePlugin from "@fullcalendar/resource-timeline";
import interactionPlugin from "@fullcalendar/interaction";
import type { EventClickArg } from "@fullcalendar/core";
import type { EventReceiveArg } from "@fullcalendar/interaction";
import type { Truck as TruckType, Assignment } from "@/types/planning";
import Sheet from "@mui/joy/Sheet";
import Typography from "@mui/joy/Typography";
import Box from "@mui/joy/Box";

interface TruckSchedulerProps {
  trucks: TruckType[];
  assignments: Assignment[];
  selectedDate: string;
  onEventReceive: (info: EventReceiveArg) => void;
  onEventClick: (assignmentId: string) => void;
}

/**
 * FullCalendar Resource Timeline — **Wochenansicht**.
 * One row per truck; assignments rendered as event blocks.
 */
export function TruckScheduler({
  trucks,
  assignments,
  selectedDate,
  onEventReceive,
  onEventClick,
}: TruckSchedulerProps) {
  const calendarRef = useRef<FullCalendar>(null);

  useEffect(() => {
    const api = calendarRef.current?.getApi();
    if (api) api.gotoDate(selectedDate);
  }, [selectedDate]);

  const resources = trucks.map((t) => ({
    id: t.id,
    title: t.licensePlate,
    extendedProps: { driverName: t.driverName, status: t.status },
  }));

  const events = assignments.map((a) => ({
    id: a.id,
    resourceId: a.resourceId,
    title: a.title,
    start: a.start,
    end: a.end,
    backgroundColor: a.backgroundColor ?? "#3b82f6",
    borderColor: a.borderColor ?? "#2563eb",
    textColor: "#fff",
    extendedProps: { shipmentId: a.shipmentId },
  }));

  const handleEventClick = (info: EventClickArg) => {
    onEventClick(info.event.id);
  };

  if (trucks.length === 0) {
    return (
      <Sheet
        variant="plain"
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 1.5,
          p: 4,
        }}
      >
        <Typography level="title-sm">Noch keine LKW geplant</Typography>
        <Typography level="body-xs" sx={{ color: "neutral.500" }}>
          Klicke auf „LKW anlegen", um einen LKW für die Woche hinzuzufügen.
        </Typography>
      </Sheet>
    );
  }

  return (
    <Box sx={{ flex: 1, overflow: "auto", p: 1.5, minHeight: 0 }}>
      <FullCalendar
        ref={calendarRef}
        plugins={[resourceTimelinePlugin, interactionPlugin]}
        initialView="resourceTimelineWeek"
        initialDate={selectedDate}
        schedulerLicenseKey="CC-Attribution-NonCommercial-NoDerivatives"
        resources={resources}
        events={events}
        droppable={true}
        editable={false}
        eventReceive={onEventReceive}
        eventClick={handleEventClick}
        headerToolbar={false}
        // Week view: 2-hour slots with day dividers
        slotDuration="02:00:00"
        slotMinTime="00:00:00"
        slotMaxTime="24:00:00"
        height="auto"
        resourceAreaWidth="180px"
        resourceLabelContent={(arg) => (
          <div style={{ padding: "4px 2px" }}>
            <div style={{ fontSize: "0.75rem", fontWeight: 600 }}>
              {arg.resource.title}
            </div>
            <div style={{ fontSize: "0.7rem", color: "#94a3b8" }}>
              {arg.resource.extendedProps.driverName}
            </div>
          </div>
        )}
        locale="de"
        timeZone="local"
        resourceAreaHeaderContent="Fahrzeug"
        slotLabelFormat={{
          weekday: "short",
          day: "2-digit",
          month: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          omitZeroMinute: true,
        }}
      />
    </Box>
  );
}
