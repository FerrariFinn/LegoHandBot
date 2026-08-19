import type { ChatRequest, ChatSource, ChatStreamEvent } from "shared-types";

// =====================================================================
// POST /api/chat liefert echtes SSE-Streaming (siehe backend/src/index.ts).
// Dieses Modul übernimmt den kompletten Netzwerk-Roundtrip: fetch, Erkennung
// Stream- vs. JSON-Fehlerantwort, und das Parsen der SSE-Frames. Kein DOM-
// oder React-Zugriff — reine Transport-Schicht, analog zur SSE-Schreib-
// verantwortung von backend/src/index.ts.
//
// Liest den Response-Body chunkweise, puffert bis eine vollständige
// "event: ...\ndata: ...\n\n"-Frame vorliegt, und feuert die passenden
// Handler. Ein eigener useChatStream-Hook lohnt sich erst, wenn es eine
// zweite Chat-Oberfläche gibt (siehe Kommentar in vite.config.ts).
//
// streamChat fängt jeden Fehlerfall selbst ab (Abbruch, Netzwerkfehler,
// JSON-Fallback, SSE-error-Event) und ruft dafür handlers.onError mit der
// fertig formatierten Meldung auf — die Promise wird nie rejected, Aufrufer
// brauchen also kein eigenes try/catch.
// =====================================================================

type StreamHandlers = {
  onToken: (text: string) => void;
  onDone: (sources: ChatSource[] | null) => void;
  onError: (message: string) => void;
};

async function consumeSSE(
  body: ReadableStream<Uint8Array>,
  handlers: StreamHandlers
) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) return;
    buffer += decoder.decode(value, { stream: true });

    let sep: number;
    while ((sep = buffer.indexOf("\n\n")) !== -1) {
      const block = buffer.slice(0, sep);
      buffer = buffer.slice(sep + 2);

      const eventLine = block.split("\n").find((l) => l.startsWith("event: "));
      const dataLine = block.split("\n").find((l) => l.startsWith("data: "));
      if (!eventLine || !dataLine) continue;

      let event: ChatStreamEvent;
      try {
        event = {
          event: eventLine.slice("event: ".length),
          data: JSON.parse(dataLine.slice("data: ".length)),
        } as ChatStreamEvent;
      } catch {
        continue; // kaputtes Event: überspringen, weiterlesen
      }

      if (event.event === "token") handlers.onToken(event.data.text);
      else if (event.event === "done") handlers.onDone(event.data.sources);
      else if (event.event === "error") handlers.onError(event.data.error);
    }
  }
}

export async function streamChat(
  request: ChatRequest,
  handlers: StreamHandlers,
  signal: AbortSignal
): Promise<void> {
  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
      signal,
    });

    const isStream = res.headers.get("Content-Type")?.includes("text/event-stream");
    if (!isStream) {
      const data = await res.json();
      handlers.onError(`Fehler: ${data.error ?? "Unbekannter Fehler"}`);
      return;
    }

    await consumeSSE(res.body!, {
      onToken: handlers.onToken,
      onDone: handlers.onDone,
      onError: (message) => handlers.onError(`Fehler: ${message}`),
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") return;
    handlers.onError("Fehler beim Abrufen der Antwort.");
  }
}
