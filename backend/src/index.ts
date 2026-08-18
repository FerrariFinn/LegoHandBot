import express from "express";
import cors from "cors";

const app = express();
const PORT = Number(process.env.PORT ?? 3001);

app.use(cors());
app.use(express.json());

// Health-Check — dient hier nur zum lokalen Testen des Grundgerüsts.
// Die eigentlichen /api/chat-Routen (Baseline- & RAG-Pipeline) kommen in
// Phase 0/3, siehe ticket-gesetzbuch-chatbot-v4.md.
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Backend läuft auf http://localhost:${PORT}`);
});
