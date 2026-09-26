import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL || "https://qzpkminownoutpjxnkwh.supabase.co";
const key =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  "sb_publishable_OVAn9L_V4zsPkdBrb64E5g_TLf6TQbV";

export const supabase: SupabaseClient | null =
  url && key ? createClient(url, key, { auth: { persistSession: false } }) : null;

export function hasSupabase() {
  return Boolean(supabase);
}
