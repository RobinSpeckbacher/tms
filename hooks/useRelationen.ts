import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { createClient, createAuthClient } from "@/lib/supabase/client";

/* ── Types ─────────────────────────────────────────────────────────── */
export interface Relation {
  id: string;
  nummer: string;
  name: string;
  farbe: string;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface RelationInput {
  nummer: string;
  name: string;
  farbe?: string | null;
}

/* ── Helper ────────────────────────────────────────────────────────── */
function useSupabase() {
  const { getToken } = useAuth();
  return async () => {
    const token = await getToken();
    if (typeof token === "string" && token.trim().length > 0) {
      return createAuthClient(token);
    }
    return createClient();
  };
}

/* ── Fetch all relationen ─────────────────────────────────────────── */
export function useRelationen() {
  const getSupabase = useSupabase();

  return useQuery<Relation[]>({
    queryKey: ["relationen"],
    queryFn: async () => {
      const supabase = await getSupabase();
      const { data, error } = (await supabase
        .from("relationen")
        .select("*")
        .is("deleted_at", null)
        .order("nummer", { ascending: true })) as {
        data: Relation[] | null;
        error: unknown;
      };

      if (error != null) throw error;
      return data ?? [];
    },
  });
}

/* ── Create ────────────────────────────────────────────────────────── */
export function useCreateRelation() {
  const getSupabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: RelationInput) => {
      const supabase = await getSupabase();
      const { data, error } = (await supabase
        .from("relationen")
        .insert(input)
        .select()
        .single()) as {
        data: Relation | null;
        error: unknown;
      };

      if (error != null) throw error;
      if (!data) throw new Error("Relation konnte nicht erstellt werden");
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["relationen"] });
    },
  });
}

/* ── Update ────────────────────────────────────────────────────────── */
export function useUpdateRelation() {
  const getSupabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: Partial<RelationInput> & { id: string }) => {
      const supabase = await getSupabase();
      const { data, error } = (await supabase
        .from("relationen")
        .update(input)
        .eq("id", id)
        .select()
        .single()) as {
        data: Relation | null;
        error: unknown;
      };

      if (error != null) throw error;
      if (!data) throw new Error("Relation konnte nicht aktualisiert werden");
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["relationen"] });
    },
  });
}

/* ── Soft delete ───────────────────────────────────────────────────── */
export function useDeleteRelation() {
  const getSupabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = await getSupabase();
      const { error } = await supabase
        .from("relationen")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", id);

      if (error != null) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["relationen"] });
    },
  });
}
