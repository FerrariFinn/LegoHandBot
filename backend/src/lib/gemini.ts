import { GoogleGenAI } from "@google/genai";

// Zentraler SDK-Wrapper, siehe ticket-gesetzbuch-chatbot-v4.md.
// Modellnamen kommen aus der Env, nicht hardcoden — Google benennt die gern um.
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const MODEL = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";
const MODEL_LIGHT = process.env.GEMINI_MODEL_LIGHT ?? "gemini-2.5-flash-lite";

export type GenerateOptions = {
    systemInstruction: string;
    contents: { role: "user" | "model"; parts: { text: string }[] }[];
    /** Nutzt das leichte Modell (z. B. für die Relevanzprüfung) statt des Hauptmodells. */
    light?: boolean;
    /** Client-Disconnect etc. — nur clientseitige Abbruch-Semantik laut SDK-Doku. */
    abortSignal?: AbortSignal;
};

/**
 * Ein einfacher, nicht-streamender generateContent-Call — für die Relevanzprüfung,
 * die ohnehin nur ein kurzes true/false zurückgibt.
 */
export async function generateText({ systemInstruction, contents, light, abortSignal }: GenerateOptions): Promise<string> {
    const response = await ai.models.generateContent({
        model: light ? MODEL_LIGHT : MODEL,
        config: { systemInstruction, abortSignal },
        contents,
    });

    return response.text ?? "";
}

/**
 * Streamende Variante für die eigentliche Antwortgenerierung: gibt Text-Chunks
 * aus, sobald Gemini sie liefert, statt auf die komplette Antwort zu warten.
 */
export async function* generateTextStream({ systemInstruction, contents, light, abortSignal }: GenerateOptions): AsyncGenerator<string> {
    const stream = await ai.models.generateContentStream({
        model: light ? MODEL_LIGHT : MODEL,
        config: { systemInstruction, abortSignal },
        contents,
    });

    for await (const chunk of stream) {
        if (chunk.text) yield chunk.text;
    }
}
