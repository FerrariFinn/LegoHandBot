import { useEffect, useRef, useState } from "react";
import type { ChatMode, ChatRequest, ChatSource } from "shared-types";
import * as chatState from "./chatState";
import { streamChat } from "./streamClient";
import type { UIMessage } from "./types";

// =====================================================================
// Orchestriert den Chat-Flow: nimmt Nutzereingaben entgegen, ruft
// streamClient auf, aktualisiert chatState und triggert darüber Re-Renders.
// Frontend-Analogon zu backend/src/pipelineController.ts.
// =====================================================================

export function useChatController() {
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<ChatMode>("frage");
  const [streaming, setStreaming] = useState(false);
  const streamAbortRef = useRef<AbortController | null>(null);

  // Laufenden Stream abbrechen, wenn die Komponente verschwindet.
  useEffect(() => {
    return () => streamAbortRef.current?.abort();
  }, []);

  async function send() {
    const text = input.trim();
    if (!text || streaming) return;

    const history = chatState.toHistory(messages);

    setMessages((m) => chatState.startExchange(m, text, mode));
    setInput("");
    setStreaming(true);

    const onToken = (token: string) => {
      setMessages((m) => chatState.appendToken(m, token));
    };
    const onDone = (sources: ChatSource[] | null) => {
      setMessages((m) => chatState.applySources(m, sources));
    };
    const onError = (message: string) => {
      setMessages((m) => chatState.appendErrorText(m, message));
    };

    // Defensiv: falls doch mal ein vorheriger Stream noch läuft, abbrechen.
    streamAbortRef.current?.abort();
    const controller = new AbortController();
    streamAbortRef.current = controller;

    const requestBody: ChatRequest = { query: text, history };
    await streamChat(requestBody, { onToken, onDone, onError }, controller.signal);

    setStreaming(false);
    streamAbortRef.current = null;
  }

  return { messages, input, setInput, mode, setMode, streaming, send };
}
