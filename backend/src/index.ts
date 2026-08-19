import express from "express";
import cors from "cors";
import type { ChatRequest, ChatResponse } from "shared-types";
import { QuestionQuery, runPipeline } from "./pipeline";

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

  const result = await runPipeline(QuestionQuery, {
    role: "user",
    query,
    history,
  });

  if (result.error) {
    res.status(500).json({ error: result.error });
    return;
  }

  // Aktuell: einfache JSON-Response. Next step: SSE-Streaming
  // (siehe useChatStream-Kommentar in frontend/src/App.tsx) — Antwort
  // token-weise über `text/event-stream` statt eines fertigen JSON-Blobs.
  const body: ChatResponse = {
    response: result.response ?? "",
    sources: result.sources ?? null,
  };
  res.json(body);
});

app.listen(PORT, () => {
  console.log(`Backend läuft auf http://localhost:${PORT}`);
});
