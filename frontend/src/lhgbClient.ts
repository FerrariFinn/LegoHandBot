import type { LhgbResponse } from "shared-types";
import { supabase } from "./lib/supabaseClient";
import { apiUrl } from "./lib/apiBase";

// =====================================================================
// GET /api/lhgb liefert den kompletten Gesetzbuchtext als einzelnes JSON,
// kein Streaming nötig (siehe backend/src/index.ts). Auth-Header-Aufbau
// analog zu streamChat in streamClient.ts.
// =====================================================================

export async function fetchLhgbText(): Promise<string> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const headers: Record<string, string> = {};
  if (session?.access_token) {
    headers.Authorization = `Bearer ${session.access_token}`;
  }

  const res = await fetch(apiUrl("/api/lhgb"), { headers });
  if (!res.ok) {
    throw new Error(`Fehler beim Laden des Gesetzbuchs (HTTP ${res.status}).`);
  }

  const data = (await res.json()) as LhgbResponse;
  return data.text;
}
