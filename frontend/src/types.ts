import type { ChatMode, ChatSource } from "shared-types";

// =====================================================================
// Frontend-lokale Typen. Geteilte Vertragstypen (PipelineContext, ChatSource,
// ChatStreamEvent, ChatMode) kommen aus shared-types — hier nur, was nur
// die UI betrifft.
// =====================================================================

export type UIMessage = {
  role: "user" | "assistant";
  text: string;
  mode?: ChatMode; // wird nur bei User-Nachrichten gesetzt
  sources?: ChatSource[] | null; // wird nur bei Assistant-Nachrichten gesetzt
};
