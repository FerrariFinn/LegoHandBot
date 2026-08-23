/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  // Absolute Backend-URL fürs Produktions-Build (siehe lib/apiBase.ts).
  // Lokal leer/unset, weil der Vite-Dev-Proxy "/api" übernimmt.
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
