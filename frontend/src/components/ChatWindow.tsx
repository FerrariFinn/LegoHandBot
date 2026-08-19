import { useEffect, useRef } from "react";
import type { ChatMode } from "shared-types";
import type { UIMessage } from "../types";
import MarkdownMessage from "./MarkdownMessage";

// =====================================================================
// Rein präsentational: Nachrichtenverlauf + Eingabeformular. Nimmt Zustand
// und Callbacks als Props entgegen, macht selbst keine fetch/SSE-Aufrufe.
// Frontend-Analogon zum "Renderer" — DOM/JSX statt Netzwerklogik.
// =====================================================================

export default function ChatWindow({
  messages,
  input,
  setInput,
  mode,
  streaming,
  send,
}: {
  messages: UIMessage[];
  input: string;
  setInput: (v: string) => void;
  mode: ChatMode;
  streaming: boolean;
  send: () => void;
}) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView();
  }, [messages]);

  return (
    <>
      {/* Nachrichtenverlauf */}
      <div style={{ minHeight: 300 }}>
        {messages.length === 0 && (
          <div
            style={{
              maxWidth: "75%",
              padding: "8px 12px",
              borderRadius: 12,
              background: "#f3cb49",
              fontFamily: "monospace",
              display: "flex",
            }}
          >
            <p>
              Ich bin Bierses und weiß alles über das Legohandgesetzbuch. <br />
              Ich kann Fälle lösen oder Fragen zu einzelnen Paragraphen Beantworten. <br />
              <br />
              Cheers!
            </p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
              marginBottom: 12,
            }}
          >
            <div
              style={{
                maxWidth: "75%",
                padding: "8px 12px",
                borderRadius: 12,
                background: msg.role === "user" ? "#ebeef3" : "#f3cb49",
                fontFamily: "monospace",
              }}
            >
              <b>{msg.role === "user" ? "Du" : "Bot"}:</b>{" "}
              {msg.mode === "fall" && msg.role === "user" && <i>[Fall] </i>}
              <MarkdownMessage text={msg.text} />
              {msg.sources && (
                <div>
                  <small>
                    Quellen:{" "}
                    {msg.sources.map((s, j) => (
                      <span key={j}>
                        <a href={"#" + s.paragraph}>
                          {s.paragraph} ({s.title})
                        </a>
                        {j < msg.sources!.length - 1 ? ", " : ""}
                      </span>
                    ))}
                  </small>
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <hr />

      {/* Eingabe */}
      <div>
        <textarea
          rows={3}
          style={{ width: "100%" }}
          value={input}
          placeholder={
            mode === "frage"
              ? "z. B. Wann wird man mit der Malzratsbestrafung zur rechenschaft gezogen?"
              : "Fall schildern..."
          }
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
        />
        <button onClick={send} disabled={streaming || !input.trim()}>
          {streaming ? "..." : "Senden"}
        </button>
      </div>
    </>
  );
}
