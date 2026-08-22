import { useEffect, useRef, useState } from "react";
import type { ChatMode, ChatSource, PipelineContext } from "shared-types";
import * as chatState from "./chatState";
import { streamChat } from "./streamClient";
import type { UIMessage } from "./types";

// =====================================================================
// Orchestriert den Chat-Flow: nimmt Nutzereingaben entgegen, ruft
// streamClient auf, aktualisiert chatState und triggert darüber Re-Renders.
// Frontend-Analogon zu backend/src/pipelineController.ts.
// =====================================================================

// Die beiden echten Chat-Modi (getrennte Verläufe). "lhgb" ist keine
// Konversation, sondern die statische Gesetzestext-Ansicht.
type ChatTabMode = "frage" | "fall";

const EMPTY_HISTORIES: Record<ChatTabMode, UIMessage[]> = { frage: [], fall: [] };
const EMPTY_INPUTS: Record<ChatTabMode, string> = { frage: "", fall: "" };

export function useChatController() {
  // TODO(supabase): Verläufe/Entwürfe liegen aktuell nur im Speicher dieses
  // Browser-Tabs und gehen beim Reload verloren. Perspektivisch pro Nutzer in
  // Supabase persistieren (siehe backend/src/lib/supabaseClient.ts und das
  // RLS-Muster in backend/src/lib/chatRateLimit.ts).
  const [histories, setHistories] = useState<Record<ChatTabMode, UIMessage[]>>(EMPTY_HISTORIES);
  const [inputs, setInputs] = useState<Record<ChatTabMode, string>>(EMPTY_INPUTS);
  const [mode, setMode] = useState<ChatMode>("frage");
  // Global statt pro Tab: es soll immer nur eine Anfrage gleichzeitig
  // unterwegs sein, auch tab-übergreifend.
  const [streaming, setStreaming] = useState(false);
  const streamAbortRef = useRef<AbortController | null>(null);

  // Laufenden Stream abbrechen, wenn die Komponente verschwindet.
  useEffect(() => {
    return () => streamAbortRef.current?.abort();
  }, []);

  const activeMode: ChatTabMode | null = mode === "frage" || mode === "fall" ? mode : null;
  const messages = activeMode ? histories[activeMode] : [];
  const input = activeMode ? inputs[activeMode] : "";

  function setInput(value: string) {
    if (!activeMode) return;
    setInputs((prev) => ({ ...prev, [activeMode]: value }));
  }

  async function send() {
    if (!activeMode || streaming) return;
    const tabMode = activeMode;

    const text = inputs[tabMode].trim();
    if (!text) return;

    const history = chatState.toHistory(histories[tabMode]);

    setHistories((h) => ({ ...h, [tabMode]: chatState.startExchange(h[tabMode], text, tabMode) }));
    setInputs((prev) => ({ ...prev, [tabMode]: "" }));
    setStreaming(true);

    const onToken = (token: string) => {
      setHistories((h) => ({ ...h, [tabMode]: chatState.appendToken(h[tabMode], token) }));
    };
    const onDone = (sources: ChatSource[] | null) => {
      setHistories((h) => ({ ...h, [tabMode]: chatState.applySources(h[tabMode], sources) }));
    };
    const onError = (message: string) => {
      setHistories((h) => ({ ...h, [tabMode]: chatState.appendErrorText(h[tabMode], message) }));
    };

    // Defensiv: falls doch mal ein vorheriger Stream noch läuft, abbrechen.
    streamAbortRef.current?.abort();
    const controller = new AbortController();
    streamAbortRef.current = controller;

    const requestBody: PipelineContext = { role: "user", query: text, chatmode: tabMode, history };
    await streamChat(requestBody, { onToken, onDone, onError }, controller.signal);

    setStreaming(false);
    streamAbortRef.current = null;
  }

  // Setzt den Verlauf + Eingabe-Entwurf des aktuell aktiven Tabs zurück.
  // Der andere Tab bleibt unberührt. Bestätigungsdialog ist Sache der UI
  // (ChatWindow), hier nur die reine Zustandsänderung.
  function newChat() {
    if (!activeMode) return;
    setHistories((h) => ({ ...h, [activeMode]: [] }));
    setInputs((prev) => ({ ...prev, [activeMode]: "" }));
  }

  return { messages, input, setInput, mode, setMode, streaming, send, newChat };
}
