import express from "express";
import cors from "cors";
import { handleChat } from "./apiHandlers.js";
import { requireAuth } from "./lib/requireAuth.js";
import { handleLhgb } from "./apiHandlers.js";

const app = express();
const PORT = Number(process.env.PORT ?? 3001);

// FRONTEND_URL kann eine kommagetrennte Liste sein (z.B. Apex- + www-Domain,
// oder Preview- + Prod-URL) — ein einzelner exakter String-Match ist zu
// zerbrechlich (schema/trailing-slash-Abweichungen führen sonst dazu, dass
// der Browser eine ansonsten erfolgreiche Response stillschweigend verwirft).
// Trailing slashes werden hier abgeschnitten, weil der Origin-Header des
// Browsers nie einen Pfad/Slash enthält.
const allowedOrigins = (process.env.FRONTEND_URL ?? "")
  .split(",")
  .map((origin) => origin.trim().replace(/\/$/, ""))
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    console.warn(`CORS: Origin "${origin}" nicht in FRONTEND_URL (${allowedOrigins.join(", ")})`);
    callback(null, false);
  },
}));

app.use(express.json());

// Health-Check — dient hier nur zum lokalen Testen des Grundgerüsts.
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

//endpoint for the chat
app.post("/api/chat", requireAuth, handleChat);

//get the LHGB .md 
app.get("/api/lhgb", requireAuth, handleLhgb );

app.listen(PORT, () => {
  console.log(`Backend läuft auf http://localhost:${PORT}`);
});
