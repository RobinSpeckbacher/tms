import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { createClient, createAuthClient } from "@/lib/supabase/client";

export interface Unternehmen {
  id: string;
  kundennummer: string;
  name: string;
  rollen: string[];
  email?: string;
  telefon?: string;
  ansprechpartner?: string;
  adresse: string;
  plz: string;
  ort: string;
  land: string;
  notizen?: string;
}

/* ── Debounced search ─────────────────────────────────────────────── */
export function useUnternehmenSearch(query: string, rolle?: string) {
  const { getToken } = useAuth();
  const [debounced, setDebounced] = useState(query);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  return useQuery<Unternehmen[]>({
    queryKey: ["unternehmen", "search", debounced, rolle],
    queryFn: async () => {
      const token = await getToken();
      const supabase = token ? createAuthClient(token) : createClient();
      let q = supabase
        .from("unternehmen")
        .select("id, kundennummer, name, rollen, email, telefon, ansprechpartner, adresse, plz, ort, land")
        .or(`name.ilike.%${debounced}%,kundennummer.ilike.%${debounced}%`)
        .limit(10);

      if (rolle) {
        q = q.contains("rollen", [rolle]);
      }

      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
    enabled: debounced.length >= 2,
  });
}

/* ── Create mutation ──────────────────────────────────────────────── */
export interface CreateUnternehmenInput {
  name: string;
  rollen?: string[];
  email?: string;
  telefon?: string;
  ansprechpartner?: string;
  adresse: string;
  plz: string;
  ort: string;
  land: string;
  notizen?: string;
}

export function useCreateUnternehmen() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateUnternehmenInput) => {
      const token = await getToken();
      const supabase = token ? createAuthClient(token) : createClient();
      const kundennummer = `KD-${Date.now().toString(36).toUpperCase()}`;
      const { data, error } = await supabase
        .from("unternehmen")
        .insert({
          ...input,
          kundennummer,
          rollen: input.rollen ?? ["kunde"],
        })
        .select()
        .single();

      if (error) throw error;
      return data as Unternehmen;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["unternehmen"] });
    },
  });
}
