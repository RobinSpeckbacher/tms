"use client";

import UnternehmenAutocomplete from "@/components/common/UnternehmenAutocomplete";
import { type VorlageRow, type RecurrenceType } from "@/hooks/useVorlagen";
import type { Unternehmen } from "@/hooks/useUnternehmen";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Checkbox from "@mui/joy/Checkbox";
import Divider from "@mui/joy/Divider";
import Input from "@mui/joy/Input";
import Option from "@mui/joy/Option";
import Select from "@mui/joy/Select";
import Stack from "@mui/joy/Stack";
import Typography from "@mui/joy/Typography";
import {
  FieldLabel,
  focusedInputErrorSx,
  focusedInputSx,
  RecurrenceConfigSection,
  sectionLabelSx,
  SkippedDatesManager,
} from "./VorlagenShared";

export interface TruckVorlagenFormPanelProps {
  isSubmitted: boolean;
  truckVorlageName: string;
  onTruckVorlageNameChange: (value: string) => void;
  licensePlate: string;
  onLicensePlateChange: (value: string) => void;
  selectedFreightCarrier: Unternehmen | null;
  onFreightCarrierChange: (freightCarrier: Unternehmen | null) => void;
  driverName: string;
  onDriverNameChange: (value: string) => void;
  driverPhoneNumber: string;
  onDriverPhoneNumberChange: (value: string) => void;
  vehicleColor: string;
  onVehicleColorChange: (value: string) => void;
  purchaseCost: string;
  onPurchaseCostChange: (value: string) => void;
  pricePerKilometer: string;
  onPricePerKilometerChange: (value: string) => void;
  selectedRelationId: string;
  onRelationIdChange: (value: string) => void;
  availableRelationen: { id: string; nummer: string; name: string }[];
  recurrenceType: RecurrenceType;
  onRecurrenceTypeChange: (type: RecurrenceType) => void;
  selectedWeekdays: number[];
  onToggleWeekday: (isoWeekday: number) => void;
  monthlyDayOfMonth: string;
  onMonthlyDayOfMonthChange: (value: string) => void;
  loadingTime: string;
  onLoadingTimeChange: (value: string) => void;
  unloadingTime: string;
  onUnloadingTimeChange: (value: string) => void;
  offsetDays: string;
  onOffsetDaysChange: (value: string) => void;
  lookaheadDays: string;
  onLookaheadDaysChange: (value: string) => void;
  skippedDates: string[];
  onAddSkippedDate: () => void;
  onRemoveSkippedDate: (dateString: string) => void;
  newSkipDateInputValue: string;
  onNewSkipDateInputChange: (value: string) => void;
  allSendungVorlagen: VorlageRow[];
  linkedSendungVorlageIds: Set<string>;
  onToggleLinkedSendungVorlage: (sendungVorlageId: string) => void;
  onApplyRecurrenceFromSendungVorlage: (vorlage: VorlageRow) => void;
}

