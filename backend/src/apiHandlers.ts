import { Request, Response } from "express";
import { PipelineContext } from "shared-types";
import { startSseResponse } from "./lib/sse";
import { QuestionQuery, runPipeline } from "./pipelineController";
import { loadGesetzbuchText } from "./lib/gesetzbuchLoader";
import { chatRateLimit } from "./lib/chatRateLimit";

export const handleChat = async (req: Request, res: Response) => {

  if (!chatRateLimit(req, res)) return;
  
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
    token: req.token,
    onToken: (token) => sendEvent({ event: "token", data: { text: token } }),
    signal,
  });

  if (result.error) {
    sendEvent({ event: "error", data: { error: result.error } });
  } else {
    sendEvent({ event: "done", data: { sources: result.sources ?? null } });
  }
  res.end();
}

export const handleLhgb = async (req: Request, res: Response) => {
  try {
    const text = await loadGesetzbuchText(req.token!);
    res.json({ text });
  } catch (err) {
    console.error("Gesetzbuch-Ladefehler:", err);
    res.status(500).json({ error: "Gesetzbuch konnte nicht geladen werden" });
  }
}