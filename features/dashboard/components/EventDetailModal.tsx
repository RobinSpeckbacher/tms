"use client";

import Modal from "@mui/joy/Modal";
import ModalDialog from "@mui/joy/ModalDialog";
import ModalClose from "@mui/joy/ModalClose";
import DialogTitle from "@mui/joy/DialogTitle";
import DialogContent from "@mui/joy/DialogContent";
import DialogActions from "@mui/joy/DialogActions";
import Stack from "@mui/joy/Stack";
import Typography from "@mui/joy/Typography";
import Button from "@mui/joy/Button";
import Divider from "@mui/joy/Divider";
import { MapPin, Clock, Package, Truck } from "lucide-react";
import type {
  Assignment,
  Shipment,
  Truck as TruckType,
} from "@/types/planning";

interface EventDetailModalProps {
  assignment: Assignment;
  shipment: Shipment | undefined;
  truck: TruckType | undefined;
  onClose: () => void;
  onUnassign: (assignmentId: string) => void;
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("de-DE", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatWeight(kg: number): string {
  if (kg >= 1000) return `${(kg / 1000).toFixed(1)} t`;
  return `${kg} kg`;
}

export function EventDetailModal({
  assignment,
  shipment,
  truck,
  onClose,
  onUnassign,
}: EventDetailModalProps) {
  return (
    <Modal open onClose={onClose}>
      <ModalDialog size="sm" sx={{ maxWidth: 400 }}>
        <ModalClose />
        <DialogTitle>{shipment?.referenz ?? assignment.title}</DialogTitle>
        <Divider />
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {truck && (
              <DetailRow icon={<Truck size={16} />} label="LKW">
                <Typography level="body-sm">{truck.licensePlate}</Typography>
                <Typography level="body-xs" sx={{ color: "neutral.500" }}>
                  {truck.driverName}
                </Typography>
              </DetailRow>
            )}

            {shipment && (
              <>
                <DetailRow
                  icon={<MapPin size={16} color="#16a34a" />}
                  label="Ladeort"
                >
                  <Typography level="body-sm">{shipment.ladeort}</Typography>
                </DetailRow>
                <DetailRow
                  icon={<MapPin size={16} color="#dc2626" />}
                  label="Entladeort"
                >
                  <Typography level="body-sm">{shipment.entladeort}</Typography>
                </DetailRow>
                {shipment.gewicht && (
                  <DetailRow icon={<Package size={16} />} label="Ladung">
                    <Typography level="body-sm">
                      {formatWeight(shipment.gewicht)}
                    </Typography>
                  </DetailRow>
                )}
              </>
            )}

            <DetailRow icon={<Clock size={16} />} label="Zeitraum">
              <Typography level="body-sm">
                {formatDateTime(assignment.start)}
              </Typography>
              <Typography level="body-sm">
                – {formatDateTime(assignment.end)}
              </Typography>
            </DetailRow>
          </Stack>
        </DialogContent>
        <Divider />
        <DialogActions>
          <Button
            size="sm"
            variant="plain"
            color="danger"
            onClick={() => {
              onUnassign(assignment.id);
              onClose();
            }}
          >
            Zuweisung aufheben
          </Button>
          <Button size="sm" variant="solid" color="neutral" onClick={onClose}>
            Schließen
          </Button>
        </DialogActions>
      </ModalDialog>
    </Modal>
  );
}

function DetailRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Stack direction="row" spacing={1.5} alignItems="flex-start">
      <span style={{ marginTop: 2, flexShrink: 0, color: "#94a3b8" }}>
        {icon}
      </span>
      <div>
        <Typography
          level="body-xs"
          sx={{
            color: "neutral.500",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            mb: 0.25,
          }}
        >
          {label}
        </Typography>
        {children}
      </div>
    </Stack>
  );
}
