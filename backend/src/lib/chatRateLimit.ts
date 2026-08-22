import type { NextFunction, Request, Response } from "express";
import { supabaseAsUser } from "./supabaseClient";

const HOURLY_QUOTA = 5;

// Begrenzt /api/chat auf 5 Anfragen pro Stunde und Nutzer (Kosten-/Missbrauchsschutz
// für die LLM-Pipeline). Atomarer Postgres-Upsert (check_and_increment_rate_limit,
// siehe backend/sql/rate_limit.sql) statt in-memory-Zähler: überlebt mehrere
// Backend-Instanzen und ist race-condition-sicher unter gleichzeitigen Requests
// desselben Nutzers. Läuft immer nach requireAuth, daher sind req.user/req.token gesetzt.
export async function chatRateLimit(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const client = supabaseAsUser(req.token!);
    const { data, error } = await client.rpc("check_and_increment_rate_limit", {
      p_quota: HOURLY_QUOTA,
    });

    if (error) {
      console.error("Rate-limit check fehlgeschlagen:", error);
      res.status(500).json({ error: "Interner Fehler" });
      return;
    }

    if (data === false) {
      res
        .status(429)
        .json({ error: "Frag nicht so viel, komm in ner Stunde wieder" });
      return;
    }

    next();
  } catch (err) {
    console.error("Rate-limit check hat geworfen:", err);
    res.status(500).json({ error: "Interner Fehler" });
  }
}
