import { GoogleGenAI } from "@google/genai";

// Zentraler SDK-Wrapper, siehe ticket-gesetzbuch-chatbot-v4.md.
// Modellnamen kommen aus der Env, nicht hardcoden — Google benennt die gern um.
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const MODEL = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";
const MODEL_LIGHT = process.env.GEMINI_MODEL_LIGHT ?? "gemini-3.5-flash-lite";

export type GenerateOptions = {
    systemInstruction: string;
    contents: { role: "user" | "model"; parts: { text: string }[] }[];
    /** Nutzt das leichte Modell (z. B. für die Relevanzprüfung) statt des Hauptmodells. */
    light?: boolean;
};

/**
 * Ein einfacher, nicht-streamender generateContent-Call. Streaming ist Aufgabe der
 * Route (SSE), sobald es eine gibt — die Pipeline-Steps bleiben reine Funktionen,
 * die den fertigen Text zurückgeben.
 */
export async function generateText({ systemInstruction, contents, light }: GenerateOptions): Promise<string> {
    const response = await ai.models.generateContent({
        model: light ? MODEL_LIGHT : MODEL,
        config: { systemInstruction },
        contents,
    });

    return response.text ?? "";
}
