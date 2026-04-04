import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { createClient, createAuthClient } from "@/lib/supabase/client";

const BUCKET = "cmr-documents";
const ALLOWED_MIME_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/tiff"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

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
      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        throw new Error("Nur PDF, JPEG, PNG oder TIFF erlaubt");
      }
      if (file.size > MAX_FILE_SIZE) {
        throw new Error("Datei zu groß (max 10 MB)");
      }

      const supabase = await getSupabase();

      const ext = file.name.split(".").pop()?.toLowerCase() ?? "pdf";
      const path = `${sendungId}/cmr.${ext}`;

      // Upload file (upsert to allow re-upload)
      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { upsert: true, contentType: file.type });

      if (uploadError) throw uploadError;

      // Store path (not public URL) — signed URLs generated on demand
      const { error: updateError } = await supabase
        .from("sendungen")
        .update({
          cmr_path: path,
          cmr_file_name: file.name,
          cmr_uploaded_at: new Date().toISOString(),
        })
        .eq("id", sendungId);

      if (updateError) throw updateError;

      return { path, fileName: file.name };
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
          cmr_path: null,
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

/* ── Get signed URL for a stored CMR path ─────────────────────────── */
export function useGetCmrUrl() {
  const getSupabase = useSupabase();

  return async (cmrPath: string): Promise<string | null> => {
    const supabase = await getSupabase();

    const { data } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(cmrPath, 3600);

    return data?.signedUrl ?? null;
  };
}
