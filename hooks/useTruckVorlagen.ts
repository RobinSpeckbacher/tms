import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { createClient, createAuthClient } from "@/lib/supabase/client";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import { calculateExpectedDates, type RecurrenceType } from "@/lib/recurrence";
import type { VorlageRow } from "./useVorlagen";

dayjs.extend(isoWeek);

/* ── Types ─────────────────────────────────────────────────────────── */

export interface TruckVorlageRow {
  id: string;
  name: string;
  kennzeichen: string;
  fraechter_id: string | null;
  fraechter?: { id: string; name: string; kundennummer: string } | null;
  fahrer: string | null;
  telefon_fahrer: string | null;
  fahrzeug_farbe: string;
  kosten: number | null;
  preis_pro_km: number | null;
  relation_id: string | null;
  recurrence_type: RecurrenceType;
  recurrence_days: number[] | null;
  recurrence_time_lade: string | null;
  recurrence_time_entlade: string | null;
  recurrence_offset_days: number;
  lookahead_days: number;
  skipped_dates: string[];
  active: boolean;
  last_generated_at: string | null;
  created_at: string;
  updated_at: string;
  // Populated via join with truck_vorlage_sendungen → sendung_vorlagen
  linked_sendung_vorlagen: VorlageRow[];
}

export interface TruckVorlageInput {
  name: string;
  kennzeichen: string;
  fraechter_id?: string | null;
  fahrer?: string | null;
  telefon_fahrer?: string | null;
  fahrzeug_farbe?: string;
  kosten?: number | null;
  preis_pro_km?: number | null;
  relation_id?: string | null;
  recurrence_type: RecurrenceType;
  recurrence_days?: number[] | null;
  recurrence_time_lade?: string | null;
  recurrence_time_entlade?: string | null;
  recurrence_offset_days?: number;
  lookahead_days?: number;
  skipped_dates?: string[];
  active?: boolean;
  // IDs of sendung_vorlagen to link to this truck vorlage
  linked_sendung_vorlage_ids?: string[];
}

/* ── Helper ────────────────────────────────────────────────────────── */
function useSupabase() {
  const { getToken } = useAuth();
  return async () => {
    const token = await getToken();
    return token ? createAuthClient(token) : createClient();
  };
}

/* ── Fetch all truck vorlagen with their linked sendung vorlagen ───── */
// Uses two separate queries and merges client-side to avoid unreliable
// nested join behaviour in PostgREST when multiple FKs exist on the link table.
export function useTruckVorlagen() {
  const getSupabase = useSupabase();

  return useQuery<TruckVorlageRow[]>({
    queryKey: ["truck_vorlagen"],
    queryFn: async () => {
      const supabase = await getSupabase();

      // Step 1: fetch truck vorlagen
      const { data: truckVorlagenData, error: truckVorlagenError } =
        await supabase
          .from("truck_vorlagen")
          .select(
            "*, fraechter:unternehmen!fraechter_id(id, name, kundennummer)",
          )
          .order("created_at", { ascending: false });

      if (truckVorlagenError) throw truckVorlagenError;
      if (!truckVorlagenData?.length) return [];

      // Step 2: fetch all links with their sendung_vorlagen in one query
      const truckVorlageIds = truckVorlagenData.map((tv) => tv.id);
      const { data: linksData, error: linksError } = await supabase
        .from("truck_vorlage_sendungen")
        .select(
          `truck_vorlage_id,
          sendung_vorlage:sendung_vorlagen(
            id, name,
            lade_plz, lade_ort, lade_adresse, lade_land,
            entlade_plz, entlade_ort, entlade_adresse, entlade_land,
            kunde_id, gewicht, packungseinheit, anzahl, lademeter, verkaufspreis,
            recurrence_type, recurrence_days, recurrence_time_lade,
            recurrence_time_entlade, recurrence_offset_days,
            lookahead_days, skipped_dates, active
          )`,
        )
        .in("truck_vorlage_id", truckVorlageIds);

      if (linksError) throw linksError;

      // Build a map of truck_vorlage_id → linked sendung vorlagen
      const linkedSendungVorlagenByTruckId = new Map<string, VorlageRow[]>();
      for (const link of linksData ?? []) {
        const existing =
          linkedSendungVorlagenByTruckId.get(link.truck_vorlage_id) ?? [];
        if (link.sendung_vorlage) {
          existing.push(link.sendung_vorlage as unknown as VorlageRow);
        }
        linkedSendungVorlagenByTruckId.set(link.truck_vorlage_id, existing);
      }

      // Merge into the final result
      return truckVorlagenData.map((truckVorlage) => ({
        ...truckVorlage,
        linked_sendung_vorlagen:
          linkedSendungVorlagenByTruckId.get(truckVorlage.id) ?? [],
      })) as TruckVorlageRow[];
    },
  });
}

