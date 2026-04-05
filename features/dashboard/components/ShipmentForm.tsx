"use client";

import { useState, useMemo } from "react";
import dayjs from "dayjs";
import SlideOver from "@/components/common/SlideOver";
import {
  useCreateSendung,
  useUpdateSendung,
  type SendungRow,
} from "@/hooks/useSendungen";
import { toast } from "react-toastify";
import Button from "@mui/joy/Button";
import type { Unternehmen } from "@/hooks/useUnternehmen";
import {
  packagingUnitOptions,
  ShipmentFormTabs,
  ShipmentHeaderSection,
} from "./shipment-form/ShipmentFormSections";

interface ShipmentFormProps {
  open: boolean;
  onClose: () => void;
  sendung?: SendungRow | null;
}

export default function ShipmentForm({
  open,
  onClose,
  sendung,
}: ShipmentFormProps) {
  const isEditMode = sendung != null;
  const createShipmentMutation = useCreateSendung();
  const updateShipmentMutation = useUpdateSendung();

  const [shipmentReference, setShipmentReference] = useState(
    sendung?.referenz ?? "",
  );
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Unternehmen | null>(
    sendung?.kunde
      ? ({
          id: sendung.kunde.id,
          name: sendung.kunde.name,
          kundennummer: sendung.kunde.kundennummer,
          adresse: sendung.kunde.adresse,
          plz: sendung.kunde.plz,
          ort: sendung.kunde.ort,
          land: sendung.kunde.land,
        } as Unternehmen)
      : null,
  );

  const [activeTabIndex, setActiveTabIndex] = useState(0);

  const [loadingPostalCode, setLoadingPostalCode] = useState(
    sendung?.lade_plz ?? "",
  );
  const [loadingCity, setLoadingCity] = useState(sendung?.lade_ort ?? "");
  const [loadingStreetAddress, setLoadingStreetAddress] = useState(
    sendung?.lade_adresse ?? "",
  );
  const [loadingCountryCode, setLoadingCountryCode] = useState(
    sendung?.lade_land ?? "AT",
  );

  const [unloadingPostalCode, setUnloadingPostalCode] = useState(
    sendung?.entlade_plz ?? "",
  );
  const [unloadingCity, setUnloadingCity] = useState(
    sendung?.entlade_ort ?? "",
  );
  const [unloadingStreetAddress, setUnloadingStreetAddress] = useState(
    sendung?.entlade_adresse ?? "",
  );
  const [unloadingCountryCode, setUnloadingCountryCode] = useState(
    sendung?.entlade_land ?? "AT",
  );

  const [grossWeightInKilograms, setGrossWeightInKilograms] = useState(
    sendung?.gewicht != null ? String(sendung.gewicht) : "",
  );
  const [packagingUnit, setPackagingUnit] = useState(
    sendung?.packungseinheit ?? "europalette",
  );
  const [packageCount, setPackageCount] = useState(
    sendung?.anzahl != null ? String(sendung.anzahl) : "",
  );
  const [customLademeterValue, setCustomLademeterValue] = useState(
    sendung?.lademeter != null ? String(sendung.lademeter) : "",
  );
  const [loadingDate, setLoadingDate] = useState(
    sendung?.ladedatum ?? dayjs().format("YYYY-MM-DD"),
  );
  const [loadingTime, setLoadingTime] = useState(sendung?.ladezeit ?? "08:00");
  const [unloadingDate, setUnloadingDate] = useState(
    sendung?.entladedatum ?? dayjs().format("YYYY-MM-DD"),
  );
  const [unloadingTime, setUnloadingTime] = useState(
    sendung?.entladezeit ?? "17:00",
  );

  const [salesPrice, setSalesPrice] = useState(
    sendung?.verkaufspreis != null ? String(sendung.verkaufspreis) : "",
  );

  const loadingMeters = useMemo(() => {
    if (customLademeterValue) return customLademeterValue;
    const matchingPackagingUnit = packagingUnitOptions.find(
      (packagingOption) => packagingOption.value === packagingUnit,
    );
    if (
      matchingPackagingUnit == null ||
      matchingPackagingUnit.loadingMetersPerUnit === 0 ||
      packageCount === ""
    ) {
      return "";
    }
    return (
      matchingPackagingUnit.loadingMetersPerUnit * Number(packageCount)
    ).toFixed(2);
  }, [packagingUnit, packageCount, customLademeterValue]);

  const resetForm = () => {
    setShipmentReference("");
    setSelectedCustomer(null);
    setLoadingPostalCode("");
    setLoadingCity("");
    setLoadingStreetAddress("");
    setLoadingCountryCode("AT");
    setUnloadingPostalCode("");
    setUnloadingCity("");
    setUnloadingStreetAddress("");
    setUnloadingCountryCode("AT");
    setGrossWeightInKilograms("");
    setPackagingUnit("europalette");
    setPackageCount("");
    setCustomLademeterValue("");
    setLoadingDate(dayjs().format("YYYY-MM-DD"));
    setLoadingTime("08:00");
    setUnloadingDate(dayjs().format("YYYY-MM-DD"));
    setUnloadingTime("17:00");
    setSalesPrice("");
    setIsSubmitted(false);
    setActiveTabIndex(0);
  };

  const handleSubmit = () => {
    setIsSubmitted(true);

    const missingRequiredFields: string[] = [];
    if (shipmentReference.trim() === "") missingRequiredFields.push("Referenz");
    if (loadingPostalCode.trim() === "") missingRequiredFields.push("Lade-PLZ");
    if (loadingCity.trim() === "") missingRequiredFields.push("Ladeort");
    if (loadingCountryCode.trim() === "")
      missingRequiredFields.push("Lade-Land");
    if (unloadingPostalCode.trim() === "")
      missingRequiredFields.push("Entlade-PLZ");
    if (unloadingCity.trim() === "") missingRequiredFields.push("Entladeort");
    if (unloadingCountryCode.trim() === "")
      missingRequiredFields.push("Entlade-Land");

    if (missingRequiredFields.length > 0) {
      toast.error(`Bitte ausfüllen: ${missingRequiredFields.join(", ")}`);
      if (
        loadingPostalCode.trim() === "" ||
        loadingCity.trim() === "" ||
        loadingCountryCode.trim() === "" ||
        unloadingPostalCode.trim() === "" ||
        unloadingCity.trim() === "" ||
        unloadingCountryCode.trim() === ""
      )
        setActiveTabIndex(0);
      return;
    }

    const shipmentPayload = {
      referenz: shipmentReference.trim(),
      kunde_id: selectedCustomer?.id ?? null,
      lade_plz: loadingPostalCode.trim() || null,
      lade_ort: loadingCity.trim(),
      lade_adresse: loadingStreetAddress.trim() || null,
      lade_land: loadingCountryCode.trim() || null,
      entlade_plz: unloadingPostalCode.trim() || null,
      entlade_ort: unloadingCity.trim(),
      entlade_adresse: unloadingStreetAddress.trim() || null,
      entlade_land: unloadingCountryCode.trim() || null,
      ladedatum: loadingDate,
      ladezeit: loadingTime || null,
      entladedatum: unloadingDate,
      entladezeit: unloadingTime || null,
      gewicht: grossWeightInKilograms ? Number(grossWeightInKilograms) : null,
      packungseinheit: packagingUnit || null,
      anzahl: packageCount ? Number(packageCount) : null,
      lademeter: loadingMeters ? Number(loadingMeters) : null,
      verkaufspreis: salesPrice ? Number(salesPrice) : null,
    };

    const mutationCallbacks = {
      onSuccess: () => {
        toast.success(
          isEditMode ? "Sendeauftrag aktualisiert" : "Sendeauftrag erstellt",
        );
        resetForm();
        onClose();
      },
      onError: () => {
        toast.error(
          isEditMode ? "Fehler beim Aktualisieren" : "Fehler beim Erstellen",
        );
      },
    };

    if (isEditMode) {
      updateShipmentMutation.mutate(
        { id: sendung!.id, ...shipmentPayload },
        mutationCallbacks,
      );
    } else {
      createShipmentMutation.mutate(shipmentPayload, mutationCallbacks);
    }
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
        {isEditMode ? "Speichern" : "Erstellen"}
      </Button>
    </>
  );

  return (
    <SlideOver
      open={open}
      onClose={handleClose}
      title={isEditMode ? "Sendeauftrag bearbeiten" : "Neuer Sendeauftrag"}
      actions={actions}
    >
      <ShipmentHeaderSection
        shipmentReference={shipmentReference}
        onShipmentReferenceChange={setShipmentReference}
        selectedCustomer={selectedCustomer}
        onSelectedCustomerChange={setSelectedCustomer}
        isSubmitted={isSubmitted}
        onApplyCustomerAsLoadingAddress={() => {
          if (selectedCustomer == null) return;
          setLoadingPostalCode(selectedCustomer.plz);
          setLoadingCity(selectedCustomer.ort);
          setLoadingStreetAddress(selectedCustomer.adresse);
          setLoadingCountryCode(selectedCustomer.land);
          setActiveTabIndex(0);
        }}
        onApplyCustomerAsUnloadingAddress={() => {
          if (selectedCustomer == null) return;
          setUnloadingPostalCode(selectedCustomer.plz);
          setUnloadingCity(selectedCustomer.ort);
          setUnloadingStreetAddress(selectedCustomer.adresse);
          setUnloadingCountryCode(selectedCustomer.land);
          setActiveTabIndex(0);
        }}
      />

      <ShipmentFormTabs
        activeTabIndex={activeTabIndex}
        onActiveTabIndexChange={setActiveTabIndex}
        isSubmitted={isSubmitted}
        loadingPostalCode={loadingPostalCode}
        onLoadingPostalCodeChange={setLoadingPostalCode}
        loadingCity={loadingCity}
        onLoadingCityChange={setLoadingCity}
        loadingCountryCode={loadingCountryCode}
        onLoadingCountryCodeChange={setLoadingCountryCode}
        loadingStreetAddress={loadingStreetAddress}
        onLoadingStreetAddressChange={setLoadingStreetAddress}
        unloadingPostalCode={unloadingPostalCode}
        onUnloadingPostalCodeChange={setUnloadingPostalCode}
        unloadingCity={unloadingCity}
        onUnloadingCityChange={setUnloadingCity}
        unloadingCountryCode={unloadingCountryCode}
        onUnloadingCountryCodeChange={setUnloadingCountryCode}
        unloadingStreetAddress={unloadingStreetAddress}
        onUnloadingStreetAddressChange={setUnloadingStreetAddress}
        loadingDate={loadingDate}
        onLoadingDateChange={setLoadingDate}
        loadingTime={loadingTime}
        onLoadingTimeChange={setLoadingTime}
        unloadingDate={unloadingDate}
        onUnloadingDateChange={setUnloadingDate}
        unloadingTime={unloadingTime}
        onUnloadingTimeChange={setUnloadingTime}
        grossWeightInKilograms={grossWeightInKilograms}
        onGrossWeightInKilogramsChange={setGrossWeightInKilograms}
        packagingUnit={packagingUnit}
        onPackagingUnitChange={setPackagingUnit}
        packageCount={packageCount}
        onPackageCountChange={setPackageCount}
        loadingMeters={loadingMeters}
        onLoadingMetersChange={setCustomLademeterValue}
        hasCustomLoadingMeters={customLademeterValue !== ""}
        salesPrice={salesPrice}
        onSalesPriceChange={setSalesPrice}
      />
    </SlideOver>
  );
}
