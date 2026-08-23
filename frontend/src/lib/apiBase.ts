// =====================================================================
// Lokal reicht der relative Pfad "/api/..." aus, weil der Vite-Dev-Proxy
// (siehe vite.config.ts) ihn zu http://localhost:3001 durchreicht — Frontend
// und Backend sind aus Browsersicht dieselbe Origin. Im Deploy ist das
// Frontend aber ein reiner statischer Host (kein Node-Prozess, kein Proxy),
// der einen relativen "/api/lhgb"-Request selbst beantwortet (SPA-Fallback
// auf index.html statt Weiterleitung zum Backend) — daher braucht Produktion
// die absolute Backend-URL über VITE_API_URL zur Build-Zeit.
// =====================================================================

const API_BASE = import.meta.env.VITE_API_URL ?? "";

export function apiUrl(path: string): string {
  return `${API_BASE}${path}`;
}