/* ── Create truck vorlage with optional linked sendung vorlagen ────── */
export function useCreateTruckVorlage() {
  const getSupabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: TruckVorlageInput) => {
      const supabase = await getSupabase();

      const { linked_sendung_vorlage_ids, ...truckVorlageData } = input;

      const { data: createdTruckVorlage, error: createError } = await supabase
        .from("truck_vorlagen")
        .insert({ ...truckVorlageData, fahrzeug_farbe: truckVorlageData.fahrzeug_farbe ?? "#155dfc" })
        .select()
        .single();

      if (createError) throw createError;

      if (linked_sendung_vorlage_ids?.length) {
        const { error: linkError } = await supabase
          .from("truck_vorlage_sendungen")
          .insert(
            linked_sendung_vorlage_ids.map((sendungVorlageId) => ({
              truck_vorlage_id: createdTruckVorlage.id,
              sendung_vorlage_id: sendungVorlageId,
            })),
          );
        if (linkError) throw linkError;
      }

      return createdTruckVorlage as TruckVorlageRow;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["truck_vorlagen"] }),
        queryClient.invalidateQueries({ queryKey: ["vorlagen"] }),
      ]);
    },
  });
}

/* ── Update truck vorlage and replace all linked sendung vorlagen ──── */
export function useUpdateTruckVorlage() {
  const getSupabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...input
    }: Partial<TruckVorlageInput> & { id: string }) => {
      const supabase = await getSupabase();

      const { linked_sendung_vorlage_ids, ...truckVorlageData } = input;

      const { data: updatedTruckVorlage, error: updateError } = await supabase
        .from("truck_vorlagen")
        .update(truckVorlageData)
        .eq("id", id)
        .select()
        .single();

      if (updateError) throw updateError;

      // Replace all links: delete existing, then insert the new set
      const { error: deleteLinksError } = await supabase
        .from("truck_vorlage_sendungen")
        .delete()
        .eq("truck_vorlage_id", id);

      if (deleteLinksError) throw deleteLinksError;

      if (linked_sendung_vorlage_ids?.length) {
        const { error: insertLinksError } = await supabase
          .from("truck_vorlage_sendungen")
          .insert(
            linked_sendung_vorlage_ids.map((sendungVorlageId) => ({
              truck_vorlage_id: id,
              sendung_vorlage_id: sendungVorlageId,
            })),
          );
        if (insertLinksError) throw insertLinksError;
      }

      return updatedTruckVorlage as TruckVorlageRow;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["truck_vorlagen"] }),
        queryClient.invalidateQueries({ queryKey: ["vorlagen"] }),
      ]);
    },
  });
}

/* ── Delete ────────────────────────────────────────────────────────── */
export function useDeleteTruckVorlage() {
  const getSupabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (truckVorlageId: string) => {
      const supabase = await getSupabase();
      // Links are deleted automatically via ON DELETE CASCADE
      const { error } = await supabase
        .from("truck_vorlagen")
        .delete()
        .eq("id", truckVorlageId);
      if (error) throw error;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["truck_vorlagen"] }),
        queryClient.invalidateQueries({ queryKey: ["vorlagen"] }),
      ]);
    },
  });
}

