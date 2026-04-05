"use client";

import { useState } from "react";
import { Plus, ChevronLeft } from "lucide-react";
import SlideOver from "@/components/common/SlideOver";
import {
  useVorlagen,
  useDeleteVorlage,
  useToggleVorlageActive,
} from "@/hooks/useVorlagen";
import {
  useTruckVorlagen,
  useDeleteTruckVorlage,
  useToggleTruckVorlageActive,
} from "@/hooks/useTruckVorlagen";
import { useRelationen } from "@/hooks/useRelationen";
import { toast } from "react-toastify";
import Button from "@mui/joy/Button";
import Stack from "@mui/joy/Stack";
import {
  SendungVorlagenFormPanel,
  SendungVorlagenListPanel,
  TruckVorlagenFormPanel,
  TruckVorlagenListPanel,
} from "./vorlagen-slide-over/VorlagenPanels";
import { useSendungVorlageFormState } from "./vorlagen-slide-over/useSendungVorlageFormState";
import { useTruckVorlageFormState } from "./vorlagen-slide-over/useTruckVorlageFormState";

interface VorlagenSlideOverProps {
  open: boolean;
  onClose: () => void;
}

type MainSectionTab = "sendungsVorlagen" | "lkwVorlagen";
type PageView = "list" | "form";

