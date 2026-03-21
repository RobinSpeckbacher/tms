import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { createClient, createAuthClient } from "@/lib/supabase/client";

/* ── Types ─────────────────────────────────────────────────────────── */
export interface SendungRow {
  id: string;
  referenz: string;
  kunde_id: string | null;
  kunde?: { id: string; name: string; kundennummer: string } | null;
  lade_plz: string | null;
  lade_ort: string;
  lade_adresse: string | null;
  lade_land: string | null;
  entlade_plz: string | null;
  entlade_ort: string;
  entlade_adresse: string | null;
  entlade_land: string | null;
  ladedatum: string;
  ladezeit: string | null;
  entladedatum: string;
  entladezeit: string | null;
  gewicht: number | null;
  packungseinheit: string | null;
  anzahl: number | null;
  lademeter: number | null;
  verkaufspreis: number | null;
  status: string;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SendungInput {
  referenz: string;
  kunde_id?: string | null;
  lade_plz?: string | null;
  lade_ort: string;
  lade_adresse?: string | null;
  lade_land?: string | null;
  entlade_plz?: string | null;
  entlade_ort: string;
  entlade_adresse?: string | null;
  entlade_land?: string | null;
  ladedatum: string;
  ladezeit?: string | null;
  entladedatum: string;
  entladezeit?: string | null;
  gewicht?: number | null;
  packungseinheit?: string | null;
  anzahl?: number | null;
  lademeter?: number | null;
  verkaufspreis?: number | null;
  status?: string;
}

/* ── Helper ────────────────────────────────────────────────────────── */
function useSupabase() {
  const { getToken } = useAuth();
  return async () => {
    const token = await getToken();
    return token ? createAuthClient(token) : createClient();
  };
}

/* ── Fetch all sendungen ──────────────────────────────────────────── */
export function useSendungen() {
  const getSupabase = useSupabase();

  return useQuery<SendungRow[]>({
    queryKey: ["sendungen"],
    queryFn: async () => {
      const supabase = await getSupabase();
      const { data, error } = await supabase
        .from("sendungen")
        .select("*, kunde:unternehmen!kunde_id(id, name, kundennummer)")
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}

/* ── Create ────────────────────────────────────────────────────────── */
export function useCreateSendung() {
  const getSupabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: SendungInput) => {
      const supabase = await getSupabase();
      const { data, error } = await supabase
        .from("sendungen")
        .insert(input)
        .select()
        .single();

      if (error) throw error;
      return data as SendungRow;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sendungen"] });
    },
  });
}

/* ── Update ────────────────────────────────────────────────────────── */
export function useUpdateSendung() {
  const getSupabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: Partial<SendungInput> & { id: string }) => {
      const supabase = await getSupabase();
      const { data, error } = await supabase
        .from("sendungen")
        .update(input)
        .eq("id", id)
        .select("*, kunde:unternehmen!kunde_id(id, name, kundennummer)")
        .single();

      if (error) throw error;
      return data as SendungRow;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sendungen"] });
    },
  });
}

/* ── Soft delete ───────────────────────────────────────────────────── */
export function useDeleteSendung() {
  const getSupabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = await getSupabase();
      const { error } = await supabase
        .from("sendungen")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sendungen"] });
    },
  });
}
