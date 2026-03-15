import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { createClient, createAuthClient } from "@/lib/supabase/client";

/* ── Types ─────────────────────────────────────────────────────────── */
export interface Truck {
  id: string;
  interne_ref: string;
  kunden_ref?: string;
  kennzeichen: string;
  fraechter_id?: string;
  fraechter?: { id: string; name: string; kundennummer: string } | null;
  fahrer?: string;
  telefon_fahrer?: string;
  fahrzeug_typ_id?: string;
  farbe: string;
  ladedatum: string;
  ladezeit?: string;
  entladedatum: string;
  entladezeit?: string;
  status: string;
  max_paletten?: number;
  max_gewicht?: number;
  lademeter?: number;
  preis_pro_km?: number;
  gesamtpreis?: number;
  kosten?: number;
  distanz_km?: number;
  fahrzeit_min?: number;
  deleted_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface TruckInput {
  interne_ref: string;
  kunden_ref?: string | null;
  kennzeichen: string;
  fraechter_id?: string | null;
  fahrer?: string | null;
  telefon_fahrer?: string | null;
  fahrzeug_typ_id?: string | null;
  farbe?: string | null;
  ladedatum: string;
  ladezeit?: string | null;
  entladedatum: string;
  entladezeit?: string | null;
  status?: string;
  max_paletten?: number | null;
  max_gewicht?: number | null;
  lademeter?: number | null;
  preis_pro_km?: number | null;
  gesamtpreis?: number | null;
  kosten?: number | null;
}

/* ── Helper ────────────────────────────────────────────────────────── */
function useSupabase() {
  const { getToken } = useAuth();
  return async () => {
    const token = await getToken();
    return token ? createAuthClient(token) : createClient();
  };
}

/* ── Fetch all trucks ─────────────────────────────────────────────── */
export function useTrucks() {
  const getSupabase = useSupabase();

  return useQuery<Truck[]>({
    queryKey: ["trucks"],
    queryFn: async () => {
      const supabase = await getSupabase();
      const { data, error } = await supabase
        .from("trucks")
        .select("*, fraechter:unternehmen!fraechter_id(id, name, kundennummer)")
        .is("deleted_at", null)
        .order("ladedatum", { ascending: true });

      if (error) throw error;
      return data;
    },
  });
}

/* ── Create ────────────────────────────────────────────────────────── */
export function useCreateTruck() {
  const getSupabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: TruckInput) => {
      const supabase = await getSupabase();
      const { data, error } = await supabase
        .from("trucks")
        .insert(input)
        .select()
        .single();

      if (error) throw error;
      return data as Truck;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trucks"] });
    },
  });
}

/* ── Update ────────────────────────────────────────────────────────── */
export function useUpdateTruck() {
  const getSupabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: Partial<TruckInput> & { id: string }) => {
      const supabase = await getSupabase();
      const { data, error } = await supabase
        .from("trucks")
        .update(input)
        .eq("id", id)
        .select("*, fraechter:unternehmen!fraechter_id(id, name, kundennummer)")
        .single();

      if (error) throw error;
      return data as Truck;
    },
    onMutate: (variables) => {
      queryClient.cancelQueries({ queryKey: ["trucks"] });
      const previous = queryClient.getQueryData<Truck[]>(["trucks"]);

      queryClient.setQueryData<Truck[]>(["trucks"], (old) =>
        old?.map((t) =>
          t.id === variables.id ? { ...t, ...variables } as Truck : t
        )
      );

      return { previous };
    },
    onError: (_err, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["trucks"], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["trucks"] });
    },
  });
}

/* ── SoftDelete ────────────────────────────────────────────────────────── */
export function useDeleteTruck() {
  const getSupabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = await getSupabase();
      const { error } = await supabase
        .from("trucks")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trucks"] });
    },
  });
}
