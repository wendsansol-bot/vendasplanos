import { createClient } from "@supabase/supabase-js";

// Projeto Supabase externo (fonte de dados do dashboard).
export const EXTERNAL_SUPABASE_URL = "https://xbehpfbdzcacraawqzkt.supabase.co";
export const EXTERNAL_SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_2e8ylWG_kk16xPiPHbAZAA_N4Eo0JuZ";

// Chaves novas (sb_publishable_*) não são JWT: enviar apenas o header apikey.
function externalFetch(input: RequestInfo | URL, init?: RequestInit) {
  const headers = new Headers(init?.headers);
  if (headers.get("Authorization") === `Bearer ${EXTERNAL_SUPABASE_PUBLISHABLE_KEY}`) {
    headers.delete("Authorization");
  }
  headers.set("apikey", EXTERNAL_SUPABASE_PUBLISHABLE_KEY);
  return fetch(input, { ...init, headers });
}

export const externalSupabase = createClient(
  EXTERNAL_SUPABASE_URL,
  EXTERNAL_SUPABASE_PUBLISHABLE_KEY,
  {
    auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
    global: { fetch: externalFetch },
  },
);
