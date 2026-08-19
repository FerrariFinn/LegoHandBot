import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { PipelineStep } from "shared-types";
import { generateText } from "./lib/gemini";
import { RELEVANCE_CHECK_PROMPT, SYSTEM_PROMPT } from "./prompts";

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

// Wird beim ersten Zugriff einmalig eingelesen und danach im Modul-Scope
// zwischengespeichert — die Datei ändert sich zur Laufzeit nicht (Phase 0).
let gesetzbuchTextCache: string | undefined;

function loadGesetzbuchText(): string {
    if (gesetzbuchTextCache === undefined) {
        // Pfad relativ zu process.cwd() statt __dirname/import.meta.url: tsc kopiert
        // die .md nicht nach dist/, aber sowohl `tsx watch src/index.ts` als auch
        // `node dist/index.js` laufen mit backend/ als cwd (Yarn-Workspace-Skripte).
        const path = join(process.cwd(), "src/LegohandGesetzbuch.md");
        gesetzbuchTextCache = readFileSync(path, "utf-8");
    }
    return gesetzbuchTextCache;
}

export const ReadLegohandGesetzbuch: PipelineStep = async (context) => {
    // Irrelevante Fragen sollen die Antwort-Stufe gar nicht erst erreichen, also
    // lohnt sich auch das Einlesen (bzw. der erste Cache-Fill) hier nicht.
    if (context.isRelevant === false) {
        return context;
    }

    return { ...context, gesetzbuchText: loadGesetzbuchText() };
};

export const AnswerQuestion: PipelineStep = async (context) => {
    if (context.isRelevant === false) {
        return { ...context, response: REFUSAL_RESPONSE };
    }

    const systemInstruction = `${SYSTEM_PROMPT}\n\n${context.gesetzbuchText ?? ""}`;

    const history = (context.history ?? []).map((turn) => ({
        role: turn.role === "assistant" ? ("model" as const) : ("user" as const),
        parts: [{ text: turn.text }],
    }));

    const response = await generateText({
        systemInstruction,
        contents: [...history, { role: "user", parts: [{ text: context.query }] }],
    });

    return { ...context, response };
};
