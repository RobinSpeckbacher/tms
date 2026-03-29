import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { createClient, createAuthClient } from "@/lib/supabase/client";

const BUCKET = "cmr-documents";

function useSupabase() {
  const { getToken } = useAuth();
  return async () => {
    const token = await getToken();
    return token ? createAuthClient(token) : createClient();
  };
}

/* ── Upload CMR ───────────────────────────────────────────────────── */
export function useUploadCmr() {
  const getSupabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      sendungId,
      file,
    }: {
      sendungId: string;
      file: File;
    }) => {
      const supabase = await getSupabase();

      const ext = file.name.split(".").pop() ?? "pdf";
      const path = `${sendungId}/cmr.${ext}`;

      // Upload file (upsert to allow re-upload)
      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from(BUCKET).getPublicUrl(path);

      // Update sendung record
      const { error: updateError } = await supabase
        .from("sendungen")
        .update({
          cmr_url: publicUrl,
          cmr_file_name: file.name,
          cmr_uploaded_at: new Date().toISOString(),
        })
        .eq("id", sendungId);

      if (updateError) throw updateError;

      return { url: publicUrl, fileName: file.name };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sendungen"] });
    },
  });
}

/* ── Delete CMR ───────────────────────────────────────────────────── */
export function useDeleteCmr() {
  const getSupabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sendungId: string) => {
      const supabase = await getSupabase();

      // List files in sendung folder to get exact path
      const { data: files } = await supabase.storage
        .from(BUCKET)
        .list(sendungId);

      if (files && files.length > 0) {
        const paths = files.map((f) => `${sendungId}/${f.name}`);
        await supabase.storage.from(BUCKET).remove(paths);
      }

      // Clear CMR fields
      const { error } = await supabase
        .from("sendungen")
        .update({
          cmr_url: null,
          cmr_file_name: null,
          cmr_uploaded_at: null,
        })
        .eq("id", sendungId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sendungen"] });
    },
  });
}

/* ── Download signed URL (for private buckets) ────────────────────── */
export function useGetCmrUrl() {
  const getSupabase = useSupabase();

  return async (sendungId: string): Promise<string | null> => {
    const supabase = await getSupabase();

    const { data: files } = await supabase.storage
      .from(BUCKET)
      .list(sendungId);

    if (!files || files.length === 0) return null;

    const { data } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(`${sendungId}/${files[0].name}`, 3600);

    return data?.signedUrl ?? null;
  };
}