export function TruckVorlagenFormPanel(props: TruckVorlagenFormPanelProps) {
  return (
    <Stack spacing={2.5}>
      <FieldLabel
        label="Plan-Name"
        required
        hasError={props.isSubmitted && props.truckVorlageName.trim() === ""}
      >
        <Input
          size="sm"
          value={props.truckVorlageName}
          onChange={(event) =>
            props.onTruckVorlageNameChange(event.target.value)
          }
          placeholder="z.B. WI-123 Montags Wien -> München"
          sx={{
            ...focusedInputSx,
            ...(props.isSubmitted && props.truckVorlageName.trim() === ""
              ? focusedInputErrorSx
              : {}),
          }}
        />
      </FieldLabel>

      <Stack direction="row" spacing={1.5} alignItems="flex-end">
        <Box sx={{ flex: 1 }}>
          <FieldLabel
            label="Kennzeichen"
            required
            hasError={props.isSubmitted && props.licensePlate.trim() === ""}
          >
            <Input
              size="sm"
              value={props.licensePlate}
              onChange={(event) =>
                props.onLicensePlateChange(event.target.value)
              }
              placeholder="z.B. WI-123AB"
              sx={{
                ...focusedInputSx,
                ...(props.isSubmitted && props.licensePlate.trim() === ""
                  ? focusedInputErrorSx
                  : {}),
              }}
            />
          </FieldLabel>
        </Box>
        <Box>
          <FieldLabel label="Farbe">
            <input
              type="color"
              value={props.vehicleColor}
              onChange={(event) =>
                props.onVehicleColorChange(event.target.value)
              }
              style={{
                width: 40,
                height: 34,
                border: "1px solid #d5dbe8",
                borderRadius: 6,
                padding: 2,
                cursor: "pointer",
              }}
            />
          </FieldLabel>
        </Box>
      </Stack>

      <Divider />

      <Typography level="body-xs" sx={sectionLabelSx}>
        Frächter & Fahrer
      </Typography>

      <FieldLabel label="Frächter">
        <UnternehmenAutocomplete
          value={props.selectedFreightCarrier}
          onChange={props.onFreightCarrierChange}
          placeholder="Frächter suchen"
          defaultRollen={["fraechter"]}
        />
      </FieldLabel>

      <Stack direction="row" spacing={1.5}>
        <Box sx={{ flex: 1 }}>
          <FieldLabel label="Fahrer">
            <Input
              size="sm"
              value={props.driverName}
              onChange={(event) => props.onDriverNameChange(event.target.value)}
              placeholder="Name des Fahrers"
              sx={focusedInputSx}
            />
          </FieldLabel>
        </Box>
        <Box sx={{ flex: 1 }}>
          <FieldLabel label="Telefon Fahrer">
            <Input
              size="sm"
              value={props.driverPhoneNumber}
              onChange={(event) =>
                props.onDriverPhoneNumberChange(event.target.value)
              }
              placeholder="+43 123 456 789"
              sx={focusedInputSx}
            />
          </FieldLabel>
        </Box>
      </Stack>

      <Divider />

      <Typography level="body-xs" sx={sectionLabelSx}>
        Kosten & Relation
      </Typography>

      <Stack direction="row" spacing={1.5}>
        <Box sx={{ flex: 1 }}>
          <FieldLabel label="Einkaufspreis (€)">
            <Input
              size="sm"
              type="number"
              value={props.purchaseCost}
              onChange={(event) =>
                props.onPurchaseCostChange(event.target.value)
              }
              placeholder="z.B. 850"
              sx={focusedInputSx}
            />
          </FieldLabel>
        </Box>
        <Box sx={{ flex: 1 }}>
          <FieldLabel label="Preis pro km (€)">
            <Input
              size="sm"
              type="number"
              value={props.pricePerKilometer}
              onChange={(event) =>
                props.onPricePerKilometerChange(event.target.value)
              }
              placeholder="z.B. 1.20"
              sx={focusedInputSx}
            />
          </FieldLabel>
        </Box>
      </Stack>

      <FieldLabel
        label="Relation"
        required
        hasError={props.isSubmitted && props.selectedRelationId === ""}
      >
        <Select
          size="sm"
          value={props.selectedRelationId || null}
          onChange={(_event, value) => props.onRelationIdChange(value ?? "")}
          placeholder="Relation auswählen (optional)"
          sx={{ "--Select-focusedHighlight": "#155dfc", color: "#0f172b" }}
        >
          {props.availableRelationen.map((relation) => (
            <Option key={relation.id} value={relation.id}>
              {relation.nummer} – {relation.name}
            </Option>
          ))}
        </Select>
      </FieldLabel>

      <Divider />

      <Typography level="body-xs" sx={sectionLabelSx}>
        Wiederholung
      </Typography>
      <RecurrenceConfigSection
        recurrenceType={props.recurrenceType}
        onRecurrenceTypeChange={props.onRecurrenceTypeChange}
        selectedWeekdays={props.selectedWeekdays}
        onToggleWeekday={props.onToggleWeekday}
        monthlyDayOfMonth={props.monthlyDayOfMonth}
        onMonthlyDayOfMonthChange={props.onMonthlyDayOfMonthChange}
        loadingTime={props.loadingTime}
        onLoadingTimeChange={props.onLoadingTimeChange}
        unloadingTime={props.unloadingTime}
        onUnloadingTimeChange={props.onUnloadingTimeChange}
        offsetDaysValue={props.offsetDays}
        onOffsetDaysChange={props.onOffsetDaysChange}
        lookaheadDaysValue={props.lookaheadDays}
        onLookaheadDaysChange={props.onLookaheadDaysChange}
      />

      <Divider />

      <Typography level="body-xs" sx={sectionLabelSx}>
        Ausnahmen (ausgenommene Termine)
      </Typography>
      <SkippedDatesManager
        skippedDates={props.skippedDates}
        onAddDate={props.onAddSkippedDate}
        onRemoveDate={props.onRemoveSkippedDate}
        newDateInputValue={props.newSkipDateInputValue}
        onNewDateInputChange={props.onNewSkipDateInputChange}
      />

      <Divider />

      <Typography level="body-xs" sx={sectionLabelSx}>
        Verknüpfte Sendungs-Vorlagen
      </Typography>
      <Typography level="body-xs" sx={{ color: "#94a3b8" }}>
        Diese Sendungen werden automatisch erstellt und dem LKW zugewiesen.
      </Typography>

      {props.allSendungVorlagen.length === 0 ? (
        <Typography
          level="body-xs"
          sx={{ color: "#57688e", fontStyle: "italic" }}
        >
          Noch keine Sendungs-Vorlagen vorhanden. Erstelle zuerst
          Sendungs-Vorlagen.
        </Typography>
      ) : (
        <Stack spacing={0.75}>
          {props.allSendungVorlagen.map((sendungVorlage) => (
            <Box
              key={sendungVorlage.id}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                p: 1,
                borderRadius: "6px",
                border: "1px solid",
                borderColor: props.linkedSendungVorlageIds.has(
                  sendungVorlage.id,
                )
                  ? "#155dfc"
                  : "#e8ecf4",
                bgcolor: props.linkedSendungVorlageIds.has(sendungVorlage.id)
                  ? "#eff6ff"
                  : "#fff",
                cursor: "pointer",
                transition: "all 0.15s",
                "&:hover": { borderColor: "#155dfc" },
              }}
              onClick={() =>
                props.onToggleLinkedSendungVorlage(sendungVorlage.id)
              }
            >
              <Checkbox
                size="sm"
                checked={props.linkedSendungVorlageIds.has(sendungVorlage.id)}
                onChange={() =>
                  props.onToggleLinkedSendungVorlage(sendungVorlage.id)
                }
                sx={{ "--Checkbox-size": "16px" }}
              />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  level="body-xs"
                  sx={{ fontWeight: 600, color: "#0f172b" }}
                  noWrap
                >
                  {sendungVorlage.name}
                </Typography>
                <Typography level="body-xs" sx={{ color: "#57688e" }} noWrap>
                  {sendungVorlage.lade_ort}
                  {" -> "}
                  {sendungVorlage.entlade_ort}
                </Typography>
              </Box>
              {props.linkedSendungVorlageIds.has(sendungVorlage.id) && (
                <Button
                  size="sm"
                  variant="soft"
                  color="neutral"
                  onClick={(event) => {
                    event.stopPropagation();
                    props.onApplyRecurrenceFromSendungVorlage(sendungVorlage);
                  }}
                  sx={{
                    fontSize: "0.65rem",
                    fontWeight: 600,
                    px: 1,
                    py: 0.25,
                    minHeight: 0,
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}
                >
                  Wiederholung übernehmen
                </Button>
              )}
            </Box>
          ))}
        </Stack>
      )}
    </Stack>
  );
}
