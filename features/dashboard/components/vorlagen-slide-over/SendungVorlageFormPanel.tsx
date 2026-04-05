"use client";

import PlzOrtInput from "@/components/common/PlzOrtInput";
import UnternehmenAutocomplete from "@/components/common/UnternehmenAutocomplete";
import { type RecurrenceType } from "@/hooks/useVorlagen";
import type { Unternehmen } from "@/hooks/useUnternehmen";
import Box from "@mui/joy/Box";
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
  PACKAGING_UNIT_OPTIONS,
  RecurrenceConfigSection,
  sectionLabelSx,
  SkippedDatesManager,
} from "./VorlagenShared";

export interface SendungVorlagenFormPanelProps {
  isSubmitted: boolean;
  vorlageName: string;
  onVorlageNameChange: (value: string) => void;
  selectedKunde: Unternehmen | null;
  onKundeChange: (kunde: Unternehmen | null) => void;
  loadingPostalCode: string;
  onLoadingPostalCodeChange: (value: string) => void;
  loadingCity: string;
  onLoadingCityChange: (value: string) => void;
  loadingStreetAddress: string;
  onLoadingStreetAddressChange: (value: string) => void;
  loadingCountryCode: string;
  onLoadingCountryCodeChange: (value: string) => void;
  unloadingPostalCode: string;
  onUnloadingPostalCodeChange: (value: string) => void;
  unloadingCity: string;
  onUnloadingCityChange: (value: string) => void;
  unloadingStreetAddress: string;
  onUnloadingStreetAddressChange: (value: string) => void;
  unloadingCountryCode: string;
  onUnloadingCountryCodeChange: (value: string) => void;
  weightInKilograms: string;
  onWeightInKilogramsChange: (value: string) => void;
  packagingUnit: string;
  onPackagingUnitChange: (value: string) => void;
  packageCount: string;
  onPackageCountChange: (value: string) => void;
  loadingMeters: string;
  onLoadingMetersChange: (value: string) => void;
  salesPrice: string;
  onSalesPriceChange: (value: string) => void;
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
}

export function SendungVorlagenFormPanel(props: SendungVorlagenFormPanelProps) {
  return (
    <Stack spacing={2.5}>
      <FieldLabel
        label="Vorlagen-Name"
        required
        hasError={props.isSubmitted && props.vorlageName.trim() === ""}
      >
        <Input
          size="sm"
          value={props.vorlageName}
          onChange={(event) => props.onVorlageNameChange(event.target.value)}
          placeholder="z.B. Wien -> München wöchentlich"
          sx={{
            ...focusedInputSx,
            ...(props.isSubmitted && props.vorlageName.trim() === ""
              ? focusedInputErrorSx
              : {}),
          }}
        />
      </FieldLabel>

      <FieldLabel label="Kunde">
        <UnternehmenAutocomplete
          value={props.selectedKunde}
          onChange={props.onKundeChange}
          placeholder="Kundenname oder Kundennr."
          defaultRollen={["kunde"]}
        />
      </FieldLabel>

      <Divider />

      <Typography level="body-xs" sx={sectionLabelSx}>
        Ladeort *
      </Typography>
      <PlzOrtInput
        plz={props.loadingPostalCode}
        ort={props.loadingCity}
        land={props.loadingCountryCode}
        onPlzChange={props.onLoadingPostalCodeChange}
        onOrtChange={props.onLoadingCityChange}
        onLandChange={props.onLoadingCountryCodeChange}
        required
        error={props.isSubmitted && props.loadingCity.trim() === ""}
      />
      <FieldLabel label="Adresse">
        <Input
          size="sm"
          value={props.loadingStreetAddress}
          onChange={(event) =>
            props.onLoadingStreetAddressChange(event.target.value)
          }
          placeholder="z.B. Industriestraße 12"
          sx={focusedInputSx}
        />
      </FieldLabel>

      <Typography level="body-xs" sx={sectionLabelSx}>
        Entladeort *
      </Typography>
      <PlzOrtInput
        plz={props.unloadingPostalCode}
        ort={props.unloadingCity}
        land={props.unloadingCountryCode}
        onPlzChange={props.onUnloadingPostalCodeChange}
        onOrtChange={props.onUnloadingCityChange}
        onLandChange={props.onUnloadingCountryCodeChange}
        required
        error={props.isSubmitted && props.unloadingCity.trim() === ""}
      />
      <FieldLabel label="Adresse">
        <Input
          size="sm"
          value={props.unloadingStreetAddress}
          onChange={(event) =>
            props.onUnloadingStreetAddressChange(event.target.value)
          }
          placeholder="z.B. Lagerweg 5"
          sx={focusedInputSx}
        />
      </FieldLabel>

      <Divider />

      <Typography level="body-xs" sx={sectionLabelSx}>
        Ladung
      </Typography>
      <Stack direction="row" spacing={1.5}>
        <Box sx={{ flex: 1 }}>
          <FieldLabel label="Gewicht (kg)">
            <Input
              size="sm"
              type="number"
              value={props.weightInKilograms}
              onChange={(event) =>
                props.onWeightInKilogramsChange(event.target.value)
              }
              placeholder="z.B. 12000"
              sx={focusedInputSx}
            />
          </FieldLabel>
        </Box>
        <Box sx={{ flex: 1 }}>
          <FieldLabel label="Verkaufspreis (€)">
            <Input
              size="sm"
              type="number"
              value={props.salesPrice}
              onChange={(event) => props.onSalesPriceChange(event.target.value)}
              placeholder="Preis"
              sx={focusedInputSx}
            />
          </FieldLabel>
        </Box>
      </Stack>
      <Stack direction="row" spacing={1.5}>
        <Box sx={{ flex: 2 }}>
          <FieldLabel label="Packungseinheit">
            <Select
              size="sm"
              value={props.packagingUnit}
              onChange={(_event, value) => {
                if (value != null && value !== "") {
                  props.onPackagingUnitChange(value);
                }
              }}
              sx={{ "--Select-focusedHighlight": "#155dfc", color: "#0f172b" }}
            >
              {PACKAGING_UNIT_OPTIONS.map((option) => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </FieldLabel>
        </Box>
        <Box sx={{ flex: 1 }}>
          <FieldLabel label="Anzahl">
            <Input
              size="sm"
              type="number"
              value={props.packageCount}
              onChange={(event) =>
                props.onPackageCountChange(event.target.value)
              }
              placeholder="z.B. 33"
              sx={focusedInputSx}
            />
          </FieldLabel>
        </Box>
        <Box sx={{ flex: 1 }}>
          <FieldLabel label="LDM">
            <Input
              size="sm"
              type="number"
              value={props.loadingMeters}
              onChange={(event) =>
                props.onLoadingMetersChange(event.target.value)
              }
              placeholder="auto"
              sx={focusedInputSx}
            />
          </FieldLabel>
        </Box>
      </Stack>

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
    </Stack>
  );
}
