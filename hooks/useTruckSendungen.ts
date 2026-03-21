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

/* ── Assign sendung to truck ──────────────────────────────────────── */
export function useAssignSendung() {
  const getSupabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ truckId, sendungId }: { truckId: string; sendungId: string }) => {
      const supabase = await getSupabase();

      // Insert assignment
      const { error: assignError } = await supabase
        .from("truck_sendungen")
        .insert({ truck_id: truckId, sendung_id: sendungId });

      if (assignError) throw assignError;

      // Update sendung status
      const { error: statusError } = await supabase
        .from("sendungen")
        .update({ status: "zugewiesen" })
        .eq("id", sendungId);

      if (statusError) throw statusError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["truck_sendungen"] });
      queryClient.invalidateQueries({ queryKey: ["sendungen"] });
    },
  });
}

/* ── Unassign sendung from truck ──────────────────────────────────── */
export function useUnassignSendung() {
  const getSupabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sendungId: string) => {
      const supabase = await getSupabase();

      const { error: deleteError } = await supabase
        .from("truck_sendungen")
        .delete()
        .eq("sendung_id", sendungId);

      if (deleteError) throw deleteError;

      const { error: statusError } = await supabase
        .from("sendungen")
        .update({ status: "offen" })
        .eq("id", sendungId);

      if (statusError) throw statusError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["truck_sendungen"] });
      queryClient.invalidateQueries({ queryKey: ["sendungen"] });
    },
  });
}
