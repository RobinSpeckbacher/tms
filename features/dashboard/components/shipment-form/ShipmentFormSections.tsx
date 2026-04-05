"use client";

import { Euro, MapPin, Package } from "lucide-react";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Divider from "@mui/joy/Divider";
import Input from "@mui/joy/Input";
import Stack from "@mui/joy/Stack";
import Tab from "@mui/joy/Tab";
import TabList from "@mui/joy/TabList";
import TabPanel from "@mui/joy/TabPanel";
import Tabs from "@mui/joy/Tabs";
import Typography from "@mui/joy/Typography";
import UnternehmenAutocomplete from "@/components/common/UnternehmenAutocomplete";
import type { Unternehmen } from "@/hooks/useUnternehmen";
import {
  ShipmentAddressTab,
  ShipmentDetailsTab,
  ShipmentPricingTab,
} from "./ShipmentFormTabPanels";

export const shipmentInputStyles = {
  "--Input-focusedHighlight": "#155dfc",
  color: "#0f172b",
} as const;

export const shipmentInputErrorStyles = {
  "--Input-focusedHighlight": "#ef4444",
  borderColor: "#ef4444",
} as const;

export const packagingUnitOptions = [
  {
    value: "europalette",
    label: "Europalette (120×80)",
    loadingMetersPerUnit: 0.4,
  },
  {
    value: "industriepalette",
    label: "Industriepalette (120×100)",
    loadingMetersPerUnit: 0.5,
  },
  { value: "gitterbox", label: "Gitterbox (124×84)", loadingMetersPerUnit: 0.4 },
  { value: "colli", label: "Colli / Karton", loadingMetersPerUnit: 0 },
  { value: "sonstige", label: "Sonstige", loadingMetersPerUnit: 0 },
] as const;

export function ShipmentFormField({
  label,
  required,
  hasError,
  children,
}: {
  label: string;
  required?: boolean;
  hasError?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Box>
      <Typography
        level="body-xs"
        sx={{
          color: hasError === true ? "#ef4444" : "#57688e",
          mb: 0.5,
          fontWeight: 500,
        }}
      >
        {label}
        {required === true ? " *" : ""}
      </Typography>
      {children}
    </Box>
  );
}

interface ShipmentHeaderSectionProps {
  shipmentReference: string;
  onShipmentReferenceChange: (value: string) => void;
  selectedCustomer: Unternehmen | null;
  onSelectedCustomerChange: (value: Unternehmen | null) => void;
  isSubmitted: boolean;
  onApplyCustomerAsLoadingAddress: () => void;
  onApplyCustomerAsUnloadingAddress: () => void;
}

