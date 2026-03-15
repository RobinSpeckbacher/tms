import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { createClient, createAuthClient } from "@/lib/supabase/client";

export interface PlzEntry {
  id: string;
  plz: string;
  ort: string;
  land: string;
}

/**
 * Lookup PLZ entries by prefix (min 2 chars).
 * Returns matching { plz, ort, land } rows.
 */
export function usePlzLookup(query: string) {
  const { getToken } = useAuth();

  return useQuery<PlzEntry[]>({
    queryKey: ["plz_verzeichnis", query],
    queryFn: async () => {
      const token = await getToken();
      const supabase = token ? createAuthClient(token) : createClient();
      const { data, error } = await supabase
        .from("plz_verzeichnis")
        .select("id, plz, ort, land")
        .ilike("plz", `${query}%`)
        .order("plz")
        .limit(15);

      if (error) throw error;
      return data;
    },
    enabled: query.length >= 2,
  });
}
