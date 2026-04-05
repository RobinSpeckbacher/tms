"use client";

import Box from "@mui/joy/Box";
import Divider from "@mui/joy/Divider";
import Input from "@mui/joy/Input";
import Option from "@mui/joy/Option";
import Select from "@mui/joy/Select";
import Stack from "@mui/joy/Stack";
import Typography from "@mui/joy/Typography";
import UnternehmenAutocomplete from "@/components/common/UnternehmenAutocomplete";
import type { Unternehmen } from "@/hooks/useUnternehmen";
import {
  truckInputStyles,
  truckStatusOptions,
  TruckFormField,
  type TruckOperationalStatus,
} from "./TruckFormSections";

export interface TruckFormVehicleTabProps {
  vehicleTypeOptions: { id: string; label: string }[];
  colorOptions: string[];
  licensePlate: string;
  onLicensePlateChange: (value: string) => void;
  freightCarrier: Unternehmen | null;
  onFreightCarrierChange: (value: Unternehmen | null) => void;
  driverName: string;
  onDriverNameChange: (value: string) => void;
  driverPhoneNumber: string;
  onDriverPhoneNumberChange: (value: string) => void;
  vehicleTypeId: string;
  onVehicleTypeIdChange: (value: string) => void;
  selectedColor: string;
  onSelectedColorChange: (value: string) => void;
}

export function TruckFormVehicleTab(props: TruckFormVehicleTabProps) {
  return (
    <Stack spacing={2}>
      <TruckFormField label="Kennzeichen" required>
        <Input
          autoFocus
          size="sm"
          required
          value={props.licensePlate}
          onChange={(event) => props.onLicensePlateChange(event.target.value)}
          placeholder="z.B. W-12345X"
          sx={truckInputStyles}
        />
      </TruckFormField>

      <TruckFormField label="Frächter">
        <UnternehmenAutocomplete
          rolle="fraechter"
          value={props.freightCarrier}
          onChange={props.onFreightCarrierChange}
          placeholder="Name oder Kundennr."
          defaultRollen={["fraechter"]}
        />
      </TruckFormField>

      <Stack direction="row" spacing={1.5}>
        <TruckFormField label="Fahrer">
          <Input
            size="sm"
            value={props.driverName}
            onChange={(event) => props.onDriverNameChange(event.target.value)}
            placeholder="Vor- & Nachname"
            sx={truckInputStyles}
          />
        </TruckFormField>
        <TruckFormField label="Telefon Fahrer">
          <Input
            size="sm"
            type="tel"
            value={props.driverPhoneNumber}
            onChange={(event) =>
              props.onDriverPhoneNumberChange(event.target.value)
            }
            placeholder="+43 …"
            sx={truckInputStyles}
          />
        </TruckFormField>
      </Stack>

      <TruckFormField label="Fahrzeugtyp">
        <Select
          size="sm"
          value={props.vehicleTypeId}
          onChange={(_event, value) => {
            if (value != null && value !== "") {
              props.onVehicleTypeIdChange(value);
            }
          }}
          sx={{
            "--Select-focusedHighlight": "#155dfc",
            color: "#0f172b",
          }}
        >
          {props.vehicleTypeOptions.map((vehicleTypeOption) => (
            <Option key={vehicleTypeOption.id} value={vehicleTypeOption.id}>
              {vehicleTypeOption.label}
            </Option>
          ))}
        </Select>
      </TruckFormField>

      <TruckFormField label="Farbe">
        <Stack direction="row" spacing={1}>
          {props.colorOptions.map((colorValue) => (
            <Box
              key={colorValue}
              onClick={() => props.onSelectedColorChange(colorValue)}
              sx={{
                width: 24,
                height: 24,
                borderRadius: "50%",
                backgroundColor: colorValue,
                cursor: "pointer",
                border:
                  props.selectedColor === colorValue
                    ? "2px solid #0f172b"
                    : "2px solid transparent",
                transform:
                  props.selectedColor === colorValue
                    ? "scale(1.15)"
                    : "scale(1)",
                transition: "all 0.15s",
              }}
            />
          ))}
        </Stack>
      </TruckFormField>
    </Stack>
  );
}

export interface TruckFormPlanningTabProps {
  relationOptions: {
    id: string;
    nummer: string;
    name: string;
    farbe: string | null;
  }[];
  loadingDate: string;
  onLoadingDateChange: (value: string) => void;
  loadingTime: string;
  onLoadingTimeChange: (value: string) => void;
  unloadingDate: string;
  onUnloadingDateChange: (value: string) => void;
  unloadingTime: string;
  onUnloadingTimeChange: (value: string) => void;
  relationId: string;
  onRelationIdChange: (value: string) => void;
  status: TruckOperationalStatus;
  onStatusChange: (value: TruckOperationalStatus) => void;
  maximumPallets: string;
  onMaximumPalletsChange: (value: string) => void;
  maximumWeightInKilograms: string;
  onMaximumWeightInKilogramsChange: (value: string) => void;
  loadingMeterCapacity: string;
  onLoadingMeterCapacityChange: (value: string) => void;
}

