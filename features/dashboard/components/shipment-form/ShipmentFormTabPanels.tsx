"use client";

import Box from "@mui/joy/Box";
import Divider from "@mui/joy/Divider";
import Input from "@mui/joy/Input";
import Option from "@mui/joy/Option";
import Select from "@mui/joy/Select";
import Stack from "@mui/joy/Stack";
import Typography from "@mui/joy/Typography";
import PlzOrtInput from "@/components/common/PlzOrtInput";
import {
  packagingUnitOptions,
  shipmentInputStyles,
  ShipmentFormField,
} from "./ShipmentFormSections";

export interface ShipmentAddressTabProps {
  isSubmitted: boolean;
  loadingPostalCode: string;
  onLoadingPostalCodeChange: (value: string) => void;
  loadingCity: string;
  onLoadingCityChange: (value: string) => void;
  loadingCountryCode: string;
  onLoadingCountryCodeChange: (value: string) => void;
  loadingStreetAddress: string;
  onLoadingStreetAddressChange: (value: string) => void;
  unloadingPostalCode: string;
  onUnloadingPostalCodeChange: (value: string) => void;
  unloadingCity: string;
  onUnloadingCityChange: (value: string) => void;
  unloadingCountryCode: string;
  onUnloadingCountryCodeChange: (value: string) => void;
  unloadingStreetAddress: string;
  onUnloadingStreetAddressChange: (value: string) => void;
}

export function ShipmentAddressTab(props: ShipmentAddressTabProps) {
  const hasLoadingAddressError =
    props.isSubmitted &&
    (props.loadingPostalCode.trim() === "" ||
      props.loadingCity.trim() === "" ||
      props.loadingCountryCode.trim() === "");

  const hasUnloadingAddressError =
    props.isSubmitted &&
    (props.unloadingPostalCode.trim() === "" ||
      props.unloadingCity.trim() === "" ||
      props.unloadingCountryCode.trim() === "");

  return (
    <Stack spacing={2}>
      <Typography
        level="body-xs"
        sx={{
          color: hasLoadingAddressError ? "#ef4444" : "#57688e",
          fontWeight: 600,
        }}
      >
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
        error={hasLoadingAddressError}
      />

      <ShipmentFormField label="Adresse">
        <Input
          size="sm"
          value={props.loadingStreetAddress}
          onChange={(event) =>
            props.onLoadingStreetAddressChange(event.target.value)
          }
          placeholder="z.B. Industriestraße 12"
          sx={shipmentInputStyles}
        />
      </ShipmentFormField>

      <Divider />

      <Typography
        level="body-xs"
        sx={{
          color: hasUnloadingAddressError ? "#ef4444" : "#57688e",
          fontWeight: 600,
        }}
      >
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
        error={hasUnloadingAddressError}
      />

      <ShipmentFormField label="Adresse">
        <Input
          size="sm"
          value={props.unloadingStreetAddress}
          onChange={(event) =>
            props.onUnloadingStreetAddressChange(event.target.value)
          }
          placeholder="z.B. Lagerweg 5"
          sx={shipmentInputStyles}
        />
      </ShipmentFormField>
    </Stack>
  );
}

export interface ShipmentDetailsTabProps {
  loadingDate: string;
  onLoadingDateChange: (value: string) => void;
  loadingTime: string;
  onLoadingTimeChange: (value: string) => void;
  unloadingDate: string;
  onUnloadingDateChange: (value: string) => void;
  unloadingTime: string;
  onUnloadingTimeChange: (value: string) => void;
  grossWeightInKilograms: string;
  onGrossWeightInKilogramsChange: (value: string) => void;
  packagingUnit: string;
  onPackagingUnitChange: (value: string) => void;
  packageCount: string;
  onPackageCountChange: (value: string) => void;
  loadingMeters: string;
  onLoadingMetersChange: (value: string) => void;
  hasCustomLoadingMeters: boolean;
}

