"use client";

import { Pencil, RefreshCw, Trash2, Truck } from "lucide-react";
import type { TruckVorlageRow } from "@/hooks/useTruckVorlagen";
import Box from "@mui/joy/Box";
import Chip from "@mui/joy/Chip";
import IconButton from "@mui/joy/IconButton";
import Stack from "@mui/joy/Stack";
import Switch from "@mui/joy/Switch";
import Typography from "@mui/joy/Typography";
import {
  buildRecurrenceSummaryLabel,
  findNextUpcomingDate,
} from "./VorlagenShared";

export function TruckVorlagenListPanel({
  truckVorlagen,
  isLoading,
  onEditTruckVorlage,
  onDeleteTruckVorlage,
  onToggleTruckVorlageActive,
  onGenerateForTruckVorlage,
  isGenerationRunning,
}: {
  truckVorlagen: TruckVorlageRow[];
  isLoading: boolean;
  onEditTruckVorlage: (truckVorlage: TruckVorlageRow) => void;
  onDeleteTruckVorlage: (truckVorlageId: string) => void;
  onToggleTruckVorlageActive: (
    truckVorlageId: string,
    isActive: boolean,
  ) => void;
  onGenerateForTruckVorlage: (truckVorlage: TruckVorlageRow) => void;
  isGenerationRunning: boolean;
}) {
  if (isLoading) {
    return (
      <Stack spacing={1.5}>
        {[1, 2, 3].map((index) => (
          <Box
            key={index}
            sx={{ height: 68, borderRadius: "8px", bgcolor: "#f1f5f9" }}
          />
        ))}
      </Stack>
    );
  }

  if (truckVorlagen.length === 0) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          py: 8,
          gap: 1,
        }}
      >
        <Truck className="h-8 w-8 text-[#d5dbe8]" />
        <Typography level="body-sm" sx={{ color: "#57688e" }}>
          Noch keine LKW-Pläne angelegt
        </Typography>
        <Typography
          level="body-xs"
          sx={{ color: "#94a3b8", textAlign: "center" }}
        >
          Erstelle einen LKW-Plan um LKW und deren Sendungen automatisch zu
          generieren.
        </Typography>
      </Box>
    );
  }

  const hasText = (value: string | null | undefined) =>
    typeof value === "string" && value.trim().length > 0;

  return (
    <Stack spacing={1.5}>
      {truckVorlagen.map((truckVorlage) => (
        <Box
          key={truckVorlage.id}
          sx={{
            border: "1px solid #e8ecf4",
            borderRadius: "8px",
            p: 1.5,
            bgcolor: truckVorlage.active === true ? "#fff" : "#f8f9fb",
            opacity: truckVorlage.active === true ? 1 : 0.65,
          }}
        >
          <Stack
            direction="row"
            alignItems="flex-start"
            justifyContent="space-between"
          >
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Stack
                direction="row"
                alignItems="center"
                spacing={0.75}
                sx={{ mb: 0.25 }}
              >
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    bgcolor: truckVorlage.fahrzeug_farbe,
                    flexShrink: 0,
                  }}
                />
                <Typography
                  level="body-sm"
                  sx={{ fontWeight: 600, color: "#0f172b" }}
                >
                  {truckVorlage.name}
                </Typography>
              </Stack>

              <Typography level="body-xs" sx={{ color: "#57688e", mb: 0.5 }}>
                {truckVorlage.kennzeichen}
                {hasText(truckVorlage.fahrer)
                  ? ` · ${truckVorlage.fahrer}`
                  : ""}
              </Typography>

              <Stack direction="row" spacing={0.75} flexWrap="wrap">
                <Chip
                  size="sm"
                  variant="soft"
                  sx={{
                    fontSize: "0.65rem",
                    bgcolor: "#eff6ff",
                    color: "#155dfc",
                  }}
                >
                  {buildRecurrenceSummaryLabel(
                    truckVorlage.recurrence_type,
                    truckVorlage.recurrence_days,
                  )}
                </Chip>
                {truckVorlage.recurrence_type !== "none" && (
                  <Chip
                    size="sm"
                    variant="soft"
                    sx={{
                      fontSize: "0.65rem",
                      bgcolor: "#f1f5f9",
                      color: "#57688e",
                    }}
                  >
                    Nächster: {findNextUpcomingDate(truckVorlage)}
                  </Chip>
                )}
                {truckVorlage.linked_sendung_vorlagen.length > 0 && (
                  <Chip
                    size="sm"
                    variant="soft"
                    sx={{
                      fontSize: "0.65rem",
                      bgcolor: "#f0fdf4",
                      color: "#15803d",
                    }}
                  >
                    {truckVorlage.linked_sendung_vorlagen.length} Sendung
                    {truckVorlage.linked_sendung_vorlagen.length !== 1
                      ? "en"
                      : ""}
                  </Chip>
                )}
                {truckVorlage.skipped_dates.length > 0 && (
                  <Chip
                    size="sm"
                    variant="soft"
                    sx={{
                      fontSize: "0.65rem",
                      bgcolor: "#fff0f0",
                      color: "#ef4444",
                    }}
                  >
                    {truckVorlage.skipped_dates.length} Ausnahme
                    {truckVorlage.skipped_dates.length !== 1 ? "n" : ""}
                  </Chip>
                )}
              </Stack>
            </Box>

            <Stack
              direction="row"
              alignItems="center"
              spacing={0.5}
              sx={{ ml: 1, flexShrink: 0 }}
            >
              <Switch
                size="sm"
                checked={truckVorlage.active}
                onChange={(event) =>
                  onToggleTruckVorlageActive(
                    truckVorlage.id,
                    event.target.checked,
                  )
                }
                sx={{
                  "--Switch-trackBackground":
                    truckVorlage.active === true ? "#155dfc" : "#d5dbe8",
                  "--Switch-trackWidth": "32px",
                  "--Switch-trackHeight": "18px",
                }}
              />
              <IconButton
                size="sm"
                variant="plain"
                disabled={
                  isGenerationRunning ||
                  truckVorlage.active !== true ||
                  truckVorlage.recurrence_type === "none"
                }
                onClick={() => onGenerateForTruckVorlage(truckVorlage)}
                title="LKW und Aufträge jetzt generieren"
                sx={{ color: "#57688e", minWidth: 0, px: 0.5 }}
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </IconButton>
              <IconButton
                size="sm"
                variant="plain"
                onClick={() => onEditTruckVorlage(truckVorlage)}
                sx={{ color: "#57688e", minWidth: 0, px: 0.5 }}
              >
                <Pencil className="h-3.5 w-3.5" />
              </IconButton>
              <IconButton
                size="sm"
                variant="plain"
                color="danger"
                onClick={() => {
                  if (
                    confirm(`LKW-Plan "${truckVorlage.name}" wirklich löschen?`)
                  ) {
                    onDeleteTruckVorlage(truckVorlage.id);
                  }
                }}
                sx={{ minWidth: 0, px: 0.5 }}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </IconButton>
            </Stack>
          </Stack>
        </Box>
      ))}
    </Stack>
  );
}