export default function VorlagenSlideOver({
  open,
  onClose,
}: VorlagenSlideOverProps) {
  /* ── Data hooks ─────────────────────────────────────────────────────── */
  const { data: sendungVorlagen = [], isLoading: isSendungVorlagenLoading } =
    useVorlagen();
  const { data: truckVorlagen = [], isLoading: isTruckVorlagenLoading } =
    useTruckVorlagen();
  const { data: availableRelationen = [] } = useRelationen();

  const deleteSendungVorlage = useDeleteVorlage();
  const toggleSendungVorlageActive = useToggleVorlageActive();
  const deleteTruckVorlage = useDeleteTruckVorlage();
  const toggleTruckVorlageActive = useToggleTruckVorlageActive();

  /* ── Form state hooks ───────────────────────────────────────────────── */
  const sendungForm = useSendungVorlageFormState();
  const truckForm = useTruckVorlageFormState();

  /* ── Navigation state ───────────────────────────────────────────────── */
  const [activeMainSection, setActiveMainSection] =
    useState<MainSectionTab>("sendungsVorlagen");
  const [currentPageView, setCurrentPageView] = useState<PageView>("list");

  function switchToMainSection(section: MainSectionTab) {
    setActiveMainSection(section);
    setCurrentPageView("list");
  }

  function navigateBackToList() {
    setCurrentPageView("list");
    sendungForm.resetSendungFormState();
    truckForm.resetTruckFormState();
  }

  function openSendungForm(vorlage?: Parameters<typeof sendungForm.openSendungVorlageForm>[0]) {
    sendungForm.openSendungVorlageForm(vorlage);
    setCurrentPageView("form");
  }

  function openTruckForm(truckVorlage?: Parameters<typeof truckForm.openTruckVorlageForm>[0]) {
    truckForm.openTruckVorlageForm(truckVorlage);
    setCurrentPageView("form");
  }

  /* ── Slide-over title ───────────────────────────────────────────────── */
  function buildSlideOverTitle(): string {
    if (currentPageView === "form") {
      if (activeMainSection === "sendungsVorlagen") {
        return sendungForm.editingSendungVorlageId
          ? "Sendungs-Vorlage bearbeiten"
          : "Neue Sendungs-Vorlage";
      } else {
        return truckForm.editingTruckVorlageId
          ? "LKW-Plan bearbeiten"
          : "Neuer LKW-Plan";
      }
    }
    return "Wiederkehrende Aufträge";
  }

  /* ── Slide-over action buttons ──────────────────────────────────────── */
  const listViewActions =
    currentPageView === "list" ? (
      <Button
        size="sm"
        startDecorator={<Plus className="h-3 w-3" />}
        onClick={() => {
          if (activeMainSection === "sendungsVorlagen") {
            openSendungForm();
          } else {
            openTruckForm();
          }
        }}
        sx={{ bgcolor: "#155dfc", "&:hover": { bgcolor: "#1250d4" } }}
      >
        {activeMainSection === "sendungsVorlagen"
          ? "Neue Vorlage"
          : "Neuer LKW-Plan"}
      </Button>
    ) : null;

  const formViewActions =
    currentPageView === "form" ? (
      <>
        <Button
          variant="plain"
          color="neutral"
          size="sm"
          startDecorator={<ChevronLeft className="h-3 w-3" />}
          onClick={navigateBackToList}
          sx={{ color: "#57688e" }}
        >
          Zurück
        </Button>
        <Button
          size="sm"
          onClick={
            activeMainSection === "sendungsVorlagen"
              ? () => sendungForm.handleSaveSendungVorlage(navigateBackToList)
              : () =>
                  truckForm.handleSaveTruckVorlage(
                    sendungVorlagen,
                    navigateBackToList,
                  )
          }
          loading={sendungForm.isSaving || truckForm.isSaving}
          sx={{ bgcolor: "#155dfc", "&:hover": { bgcolor: "#1250d4" } }}
        >
          {sendungForm.editingSendungVorlageId || truckForm.editingTruckVorlageId
            ? "Speichern"
            : "Erstellen"}
        </Button>
      </>
    ) : null;

  /* ════════════════════════════════════════════════════════════════════
     Render
     ════════════════════════════════════════════════════════════════════ */
  return (
    <SlideOver
      open={open}
      onClose={onClose}
      title={buildSlideOverTitle()}
      actions={currentPageView === "list" ? listViewActions : formViewActions}
      width={580}
    >
      {/* ── Tab navigation (only in list view) ──────────────────────── */}
      {currentPageView === "list" && (
        <Stack direction="row" spacing={0} sx={{ mb: 2 }}>
          {(
            [
              { sectionKey: "sendungsVorlagen", label: "Sendungs-Vorlagen" },
              { sectionKey: "lkwVorlagen", label: "LKW-Pläne" },
            ] as { sectionKey: MainSectionTab; label: string }[]
          ).map(({ sectionKey, label }) => (
            <button
              key={sectionKey}
              type="button"
              onClick={() => switchToMainSection(sectionKey)}
              className={`flex-1 py-1.5 text-xs font-medium border-b-2 transition-colors ${
                activeMainSection === sectionKey
                  ? "border-[#155dfc] text-[#155dfc]"
                  : "border-transparent text-[#57688e] hover:text-[#0f172b]"
              }`}
            >
              {label}
            </button>
          ))}
        </Stack>
      )}

      {/* ── Sendungs-Vorlagen section ────────────────────────────────── */}
      {activeMainSection === "sendungsVorlagen" &&
        currentPageView === "list" && (
          <SendungVorlagenListPanel
            vorlagen={sendungVorlagen}
            isLoading={isSendungVorlagenLoading}
            onEditVorlage={openSendungForm}
            onDeleteVorlage={(vorlageId) =>
              deleteSendungVorlage.mutate(vorlageId, {
                onSuccess: () => toast.success("Vorlage gelöscht"),
                onError: () => toast.error("Fehler beim Löschen"),
              })
            }
            onToggleVorlageActive={(vorlageId, isActive) =>
              toggleSendungVorlageActive.mutate({ vorlageId, isActive })
            }
            onGenerateForVorlage={sendungForm.handleGenerateSendungVorlage}
            isGenerationRunning={sendungForm.isGenerationRunning}
          />
        )}

      {activeMainSection === "sendungsVorlagen" &&
        currentPageView === "form" && (
          <SendungVorlagenFormPanel
            isSubmitted={sendungForm.sendungFormSubmitted}
            vorlageName={sendungForm.sendungVorlageName}
            onVorlageNameChange={sendungForm.setSendungVorlageName}
            selectedKunde={sendungForm.sendungKunde}
            onKundeChange={sendungForm.setSendungKunde}
            loadingPostalCode={sendungForm.sendungLadePlz}
            onLoadingPostalCodeChange={sendungForm.setSendungLadePlz}
            loadingCity={sendungForm.sendungLadeort}
            onLoadingCityChange={sendungForm.setSendungLadeort}
            loadingStreetAddress={sendungForm.sendungLadeAdresse}
            onLoadingStreetAddressChange={sendungForm.setSendungLadeAdresse}
            loadingCountryCode={sendungForm.sendungLadeLand}
            onLoadingCountryCodeChange={sendungForm.setSendungLadeLand}
            unloadingPostalCode={sendungForm.sendungEntladePlz}
            onUnloadingPostalCodeChange={sendungForm.setSendungEntladePlz}
            unloadingCity={sendungForm.sendungEntladeort}
            onUnloadingCityChange={sendungForm.setSendungEntladeort}
            unloadingStreetAddress={sendungForm.sendungEntladeAdresse}
            onUnloadingStreetAddressChange={sendungForm.setSendungEntladeAdresse}
            unloadingCountryCode={sendungForm.sendungEntladeLand}
            onUnloadingCountryCodeChange={sendungForm.setSendungEntladeLand}
            weightInKilograms={sendungForm.sendungGewicht}
            onWeightInKilogramsChange={sendungForm.setSendungGewicht}
            packagingUnit={sendungForm.sendungPackungseinheit}
            onPackagingUnitChange={sendungForm.setSendungPackungseinheit}
            packageCount={sendungForm.sendungAnzahl}
            onPackageCountChange={sendungForm.setSendungAnzahl}
            loadingMeters={sendungForm.sendungLademeter}
            onLoadingMetersChange={sendungForm.setSendungLademeter}
            salesPrice={sendungForm.sendungVerkaufspreis}
            onSalesPriceChange={sendungForm.setSendungVerkaufspreis}
            recurrenceType={sendungForm.sendungRecurrenceType}
            onRecurrenceTypeChange={sendungForm.setSendungRecurrenceType}
            selectedWeekdays={sendungForm.sendungSelectedWeekdays}
            onToggleWeekday={(isoWeekday) =>
              sendungForm.setSendungSelectedWeekdays((previous) =>
                previous.includes(isoWeekday)
                  ? previous.filter((day) => day !== isoWeekday)
                  : [...previous, isoWeekday],
              )
            }
            monthlyDayOfMonth={sendungForm.sendungMonthlyDayOfMonth}
            onMonthlyDayOfMonthChange={sendungForm.setSendungMonthlyDayOfMonth}
            loadingTime={sendungForm.sendungLoadingTime}
            onLoadingTimeChange={sendungForm.setSendungLoadingTime}
            unloadingTime={sendungForm.sendungUnloadingTime}
            onUnloadingTimeChange={sendungForm.setSendungUnloadingTime}
            offsetDays={sendungForm.sendungOffsetDays}
            onOffsetDaysChange={sendungForm.setSendungOffsetDays}
            lookaheadDays={sendungForm.sendungLookaheadDays}
            onLookaheadDaysChange={sendungForm.setSendungLookaheadDays}
            skippedDates={sendungForm.sendungSkippedDates}
            onAddSkippedDate={sendungForm.addSendungSkippedDate}
            onRemoveSkippedDate={sendungForm.removeSendungSkippedDate}
            newSkipDateInputValue={sendungForm.sendungNewSkipDateInput}
            onNewSkipDateInputChange={sendungForm.setSendungNewSkipDateInput}
          />
        )}

      {/* ── LKW-Vorlagen section ─────────────────────────────────────── */}
      {activeMainSection === "lkwVorlagen" && currentPageView === "list" && (
        <TruckVorlagenListPanel
          truckVorlagen={truckVorlagen}
          isLoading={isTruckVorlagenLoading}
          onEditTruckVorlage={openTruckForm}
          onDeleteTruckVorlage={(truckVorlageId) =>
            deleteTruckVorlage.mutate(truckVorlageId, {
              onSuccess: () => toast.success("LKW-Plan gelöscht"),
              onError: () => toast.error("Fehler beim Löschen"),
            })
          }
          onToggleTruckVorlageActive={(truckVorlageId, isActive) =>
            toggleTruckVorlageActive.mutate({ truckVorlageId, isActive })
          }
          onGenerateForTruckVorlage={truckForm.handleGenerateTruckVorlage}
          isGenerationRunning={truckForm.isGenerationRunning}
        />
      )}

      {activeMainSection === "lkwVorlagen" && currentPageView === "form" && (
        <TruckVorlagenFormPanel
          isSubmitted={truckForm.truckFormSubmitted}
          truckVorlageName={truckForm.truckVorlageName}
          onTruckVorlageNameChange={truckForm.setTruckVorlageName}
          licensePlate={truckForm.truckKennzeichen}
          onLicensePlateChange={truckForm.setTruckKennzeichen}
          selectedFreightCarrier={truckForm.truckFraechter}
          onFreightCarrierChange={truckForm.setTruckFraechter}
          driverName={truckForm.truckFahrer}
          onDriverNameChange={truckForm.setTruckFahrer}
          driverPhoneNumber={truckForm.truckTelefonFahrer}
          onDriverPhoneNumberChange={truckForm.setTruckTelefonFahrer}
          vehicleColor={truckForm.truckFahrzeugFarbe}
          onVehicleColorChange={truckForm.setTruckFahrzeugFarbe}
          purchaseCost={truckForm.truckKosten}
          onPurchaseCostChange={truckForm.setTruckKosten}
          pricePerKilometer={truckForm.truckPreisProKm}
          onPricePerKilometerChange={truckForm.setTruckPreisProKm}
          selectedRelationId={truckForm.truckRelationId}
          onRelationIdChange={truckForm.setTruckRelationId}
          availableRelationen={availableRelationen}
          recurrenceType={truckForm.truckRecurrenceType}
          onRecurrenceTypeChange={truckForm.setTruckRecurrenceType}
          selectedWeekdays={truckForm.truckSelectedWeekdays}
          onToggleWeekday={(isoWeekday) =>
            truckForm.setTruckSelectedWeekdays((previous) =>
              previous.includes(isoWeekday)
                ? previous.filter((day) => day !== isoWeekday)
                : [...previous, isoWeekday],
            )
          }
          monthlyDayOfMonth={truckForm.truckMonthlyDayOfMonth}
          onMonthlyDayOfMonthChange={truckForm.setTruckMonthlyDayOfMonth}
          loadingTime={truckForm.truckLoadingTime}
          onLoadingTimeChange={truckForm.setTruckLoadingTime}
          unloadingTime={truckForm.truckUnloadingTime}
          onUnloadingTimeChange={truckForm.setTruckUnloadingTime}
          offsetDays={truckForm.truckOffsetDays}
          onOffsetDaysChange={truckForm.setTruckOffsetDays}
          lookaheadDays={truckForm.truckLookaheadDays}
          onLookaheadDaysChange={truckForm.setTruckLookaheadDays}
          skippedDates={truckForm.truckSkippedDates}
          onAddSkippedDate={truckForm.addTruckSkippedDate}
          onRemoveSkippedDate={truckForm.removeTruckSkippedDate}
          newSkipDateInputValue={truckForm.truckNewSkipDateInput}
          onNewSkipDateInputChange={truckForm.setTruckNewSkipDateInput}
          allSendungVorlagen={sendungVorlagen}
          linkedSendungVorlageIds={truckForm.linkedSendungVorlageIds}
          onToggleLinkedSendungVorlage={truckForm.toggleLinkedSendungVorlage}
          onApplyRecurrenceFromSendungVorlage={
            truckForm.applyRecurrenceFromSendungVorlage
          }
        />
      )}
    </SlideOver>
  );
}
