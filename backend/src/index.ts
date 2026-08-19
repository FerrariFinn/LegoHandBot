import express from "express";
import cors from "cors";
import type { ChatRequest } from "shared-types";
import { QuestionQuery, runPipeline } from "./pipelineController";
import { startSseResponse } from "./lib/sse";

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

  // Ab hier SSE statt JSON-Blob (siehe lib/sse.ts für die Transportmechanik).
  const { sendEvent, signal } = startSseResponse(res);

  const result = await runPipeline(QuestionQuery, {
    role: "user",
    query,
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

app.listen(PORT, () => {
  console.log(`Backend läuft auf http://localhost:${PORT}`);
});