export function TruckFormPlanningTab(props: TruckFormPlanningTabProps) {
  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={1.5}>
        <Box sx={{ flex: 1 }}>
          <TruckFormField label="Ladedatum" required>
            <Input
              size="sm"
              type="date"
              value={props.loadingDate}
              onChange={(event) =>
                props.onLoadingDateChange(event.target.value)
              }
              sx={truckInputStyles}
            />
          </TruckFormField>
        </Box>
        <Box sx={{ width: 120 }}>
          <TruckFormField label="Uhrzeit">
            <Input
              size="sm"
              type="time"
              value={props.loadingTime}
              onChange={(event) =>
                props.onLoadingTimeChange(event.target.value)
              }
              sx={truckInputStyles}
            />
          </TruckFormField>
        </Box>
      </Stack>

      <Stack direction="row" spacing={1.5}>
        <Box sx={{ flex: 1 }}>
          <TruckFormField label="Entladedatum" required>
            <Input
              size="sm"
              type="date"
              value={props.unloadingDate}
              onChange={(event) =>
                props.onUnloadingDateChange(event.target.value)
              }
              sx={truckInputStyles}
            />
          </TruckFormField>
        </Box>
        <Box sx={{ width: 120 }}>
          <TruckFormField label="Uhrzeit">
            <Input
              size="sm"
              type="time"
              value={props.unloadingTime}
              onChange={(event) =>
                props.onUnloadingTimeChange(event.target.value)
              }
              sx={truckInputStyles}
            />
          </TruckFormField>
        </Box>
      </Stack>

      <TruckFormField label="Relation" required>
        <Select
          size="sm"
          value={props.relationId}
          onChange={(_event, value) => {
            props.onRelationIdChange(value ?? "");
          }}
          placeholder="Keine Relation"
          sx={{
            "--Select-focusedHighlight": "#155dfc",
            color: "#0f172b",
          }}
        >
          {props.relationOptions.map((relationOption) => (
            <Option key={relationOption.id} value={relationOption.id}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    bgcolor: relationOption.farbe ?? "#155dfc",
                    flexShrink: 0,
                  }}
                />
                {relationOption.nummer} – {relationOption.name}
              </Box>
            </Option>
          ))}
        </Select>
      </TruckFormField>

      <TruckFormField label="Status">
        <Select
          size="sm"
          value={props.status}
          onChange={(_event, value) => {
            if (value != null) {
              props.onStatusChange(value as TruckOperationalStatus);
            }
          }}
          renderValue={(selected) => {
            const selectedStatusOption = truckStatusOptions.find(
              (statusOption) => statusOption.value === selected?.value,
            );
            return selectedStatusOption ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    bgcolor: selectedStatusOption.color,
                    flexShrink: 0,
                  }}
                />
                {selectedStatusOption.label}
              </Box>
            ) : null;
          }}
          sx={{
            "--Select-focusedHighlight": "#155dfc",
            color: "#0f172b",
          }}
        >
          {truckStatusOptions.map((statusOption) => (
            <Option key={statusOption.value} value={statusOption.value}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    bgcolor: statusOption.color,
                    flexShrink: 0,
                  }}
                />
                {statusOption.label}
              </Box>
            </Option>
          ))}
        </Select>
      </TruckFormField>

      <Divider />
      <Typography level="body-xs" sx={{ color: "#57688e", fontWeight: 600 }}>
        Kapazitäten
      </Typography>

      <Stack direction="row" spacing={1.5}>
        <TruckFormField label="Max Paletten">
          <Input
            size="sm"
            type="number"
            value={props.maximumPallets}
            onChange={(event) =>
              props.onMaximumPalletsChange(event.target.value)
            }
            placeholder="z.B. 33"
            sx={truckInputStyles}
          />
        </TruckFormField>
        <TruckFormField label="Max Gewicht (kg)">
          <Input
            size="sm"
            type="number"
            value={props.maximumWeightInKilograms}
            onChange={(event) =>
              props.onMaximumWeightInKilogramsChange(event.target.value)
            }
            placeholder="z.B. 24000"
            sx={truckInputStyles}
          />
        </TruckFormField>
      </Stack>

      <TruckFormField label="Lademeter (ldm)">
        <Input
          size="sm"
          type="number"
          value={props.loadingMeterCapacity}
          onChange={(event) =>
            props.onLoadingMeterCapacityChange(event.target.value)
          }
          placeholder="z.B. 13.6"
          sx={truckInputStyles}
        />
      </TruckFormField>
    </Stack>
  );
}

export interface TruckFormPricingTabProps {
  pricePerKilometer: string;
  onPricePerKilometerChange: (value: string) => void;
  purchaseCost: string;
  onPurchaseCostChange: (value: string) => void;
}

export function TruckFormPricingTab(props: TruckFormPricingTabProps) {
  return (
    <Stack spacing={2}>
      <TruckFormField label="Preis pro km (€)">
        <Input
          size="sm"
          type="number"
          value={props.pricePerKilometer}
          onChange={(event) =>
            props.onPricePerKilometerChange(event.target.value)
          }
          placeholder="z.B. 1.20"
          sx={truckInputStyles}
        />
      </TruckFormField>

      <TruckFormField label="Kosten (€)">
        <Input
          size="sm"
          type="number"
          value={props.purchaseCost}
          onChange={(event) => props.onPurchaseCostChange(event.target.value)}
          placeholder="Einkaufspreis"
          sx={truckInputStyles}
        />
      </TruckFormField>
    </Stack>
  );
}
