import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { createClient, createAuthClient } from "@/lib/supabase/client";

/* ── Types ─────────────────────────────────────────────────────────── */
export interface TruckSendung {
  id: string;
  truck_id: string;
  sendung_id: string;
  position: number;
  created_at: string;
}

/* ── Helper ────────────────────────────────────────────────────────── */
function useSupabase() {
  const { getToken } = useAuth();
  return async () => {
    const token = await getToken();
    return token ? createAuthClient(token) : createClient();
  };
}

/* ── Fetch all assignments ────────────────────────────────────────── */
export function useTruckSendungen() {
  const getSupabase = useSupabase();

  return useQuery<TruckSendung[]>({
    queryKey: ["truck_sendungen"],
    queryFn: async () => {
      const supabase = await getSupabase();
      const { data, error } = await supabase
        .from("truck_sendungen")
        .select("*")
        .order("position", { ascending: true });

      if (error) throw error;
      return data;
    },
  });
}

/* ── Assign sendung to truck (atomic via RPC) ─────────────────────── */
export function useAssignSendung() {
  const getSupabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ truckId, sendungId }: { truckId: string; sendungId: string }) => {
      const supabase = await getSupabase();
      const { error } = await supabase.rpc("assign_sendung_to_truck", {
        p_truck_id: truckId,
        p_sendung_id: sendungId,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["truck_sendungen"] });
      queryClient.invalidateQueries({ queryKey: ["sendungen"] });
    },
  });
}

/* ── Unassign sendung from truck (atomic via RPC) ─────────────────── */
export function useUnassignSendung() {
  const getSupabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sendungId: string) => {
      const supabase = await getSupabase();
      const { error } = await supabase.rpc("unassign_sendung_from_truck", {
        p_sendung_id: sendungId,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["truck_sendungen"] });
      queryClient.invalidateQueries({ queryKey: ["sendungen"] });
    },
  });
}
