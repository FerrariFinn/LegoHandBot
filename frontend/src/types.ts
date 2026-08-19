import type { ChatSource } from "shared-types";

// =====================================================================
// Frontend-lokale Typen. Geteilte Vertragstypen (ChatRequest, ChatSource,
// ChatStreamEvent) kommen aus shared-types — hier nur, was nur die UI
// betrifft.
// =====================================================================

export type ChatMode = "frage" | "fall";

export type UIMessage = {
  role: "user" | "assistant";
  text: string;
  mode?: ChatMode; // wird nur bei User-Nachrichten gesetzt
  sources?: ChatSource[] | null; // wird nur bei Assistant-Nachrichten gesetzt
};
