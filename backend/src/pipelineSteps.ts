import type { PipelineStep } from "shared-types";
import { generateText, generateTextStream } from "./lib/gemini.js";
import { loadGesetzbuchText } from "./lib/gesetzbuchLoader.js";
import { RELEVANCE_CHECK_PROMPT, QUESTION_QUERY_SYSTEM_PROMPT, CASE_QUERY_SYSTEM_PROMPT } from "./prompts.js";

const REFUSAL_RESPONSE =
    "Bro — Mich interressiert nur Bier und wie schnell der Legohandhalter es bekommt.";

export const isRelevantQuery: PipelineStep = async (context) => {
    // Leichtgewichtige LLM-Prüfung (gemini-2.5-flash-lite), ob die Frage überhaupt
    // einen Bezug zum LhGb hat. Spart das teure AnswerQuestion/ReadLegohandGesetzbuch
    // bei offensichtlich fachfremden Fragen.
    const raw = await generateText({
        systemInstruction: RELEVANCE_CHECK_PROMPT,
        contents: [{ role: "user", parts: [{ text: context.query }] }],
        light: true,
    });

    const isRelevant = raw.trim().toLowerCase().startsWith("true");

    return { ...context, isRelevant };
};

export const ReadLegohandGesetzbuch: PipelineStep = async (context) => {
    // Irrelevante Fragen sollen die Antwort-Stufe gar nicht erst erreichen, also
    // lohnt sich auch das Einlesen (bzw. der erste Cache-Fill) hier nicht.
    if (context.isRelevant === false) {
        return context;
    }

    return { ...context, gesetzbuchText: await loadGesetzbuchText(context.token!) };
};

export const AnswerQuestion: PipelineStep = async (context) => {
    if (context.isRelevant === false) {
        context.onToken?.(REFUSAL_RESPONSE);
        return { ...context, response: REFUSAL_RESPONSE };
    }

    const systemInstruction = context.chatmode === "frage" ? `${QUESTION_QUERY_SYSTEM_PROMPT}\n\n${context.gesetzbuchText ?? ""}` : `${CASE_QUERY_SYSTEM_PROMPT}\n\n${context.gesetzbuchText ?? ""}`;

    const history = (context.history ?? []).map((turn) => ({
        role: turn.role === "assistant" ? ("model" as const) : ("user" as const),
        parts: [{ text: turn.text }],
    }));

    // Chunks direkt weiterreichen (SSE), am Ende trotzdem die volle Antwort im
    // Context behalten — für Konsumenten von runPipeline ohne onToken (z. B. Evals).
    let response = "";
    for await (const token of generateTextStream({
        systemInstruction,
        contents: [...history, { role: "user", parts: [{ text: context.query }] }],
        abortSignal: context.signal,
    })) {
        response += token;
        context.onToken?.(token);
    }

    return { ...context, response };
};