export function ShipmentHeaderSection({
  shipmentReference,
  onShipmentReferenceChange,
  selectedCustomer,
  onSelectedCustomerChange,
  isSubmitted,
  onApplyCustomerAsLoadingAddress,
  onApplyCustomerAsUnloadingAddress,
}: ShipmentHeaderSectionProps) {
  return (
    <Stack spacing={2} sx={{ mb: 2 }}>
      <ShipmentFormField
        label="Referenz"
        required
        hasError={isSubmitted && shipmentReference.trim() === ""}
      >
        <Input
          size="sm"
          required
          value={shipmentReference}
          onChange={(event) => onShipmentReferenceChange(event.target.value)}
          placeholder="z.B. SA-20260315-001"
          sx={{
            ...shipmentInputStyles,
            ...(isSubmitted && shipmentReference.trim() === ""
              ? shipmentInputErrorStyles
              : {}),
          }}
        />
      </ShipmentFormField>

      <ShipmentFormField label="Kunde">
        <UnternehmenAutocomplete
          value={selectedCustomer}
          onChange={onSelectedCustomerChange}
          placeholder="Kundenname oder Kundennr."
          defaultRollen={["kunde"]}
        />
      </ShipmentFormField>

      {selectedCustomer && (
        <>
          <Stack direction="row" spacing={1.5}>
            <Box sx={{ flex: 1 }}>
              <ShipmentFormField label="Adresse">
                <Input
                  size="sm"
                  readOnly
                  value={selectedCustomer.adresse}
                  sx={{ ...shipmentInputStyles, bgcolor: "#f8f9fb" }}
                />
              </ShipmentFormField>
            </Box>
          </Stack>
          <Stack direction="row" spacing={1.5}>
            <Box sx={{ width: 100 }}>
              <ShipmentFormField label="PLZ">
                <Input
                  size="sm"
                  readOnly
                  value={selectedCustomer.plz}
                  sx={{ ...shipmentInputStyles, bgcolor: "#f8f9fb" }}
                />
              </ShipmentFormField>
            </Box>
            <Box sx={{ flex: 1 }}>
              <ShipmentFormField label="Ort">
                <Input
                  size="sm"
                  readOnly
                  value={selectedCustomer.ort}
                  sx={{ ...shipmentInputStyles, bgcolor: "#f8f9fb" }}
                />
              </ShipmentFormField>
            </Box>
            <Box sx={{ width: 60 }}>
              <ShipmentFormField label="Land">
                <Input
                  size="sm"
                  readOnly
                  value={selectedCustomer.land}
                  sx={{ ...shipmentInputStyles, bgcolor: "#f8f9fb" }}
                />
              </ShipmentFormField>
            </Box>
          </Stack>
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              size="sm"
              onClick={onApplyCustomerAsLoadingAddress}
              sx={{
                flex: 1,
                color: "#57688e",
                borderColor: "#d5dbe8",
                fontSize: "0.75rem",
                "&:hover": {
                  bgcolor: "#f1f5f9",
                  borderColor: "#155dfc",
                  color: "#155dfc",
                },
              }}
            >
              → Ladeort übernehmen
            </Button>
            <Button
              variant="outlined"
              size="sm"
              onClick={onApplyCustomerAsUnloadingAddress}
              sx={{
                flex: 1,
                color: "#57688e",
                borderColor: "#d5dbe8",
                fontSize: "0.75rem",
                "&:hover": {
                  bgcolor: "#f1f5f9",
                  borderColor: "#155dfc",
                  color: "#155dfc",
                },
              }}
            >
              → Entladeort übernehmen
            </Button>
          </Stack>
        </>
      )}
    </Stack>
  );
}

export interface ShipmentFormTabsProps {
  activeTabIndex: number;
  onActiveTabIndexChange: (tabIndex: number) => void;
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
  salesPrice: string;
  onSalesPriceChange: (value: string) => void;
}

export function ShipmentFormTabs(props: ShipmentFormTabsProps) {
  return (
    <>
      <Divider sx={{ mb: 1 }} />

      <Tabs
        value={props.activeTabIndex}
        onChange={(_event, tabValue) =>
          props.onActiveTabIndexChange(tabValue as number)
        }
        sx={{ bgcolor: "transparent" }}
      >
        <TabList
          size="sm"
          sx={{
            gap: 0.5,
            "--ListItem-radius": "6px",
            "--List-padding": "0",
            mb: 2,
          }}
        >
          <Tab variant="plain" sx={{ fontSize: "0.75rem", gap: 0.5 }}>
            <MapPin className="h-3 w-3" /> Adressen
          </Tab>
          <Tab variant="plain" sx={{ fontSize: "0.75rem", gap: 0.5 }}>
            <Package className="h-3 w-3" /> Details
          </Tab>
          <Tab variant="plain" sx={{ fontSize: "0.75rem", gap: 0.5 }}>
            <Euro className="h-3 w-3" /> Kosten
          </Tab>
        </TabList>

        <TabPanel value={0} sx={{ p: 0 }}>
          <ShipmentAddressTab {...props} />
        </TabPanel>

        <TabPanel value={1} sx={{ p: 0 }}>
          <ShipmentDetailsTab {...props} />
        </TabPanel>

        <TabPanel value={2} sx={{ p: 0 }}>
          <ShipmentPricingTab
            salesPrice={props.salesPrice}
            onSalesPriceChange={props.onSalesPriceChange}
          />
        </TabPanel>
      </Tabs>
    </>
  );
}
