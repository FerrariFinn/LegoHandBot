import type { ChatMode, ChatSource } from "shared-types";
import type { UIMessage } from "./types";

// =====================================================================
// Reine Zustandsübergangs-Funktionen für den Nachrichtenverlauf. Kein DOM-
// oder React-Zugriff — jede Funktion nimmt den bisherigen messages-Array
// entgegen und gibt den neuen zurück. chatController.ts ruft diese über
// setMessages(prev => chatState.fn(prev, ...)) auf.
// =====================================================================

export function startExchange(
  messages: UIMessage[],
  text: string,
  mode: ChatMode
): UIMessage[] {
  return [
    ...messages,
    { role: "user", text, mode },
    { role: "assistant", text: "", sources: null },
  ];
}

export function appendToken(messages: UIMessage[], token: string): UIMessage[] {
  const copy = [...messages];
  copy[copy.length - 1] = {
    ...copy[copy.length - 1],
    text: copy[copy.length - 1].text + token,
  };
  return copy;
}

export function applySources(
  messages: UIMessage[],
  sources: ChatSource[] | null
): UIMessage[] {
  const copy = [...messages];
  copy[copy.length - 1] = { ...copy[copy.length - 1], sources };
  return copy;
}

// Anders als ein simples "Ersetzen": hängt an statt zu ersetzen, denn beim
// echten Streaming kann ein Fehler erst NACH bereits gerenderten Tokens
// eintreffen — den Teilerfolg wegzuwerfen wäre eine Regression.
export function appendErrorText(
  messages: UIMessage[],
  errorText: string
): UIMessage[] {
  const copy = [...messages];
  const prev = copy[copy.length - 1];
  copy[copy.length - 1] = {
    ...prev,
    text: prev.text ? `${prev.text}\n\n${errorText}` : errorText,
  };
  return copy;
}

export function toHistory(
  messages: UIMessage[]
): { role: "user" | "assistant"; text: string }[] {
  return messages.map(({ role, text }) => ({ role, text }));
}
