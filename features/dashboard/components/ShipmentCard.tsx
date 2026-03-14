import Card from "@mui/joy/Card";
import Typography from "@mui/joy/Typography";
import Chip from "@mui/joy/Chip";
import Stack from "@mui/joy/Stack";
import type { Shipment } from "@/types/planning";

interface ShipmentCardProps {
  shipment: Shipment;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatWeight(kg: number): string {
  if (kg >= 1000) return `${(kg / 1000).toFixed(1)} t`;
  return `${kg} kg`;
}

/**
 * Draggable shipment card.
 * `data-event` is read by FullCalendar's Draggable when the drag starts.
 */
export function ShipmentCard({ shipment }: ShipmentCardProps) {
  const eventPayload = JSON.stringify({
    title: `${shipment.referenz} · ${shipment.ladeort} → ${shipment.entladeort}`,
    duration: "08:00",
    extendedProps: {
      shipmentId: shipment.id,
      referenz: shipment.referenz,
      ladeort: shipment.ladeort,
      entladeort: shipment.entladeort,
      gewicht: shipment.gewicht ?? null,
    },
  });

  return (
    <Card
      variant="outlined"
      className="fc-draggable-shipment"
      data-event={eventPayload}
      sx={{
        p: 1.5,
        cursor: "grab",
        "&:active": { cursor: "grabbing" },
        "&:hover": { borderColor: "primary.400", boxShadow: "sm" },
        transition: "all 0.15s",
        userSelect: "none",
      }}
    >
      {/* Header */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 0.75 }}
      >
        <Typography level="body-xs" fontFamily="monospace" fontWeight={700}>
          {shipment.referenz}
        </Typography>
        <Chip size="sm" variant="soft" color="primary">
          offen
        </Chip>
      </Stack>

      {/* Route */}
      <Stack spacing={0.5}>
        <Typography level="body-xs">
          <Typography
            component="span"
            sx={{ color: "success.600", fontWeight: 700, mr: 0.5 }}
          >
            ●
          </Typography>
          {shipment.ladeort}
        </Typography>
        <Typography level="body-xs">
          <Typography
            component="span"
            sx={{ color: "danger.600", fontWeight: 700, mr: 0.5 }}
          >
            ●
          </Typography>
          {shipment.entladeort}
        </Typography>
        <Typography level="body-xs" sx={{ color: "neutral.500" }}>
          {formatTime(shipment.start)} – {formatTime(shipment.end)}
        </Typography>
        {shipment.gewicht && (
          <Typography level="body-xs" sx={{ color: "neutral.500" }}>
            {formatWeight(shipment.gewicht)}
          </Typography>
        )}
      </Stack>
    </Card>
  );
}
