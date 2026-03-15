import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { createClient, createAuthClient } from "@/lib/supabase/client";

export interface FahrzeugTyp {
  id: string;
  label: string;
}

export function useFahrzeugTypen() {
  const { getToken } = useAuth();

  return useQuery<FahrzeugTyp[]>({
    queryKey: ["fahrzeug_typen"],
    queryFn: async () => {
      const token = await getToken();
      const supabase = token ? createAuthClient(token) : createClient();
      const { data, error } = await supabase
        .from("fahrzeug_typen")
        .select("id, label")
        .order("label");

      if (error) throw error;
      return data;
    },
  });
}
