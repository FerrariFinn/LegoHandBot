import { useEffect, useRef } from "react";
import type { ChatMode } from "shared-types";
import type { UIMessage } from "../types";
import MarkdownMessage from "./MarkdownMessage";
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";
import { Textarea } from "./ui/Textarea";
import { cn } from "../lib/utils";

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
      <div className="min-h-[300px]">
        {messages.length === 0 && (
          <Card sender="bot" className="flex">
            <p>
              Ich bin Bierses. <br />
              Ich weiß alles über das Legohandgesetzbuch. <br />
              {mode === "frage" ? (
                <>Ich kann Fragen zu einzelnen Paragraphen Beantworten. <br /></>
              ) : (
                <>Ich kann Fälle lösen. <br /></>
              )}
              <br />
              Cheers!
            </p>
          </Card>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={cn(
              "flex mb-3",
              msg.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            <Card sender={msg.role === "user" ? "user" : "bot"}>
              <b>{msg.role === "user" ? "Du" : "Bierses"}:</b>{" "}
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
            </Card>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Eingabe */}
      <div className="flex flex-col gap-2">
        <Textarea
          rows={3}
          value={input}
          placeholder={
            mode === "frage"
              ? "z. B. Wann wird man mit der Malzratsbestrafung zur rechenschaft gezogen?"
              : "Beschreibe deinen Fall..."
          }
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
        />
        <Button variant="secondary" onClick={send} disabled={streaming || !input.trim()}>
          {streaming ? "..." : "Senden"}
        </Button>
      </div>
    </>
  );
}
