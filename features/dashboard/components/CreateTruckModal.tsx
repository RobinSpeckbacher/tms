"use client";

import { useState } from "react";
import Modal from "@mui/joy/Modal";
import ModalDialog from "@mui/joy/ModalDialog";
import ModalClose from "@mui/joy/ModalClose";
import DialogTitle from "@mui/joy/DialogTitle";
import DialogContent from "@mui/joy/DialogContent";
import DialogActions from "@mui/joy/DialogActions";
import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";
import FormHelperText from "@mui/joy/FormHelperText";
import Input from "@mui/joy/Input";
import Button from "@mui/joy/Button";
import Stack from "@mui/joy/Stack";
import Typography from "@mui/joy/Typography";
import { Truck as TruckIcon } from "lucide-react";
import type { Truck as TruckType } from "@/types/planning";

interface CreateTruckModalProps {
  selectedDate: string;
  onClose: () => void;
  onCreate: (truck: TruckType) => void;
}

export function CreateTruckModal({
  selectedDate,
  onClose,
  onCreate,
}: CreateTruckModalProps) {
  const [licensePlate, setLicensePlate] = useState("");
  const [driverName, setDriverName] = useState("");
  const [error, setError] = useState("");

  const displayDate = new Date(`${selectedDate}T12:00:00`).toLocaleDateString(
    "de-DE",
    { weekday: "long", day: "2-digit", month: "long", year: "numeric" },
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!licensePlate.trim()) {
      setError("Kennzeichen ist erforderlich.");
      return;
    }
    const newTruck: TruckType = {
      id: `truck-${Date.now()}`,
      licensePlate: licensePlate.trim().toUpperCase(),
      driverName: driverName.trim() || "—",
      status: "verfügbar",
      date: selectedDate,
    };
    onCreate(newTruck);
    onClose();
  };

  return (
    <Modal open onClose={onClose}>
      <ModalDialog size="sm" sx={{ maxWidth: 400 }}>
        <ModalClose />
        <DialogTitle>
          <Stack direction="row" spacing={1} alignItems="center">
            <TruckIcon size={16} />
            <span>LKW anlegen</span>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <form id="create-truck-form" onSubmit={handleSubmit}>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <FormControl error={!!error}>
                <FormLabel>Kennzeichen *</FormLabel>
                <Input
                  value={licensePlate}
                  onChange={(e) => {
                    setLicensePlate(e.target.value);
                    setError("");
                  }}
                  placeholder="z.B. HH-TM 123"
                  autoFocus
                />
                {error && <FormHelperText>{error}</FormHelperText>}
              </FormControl>

              <FormControl>
                <FormLabel>Fahrername (optional)</FormLabel>
                <Input
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  placeholder="z.B. Max Mustermann"
                />
              </FormControl>

              <Typography level="body-xs" sx={{ color: "neutral.500" }}>
                Planung für: <strong>{displayDate}</strong>
              </Typography>
            </Stack>
          </form>
        </DialogContent>
        <DialogActions>
          <Button
            size="sm"
            variant="outlined"
            color="neutral"
            onClick={onClose}
          >
            Abbrechen
          </Button>
          <Button size="sm" type="submit" form="create-truck-form">
            Anlegen
          </Button>
        </DialogActions>
      </ModalDialog>
    </Modal>
  );
}
