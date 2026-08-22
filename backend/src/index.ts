import express from "express";
import cors from "cors";
import type { PipelineContext } from "shared-types";
import { QuestionQuery, runPipeline } from "./pipelineController.js";
import { startSseResponse } from "./lib/sse.js";
import { requireAuth } from "./lib/requireAuth.js";
import { chatRateLimit } from "./lib/chatRateLimit.js";
import { loadGesetzbuchText } from "./lib/gesetzbuchLoader.js";

const app = express();
const PORT = Number(process.env.PORT ?? 3001);

app.use(cors({
  origin: process.env.FRONTEND_URL,
}));

app.use(express.json());

// Health-Check — dient hier nur zum lokalen Testen des Grundgerüsts.
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/chat", requireAuth, chatRateLimit, async (req, res) => {
  const { query, history, chatmode } = req.body as PipelineContext;

  if (typeof query !== "string" || query.trim() === "") {
    res.status(400).json({ error: "query ist erforderlich" });
    return;
  }

  // Ab hier SSE statt JSON-Blob (siehe lib/sse.ts für die Transportmechanik).
  const { sendEvent, signal } = startSseResponse(res);

  const result = await runPipeline(QuestionQuery, {
    role: "user",
    query,
    chatmode: chatmode ?? "frage",
    history,
    onToken: (token) => sendEvent({ event: "token", data: { text: token } }),
    signal,
  });

  if (result.error) {
    sendEvent({ event: "error", data: { error: result.error } });
  } else {
    sendEvent({ event: "done", data: { sources: result.sources ?? null } });
  }
  res.end();
});

// Liefert den vollen Gesetzbuchtext an den LHGB-Tab im Frontend — statisch
// und ungefiltert (im Gegensatz zu /api/chat kein LLM-Call, daher kein
// chatRateLimit), aber trotzdem hinter requireAuth wie /api/chat.
app.get("/api/lhgb", requireAuth, (_req, res) => {
  res.json({ text: loadGesetzbuchText() });
});

app.listen(PORT, () => {
  console.log(`Backend läuft auf http://localhost:${PORT}`);
});
