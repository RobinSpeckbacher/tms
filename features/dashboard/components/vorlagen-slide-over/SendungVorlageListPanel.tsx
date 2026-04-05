"use client";

import { Pencil, RefreshCw, RepeatIcon, Trash2, Truck } from "lucide-react";
import { type VorlageRow } from "@/hooks/useVorlagen";
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

export function SendungVorlagenListPanel({
  vorlagen,
  isLoading,
  onEditVorlage,
  onDeleteVorlage,
  onToggleVorlageActive,
  onGenerateForVorlage,
  isGenerationRunning,
}: {
  vorlagen: VorlageRow[];
  isLoading: boolean;
  onEditVorlage: (vorlage: VorlageRow) => void;
  onDeleteVorlage: (vorlageId: string) => void;
  onToggleVorlageActive: (vorlageId: string, isActive: boolean) => void;
  onGenerateForVorlage: (vorlage: VorlageRow) => void;
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

  if (vorlagen.length === 0) {
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
        <RepeatIcon className="h-8 w-8 text-[#d5dbe8]" />
        <Typography level="body-sm" sx={{ color: "#57688e" }}>
          Noch keine Sendungs-Vorlagen angelegt
        </Typography>
      </Box>
    );
  }

  return (
    <Stack spacing={1.5}>
      {vorlagen.map((vorlage) => {
        const isLinkedToTruck = (vorlage.truck_vorlage_links?.length ?? 0) > 0;
        return (
          <Box
            key={vorlage.id}
            sx={{
              border: "1px solid #e8ecf4",
              borderRadius: "8px",
              p: 1.5,
              bgcolor: vorlage.active === true ? "#fff" : "#f8f9fb",
              opacity: vorlage.active === true ? 1 : 0.65,
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
                  <Typography
                    level="body-sm"
                    sx={{ fontWeight: 600, color: "#0f172b" }}
                  >
                    {vorlage.name}
                  </Typography>
                  {isLinkedToTruck && (
                    <Chip
                      size="sm"
                      variant="soft"
                      startDecorator={<Truck className="h-2.5 w-2.5" />}
                      sx={{
                        fontSize: "0.6rem",
                        bgcolor: "#eff6ff",
                        color: "#155dfc",
                      }}
                    >
                      LKW-Plan
                    </Chip>
                  )}
                </Stack>
                <Typography
                  level="body-xs"
                  sx={{ color: "#57688e", mb: 0.5 }}
                  noWrap
                >
                  {vorlage.lade_ort}
                  {" -> "}
                  {vorlage.entlade_ort}
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
                      vorlage.recurrence_type,
                      vorlage.recurrence_days,
                    )}
                  </Chip>
                  {vorlage.recurrence_type !== "none" && (
                    <Chip
                      size="sm"
                      variant="soft"
                      sx={{
                        fontSize: "0.65rem",
                        bgcolor: "#f1f5f9",
                        color: "#57688e",
                      }}
                    >
                      Nächster: {findNextUpcomingDate(vorlage)}
                    </Chip>
                  )}
                  {(vorlage.skipped_dates?.length ?? 0) > 0 && (
                    <Chip
                      size="sm"
                      variant="soft"
                      sx={{
                        fontSize: "0.65rem",
                        bgcolor: "#fff0f0",
                        color: "#ef4444",
                      }}
                    >
                      {vorlage.skipped_dates.length} Ausnahme
                      {vorlage.skipped_dates.length !== 1 ? "n" : ""}
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
                  checked={vorlage.active}
                  onChange={(event) =>
                    onToggleVorlageActive(vorlage.id, event.target.checked)
                  }
                  sx={{
                    "--Switch-trackBackground":
                      vorlage.active === true ? "#155dfc" : "#d5dbe8",
                    "--Switch-trackWidth": "32px",
                    "--Switch-trackHeight": "18px",
                  }}
                />
                <IconButton
                  size="sm"
                  variant="plain"
                  disabled={
                    isGenerationRunning ||
                    vorlage.active !== true ||
                    vorlage.recurrence_type === "none" ||
                    isLinkedToTruck
                  }
                  onClick={() => onGenerateForVorlage(vorlage)}
                  title={
                    isLinkedToTruck
                      ? "Wird vom LKW-Plan generiert"
                      : "Aufträge jetzt generieren"
                  }
                  sx={{ color: "#57688e", minWidth: 0, px: 0.5 }}
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                </IconButton>
                <IconButton
                  size="sm"
                  variant="plain"
                  onClick={() => onEditVorlage(vorlage)}
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
                      confirm(`Vorlage "${vorlage.name}" wirklich löschen?`)
                    ) {
                      onDeleteVorlage(vorlage.id);
                    }
                  }}
                  sx={{ minWidth: 0, px: 0.5 }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </IconButton>
              </Stack>
            </Stack>
          </Box>
        );
      })}
    </Stack>
  );
}
