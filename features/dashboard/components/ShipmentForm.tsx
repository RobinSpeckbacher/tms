"use client";

import { useState } from "react";
import dayjs from "dayjs";
import type { Shipment } from "@/types/planning";
import SlideOver from "@/components/common/SlideOver";
import Button from "@mui/joy/Button";
import Input from "@mui/joy/Input";
import Stack from "@mui/joy/Stack";
import Box from "@mui/joy/Box";
import Typography from "@mui/joy/Typography";

interface ShipmentFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (shipment: Shipment) => void;
}

export default function ShipmentForm({
  open,
  onClose,
  onSubmit,
}: ShipmentFormProps) {
  const [referenz, setReferenz] = useState("");
  const [ladeort, setLadeort] = useState("");
  const [entladeort, setEntladeort] = useState("");
  const [gewicht, setGewicht] = useState("");
  const [startDate, setStartDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [startTime, setStartTime] = useState("08:00");
  const [endDate, setEndDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [endTime, setEndTime] = useState("17:00");

  const resetForm = () => {
    setReferenz("");
    setLadeort("");
    setEntladeort("");
    setGewicht("");
    setStartDate(dayjs().format("YYYY-MM-DD"));
    setStartTime("08:00");
    setEndDate(dayjs().format("YYYY-MM-DD"));
    setEndTime("17:00");
  };

  const handleSubmit = () => {
    if (!referenz.trim() || !ladeort.trim() || !entladeort.trim()) return;

    const shipment: Shipment = {
      id: `shp-${Date.now()}`,
      referenz: referenz.trim(),
      ladeort: ladeort.trim(),
      entladeort: entladeort.trim(),
      start: `${startDate}T${startTime}:00`,
      end: `${endDate}T${endTime}:00`,
      status: "offen",
      ...(gewicht ? { gewicht: Number(gewicht) } : {}),
    };

    onSubmit(shipment);
    resetForm();
    onClose();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const actions = (
    <>
      <Button
        variant="plain"
        color="neutral"
        size="sm"
        onClick={handleClose}
        sx={{ color: "#57688e" }}
      >
        Abbrechen
      </Button>
      <Button
        size="sm"
        onClick={handleSubmit}
        sx={{ bgcolor: "#155dfc", "&:hover": { bgcolor: "#1250d4" } }}
      >
        Erstellen
      </Button>
    </>
  );

  return (
    <SlideOver
      open={open}
      onClose={handleClose}
      title="Neuer Sendeauftrag"
      actions={actions}
    >
      <Stack spacing={2}>
        {/* Referenz */}
        <Box>
          <Typography
            level="body-xs"
            sx={{ color: "#57688e", mb: 0.5, fontWeight: 500 }}
          >
            Referenz
          </Typography>
          <Input
            size="sm"
            required
            value={referenz}
            onChange={(e) => setReferenz(e.target.value)}
            placeholder="z.B. SA-20260315-001"
            sx={{ "--Input-focusedHighlight": "#155dfc", color: "#0f172b" }}
          />
        </Box>

        {/* Ladeort */}
        <Box>
          <Typography
            level="body-xs"
            sx={{ color: "#57688e", mb: 0.5, fontWeight: 500 }}
          >
            Ladeort
          </Typography>
          <Input
            size="sm"
            required
            value={ladeort}
            onChange={(e) => setLadeort(e.target.value)}
            placeholder="z.B. Wien"
            sx={{ "--Input-focusedHighlight": "#155dfc", color: "#0f172b" }}
          />
        </Box>

        {/* Entladeort */}
        <Box>
          <Typography
            level="body-xs"
            sx={{ color: "#57688e", mb: 0.5, fontWeight: 500 }}
          >
            Entladeort
          </Typography>
          <Input
            size="sm"
            required
            value={entladeort}
            onChange={(e) => setEntladeort(e.target.value)}
            placeholder="z.B. Graz"
            sx={{ "--Input-focusedHighlight": "#155dfc", color: "#0f172b" }}
          />
        </Box>

        {/* Gewicht */}
        <Box>
          <Typography
            level="body-xs"
            sx={{ color: "#57688e", mb: 0.5, fontWeight: 500 }}
          >
            Gewicht (kg)
          </Typography>
          <Input
            size="sm"
            type="number"
            value={gewicht}
            onChange={(e) => setGewicht(e.target.value)}
            placeholder="Optional"
            sx={{ "--Input-focusedHighlight": "#155dfc", color: "#0f172b" }}
          />
        </Box>

        {/* Ladedatum / Uhrzeit */}
        <Stack direction="row" spacing={1.5}>
          <Box sx={{ flex: 1 }}>
            <Typography
              level="body-xs"
              sx={{ color: "#57688e", mb: 0.5, fontWeight: 500 }}
            >
              Ladedatum
            </Typography>
            <Input
              size="sm"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              sx={{ "--Input-focusedHighlight": "#155dfc" }}
            />
          </Box>
          <Box sx={{ width: 120 }}>
            <Typography
              level="body-xs"
              sx={{ color: "#57688e", mb: 0.5, fontWeight: 500 }}
            >
              Uhrzeit
            </Typography>
            <Input
              size="sm"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              sx={{ "--Input-focusedHighlight": "#155dfc" }}
            />
          </Box>
        </Stack>

        {/* Entladedatum / Uhrzeit */}
        <Stack direction="row" spacing={1.5}>
          <Box sx={{ flex: 1 }}>
            <Typography
              level="body-xs"
              sx={{ color: "#57688e", mb: 0.5, fontWeight: 500 }}
            >
              Entladedatum
            </Typography>
            <Input
              size="sm"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              sx={{ "--Input-focusedHighlight": "#155dfc" }}
            />
          </Box>
          <Box sx={{ width: 120 }}>
            <Typography
              level="body-xs"
              sx={{ color: "#57688e", mb: 0.5, fontWeight: 500 }}
            >
              Uhrzeit
            </Typography>
            <Input
              size="sm"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              sx={{ "--Input-focusedHighlight": "#155dfc" }}
            />
          </Box>
        </Stack>
      </Stack>
    </SlideOver>
  );
}