export function ShipmentDetailsTab(props: ShipmentDetailsTabProps) {
  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={1.5}>
        <Box sx={{ flex: 1 }}>
          <ShipmentFormField label="Ladedatum" required>
            <Input
              size="sm"
              type="date"
              value={props.loadingDate}
              onChange={(event) =>
                props.onLoadingDateChange(event.target.value)
              }
              sx={shipmentInputStyles}
            />
          </ShipmentFormField>
        </Box>
        <Box sx={{ width: 120 }}>
          <ShipmentFormField label="Uhrzeit">
            <Input
              size="sm"
              type="time"
              value={props.loadingTime}
              onChange={(event) =>
                props.onLoadingTimeChange(event.target.value)
              }
              sx={shipmentInputStyles}
            />
          </ShipmentFormField>
        </Box>
      </Stack>

      <Stack direction="row" spacing={1.5}>
        <Box sx={{ flex: 1 }}>
          <ShipmentFormField label="Entladedatum" required>
            <Input
              size="sm"
              type="date"
              value={props.unloadingDate}
              onChange={(event) =>
                props.onUnloadingDateChange(event.target.value)
              }
              sx={shipmentInputStyles}
            />
          </ShipmentFormField>
        </Box>
        <Box sx={{ width: 120 }}>
          <ShipmentFormField label="Uhrzeit">
            <Input
              size="sm"
              type="time"
              value={props.unloadingTime}
              onChange={(event) =>
                props.onUnloadingTimeChange(event.target.value)
              }
              sx={shipmentInputStyles}
            />
          </ShipmentFormField>
        </Box>
      </Stack>

      <Divider />
      <Typography level="body-xs" sx={{ color: "#57688e", fontWeight: 600 }}>
        Ladung
      </Typography>

      <ShipmentFormField label="Gewicht (kg)">
        <Input
          size="sm"
          type="number"
          value={props.grossWeightInKilograms}
          onChange={(event) =>
            props.onGrossWeightInKilogramsChange(event.target.value)
          }
          placeholder="z.B. 12000"
          sx={shipmentInputStyles}
        />
      </ShipmentFormField>

      <ShipmentFormField label="Packungseinheit">
        <Select
          size="sm"
          value={props.packagingUnit}
          onChange={(_event, value) => {
            if (value != null && value !== "") {
              props.onPackagingUnitChange(value);
            }
          }}
          sx={{
            "--Select-focusedHighlight": "#155dfc",
            color: "#0f172b",
          }}
        >
          {packagingUnitOptions.map((packagingOption) => (
            <Option key={packagingOption.value} value={packagingOption.value}>
              {packagingOption.label}
            </Option>
          ))}
        </Select>
      </ShipmentFormField>

      <Stack direction="row" spacing={1.5}>
        <ShipmentFormField label="Anzahl">
          <Input
            size="sm"
            type="number"
            value={props.packageCount}
            onChange={(event) => props.onPackageCountChange(event.target.value)}
            placeholder="z.B. 33"
            sx={shipmentInputStyles}
          />
        </ShipmentFormField>
        <ShipmentFormField label="Lademeter (ldm)">
          <Input
            size="sm"
            type="number"
            value={props.loadingMeters}
            onChange={(event) =>
              props.onLoadingMetersChange(event.target.value)
            }
            placeholder="auto"
            sx={{
              ...shipmentInputStyles,
              bgcolor: props.hasCustomLoadingMeters ? undefined : "#f8f9fb",
            }}
          />
        </ShipmentFormField>
      </Stack>
    </Stack>
  );
}

export function ShipmentPricingTab({
  salesPrice,
  onSalesPriceChange,
}: {
  salesPrice: string;
  onSalesPriceChange: (value: string) => void;
}) {
  return (
    <Stack spacing={2}>
      <ShipmentFormField label="Verkaufspreis (€)">
        <Input
          size="sm"
          type="number"
          value={salesPrice}
          onChange={(event) => onSalesPriceChange(event.target.value)}
          placeholder="Preis vom Kunden"
          sx={shipmentInputStyles}
        />
      </ShipmentFormField>

      <Typography level="body-xs" sx={{ color: "#57688e" }}>
        Der Einkaufspreis ergibt sich automatisch aus den zugewiesenen
        LKW-Kosten (Preis pro km × Distanz).
      </Typography>
    </Stack>
  );
}
