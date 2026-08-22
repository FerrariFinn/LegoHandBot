import type { NextFunction, Request, Response } from "express";
import type { User } from "@supabase/supabase-js";
import { supabase } from "./supabaseClient";

declare global {
  namespace Express {
    interface Request {
      user?: User;
      token?: string;
    }
  }
}

// Express-Middleware: prüft den Supabase-Access-Token aus dem
// Authorization-Header, bevor die Chat-Pipeline läuft. getUser() geht dafür
// gegen Supabases Auth-Server — eine lokale JWT-Verifikation bräuchte das
// separate Projekt-JWT-Secret, das (noch) nicht in .env steht.
export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length)
    : null;

  if (!token) {
    res.status(401).json({ error: "Nicht authentifiziert" });
    return;
  }

  try {
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      res.status(401).json({ error: "Nicht authentifiziert" });
      return;
    }

    req.user = data.user;
    req.token = token;
    next();
  } catch {
    res.status(401).json({ error: "Nicht authentifiziert" });
  }
}
