import express from "express";
import cors from "cors";
import type { ChatRequest, ChatStreamEvent } from "shared-types";
import { QuestionQuery, runPipeline } from "./pipelineController";

const app = express();
const PORT = Number(process.env.PORT ?? 3001);

app.use(cors());
app.use(express.json());

// Health-Check — dient hier nur zum lokalen Testen des Grundgerüsts.
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/chat", async (req, res) => {
  const { query, history } = req.body as ChatRequest;

  if (typeof query !== "string" || query.trim() === "") {
    res.status(400).json({ error: "query ist erforderlich" });
    return;
  }

  // Ab hier SSE statt JSON-Blob: Header sofort setzen und flushen, siehe
  // ticket-gesetzbuch-chatbot-v4.md ("res.flushHeaders() nicht vergessen").
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

  const result = await runPipeline(QuestionQuery, {
    role: "user",
    query,
    history,
    onToken: (token) => sendEvent({ event: "token", data: { text: token } }),
    signal: abortController.signal,
  });

  if (result.error) {
    sendEvent({ event: "error", data: { error: result.error } });
  } else {
    sendEvent({ event: "done", data: { sources: result.sources ?? null } });
  }
  res.end();
});

app.listen(PORT, () => {
  console.log(`Backend läuft auf http://localhost:${PORT}`);
});