/* ── Toggle active ─────────────────────────────────────────────────── */
export function useToggleTruckVorlageActive() {
  const getSupabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      truckVorlageId,
      isActive,
    }: {
      truckVorlageId: string;
      isActive: boolean;
    }) => {
      const supabase = await getSupabase();
      const { error } = await supabase
        .from("truck_vorlagen")
        .update({ active: isActive })
        .eq("id", truckVorlageId);
      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["truck_vorlagen"] });
    },
  });
}

/* ── Generate trucks + assign their linked shipments ─────────────── */
export function useGenerateRecurringTrucksWithShipments() {
  const getSupabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      activeTruckVorlagen: TruckVorlageRow[],
    ): Promise<{ trucksCreated: number; shipmentsCreated: number }> => {
      const supabase = await getSupabase();
      let trucksCreated = 0;
      let shipmentsCreated = 0;

      for (const truckVorlage of activeTruckVorlagen) {
        if (
          !truckVorlage.active ||
          truckVorlage.recurrence_type === "none"
        ) {
          continue;
        }

        const today = dayjs().startOf("day");
        const lookaheadEndDate = today.add(
          truckVorlage.lookahead_days ?? 14,
          "day",
        );

        const expectedLoadingDates = calculateExpectedDates(
          truckVorlage,
          today,
          lookaheadEndDate,
        );

        if (expectedLoadingDates.length === 0) continue;

        // Fetch existing trucks for this kennzeichen in the lookahead window
        // so we can reuse their IDs when assigning shipments.
        const { data: existingGeneratedTrucks } = await supabase
          .from("trucks")
          .select("id, ladedatum")
          .eq("kennzeichen", truckVorlage.kennzeichen)
          .is("deleted_at", null)
          .gte("ladedatum", today.format("YYYY-MM-DD"))
          .lte("ladedatum", lookaheadEndDate.format("YYYY-MM-DD"));

        // Map loadingDate → existing truck id for O(1) lookup
        const existingTruckIdByLoadingDate = new Map(
          (existingGeneratedTrucks ?? []).map((truck) => [
            truck.ladedatum,
            truck.id,
          ]),
        );

        for (const loadingDate of expectedLoadingDates) {
          const unloadingDate = dayjs(loadingDate)
            .add(truckVorlage.recurrence_offset_days ?? 0, "day")
            .format("YYYY-MM-DD");

          // Reuse an existing truck for this date, or create a new one
          let truckId = existingTruckIdByLoadingDate.get(loadingDate) ?? null;

          if (!truckId) {
            // Get the next sequential internal truck reference number
            const { data: nextTruckRef, error: refError } = await supabase.rpc(
              "next_truck_interne_ref",
            );
            if (refError) continue;

            const { data: createdTruck, error: truckCreationError } =
              await supabase
                .from("trucks")
                .insert({
                  interne_ref: nextTruckRef,
                  vorlage_id: truckVorlage.id,
                  kennzeichen: truckVorlage.kennzeichen,
                  fraechter_id: truckVorlage.fraechter_id,
                  fahrer: truckVorlage.fahrer,
                  telefon_fahrer: truckVorlage.telefon_fahrer,
                  farbe: truckVorlage.fahrzeug_farbe ?? "#155dfc",
                  kosten: truckVorlage.kosten,
                  preis_pro_km: truckVorlage.preis_pro_km,
                  relation_id: truckVorlage.relation_id,
                  ladedatum: loadingDate,
                  ladezeit: truckVorlage.recurrence_time_lade,
                  entladedatum: unloadingDate,
                  entladezeit: truckVorlage.recurrence_time_entlade,
                  status: "geplant",
                })
                .select("id")
                .single();

            if (truckCreationError || !createdTruck) continue;
            truckId = createdTruck.id;
            trucksCreated++;
          }

          // Create and assign each linked sendung vorlage for this date
          for (const linkedSendungVorlage of truckVorlage.linked_sendung_vorlagen) {
            if (!linkedSendungVorlage.active) continue;

            // Respect per-sendung-vorlage skipped dates too
            if (linkedSendungVorlage.skipped_dates?.includes(loadingDate)) {
              continue;
            }

            // Check if a shipment for this vorlage + date already exists
            const { data: existingShipment } = await supabase
              .from("sendungen")
              .select("id")
              .eq("vorlage_id", linkedSendungVorlage.id)
              .is("deleted_at", null)
              .eq("ladedatum", loadingDate)
              .maybeSingle();

            let shipmentId: string;

            if (existingShipment) {
              shipmentId = existingShipment.id;
            } else {
              const generatedReferenz = `V-${dayjs(loadingDate).format("YYYYMMDD")}-${linkedSendungVorlage.id.replace(/-/g, "").slice(0, 8).toUpperCase()}`;
              const shipmentUnloadingDate = dayjs(loadingDate)
                .add(linkedSendungVorlage.recurrence_offset_days ?? 0, "day")
                .format("YYYY-MM-DD");

              const { data: createdShipment, error: shipmentCreationError } =
                await supabase
                  .from("sendungen")
                  .insert({
                    referenz: generatedReferenz,
                    vorlage_id: linkedSendungVorlage.id,
                    kunde_id: linkedSendungVorlage.kunde_id,
                    lade_plz: linkedSendungVorlage.lade_plz,
                    lade_ort: linkedSendungVorlage.lade_ort,
                    lade_adresse: linkedSendungVorlage.lade_adresse,
                    lade_land: linkedSendungVorlage.lade_land,
                    entlade_plz: linkedSendungVorlage.entlade_plz,
                    entlade_ort: linkedSendungVorlage.entlade_ort,
                    entlade_adresse: linkedSendungVorlage.entlade_adresse,
                    entlade_land: linkedSendungVorlage.entlade_land,
                    ladedatum: loadingDate,
                    ladezeit: linkedSendungVorlage.recurrence_time_lade,
                    entladedatum: shipmentUnloadingDate,
                    entladezeit: linkedSendungVorlage.recurrence_time_entlade,
                    gewicht: linkedSendungVorlage.gewicht,
                    packungseinheit: linkedSendungVorlage.packungseinheit,
                    anzahl: linkedSendungVorlage.anzahl,
                    lademeter: linkedSendungVorlage.lademeter,
                    verkaufspreis: linkedSendungVorlage.verkaufspreis,
                    status: "offen",
                  })
                  .select("id")
                  .single();

              if (shipmentCreationError || !createdShipment) continue;
              shipmentId = createdShipment.id;
              shipmentsCreated++;
            }

            // Assign the shipment to the truck.
            // ignoreDuplicates handles the case where the shipment is already
            // assigned (e.g. from a concurrent run or a previous generation).
            await supabase
              .from("truck_sendungen")
              .upsert(
                { truck_id: truckId, sendung_id: shipmentId },
                { onConflict: "sendung_id", ignoreDuplicates: true },
              );
          }

          // Record when we last generated for this truck vorlage
          await supabase
            .from("truck_vorlagen")
            .update({ last_generated_at: new Date().toISOString() })
            .eq("id", truckVorlage.id);
        }
      }

      return { trucksCreated, shipmentsCreated };
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["sendungen"] }),
        queryClient.invalidateQueries({ queryKey: ["trucks"] }),
        queryClient.invalidateQueries({ queryKey: ["truck_sendungen"] }),
        queryClient.invalidateQueries({ queryKey: ["truck_vorlagen"] }),
        queryClient.invalidateQueries({ queryKey: ["vorlagen"] }),
      ]);
    },
  });
}
