import type { Response } from "express";
import type { ChatStreamEvent } from "shared-types";

// =====================================================================
// SSE-Transportmechanik für eine einzelne Route — Header setzen, Frames
// schreiben, Client-Disconnect in ein AbortSignal übersetzen. Bewusst
// getrennt von pipelineController.ts/pipelineSteps.ts: die Pipeline kennt
// nur ein abstraktes onToken/signal in PipelineContext und weiß nichts von
// HTTP/Express (siehe Kommentar in pipelineSteps.ts zu Konsumenten ohne
// onToken, z. B. Evals) — dieses Modul ist die einzige Stelle, die das
// SSE-Protokoll tatsächlich spricht.
// =====================================================================

/**
 * Setzt die SSE-Header (siehe ticket-gesetzbuch-chatbot-v4.md —
 * "res.flushHeaders() nicht vergessen") und liefert:
 * - sendEvent: schreibt ein ChatStreamEvent als "event: ...\ndata: ...\n\n"-Frame
 * - signal: an den Client-Disconnect gekoppeltes AbortSignal
 */
export function startSseResponse(res: Response): {
  sendEvent: (event: ChatStreamEvent) => void;
  signal: AbortSignal;
} {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const sendEvent = (event: ChatStreamEvent) => {
    if (res.writableEnded) return; // Client schon weg
    res.write(`event: ${event.event}\n`);
    res.write(`data: ${JSON.stringify(event.data)}\n\n`);
  };

  // Client-Disconnect abbrechen, statt weiter gegen einen toten Socket zu
  // generieren (nur clientseitige Abbruch-Semantik laut @google/genai-Doku).
  // Wichtig: `res`, nicht `req` — req.on("close") feuert bei Express/Node
  // schon, sobald der Request-Body komplett gelesen wurde (Standard-
  // Readable-Verhalten), also praktisch sofort und unabhängig vom Client.
  // res.on("close") feuert dagegen nur früh, wenn die Verbindung tatsächlich
  // vorzeitig wegbricht.
  const abortController = new AbortController();
  res.on("close", () => abortController.abort());

  return { sendEvent, signal: abortController.signal };
}
