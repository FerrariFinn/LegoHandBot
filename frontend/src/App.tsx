import { useState, useRef, useEffect } from "react";
import type { ChatRequest, ChatResponse } from "shared-types";

// =====================================================================
// UI-KONZEPT: Lego-Gesetzbuch Chatbot
// Bewusst ungestylt — nur Struktur & Verhalten. Design kommt von dir.
// Die Antwort kommt bereits von POST /api/chat; da der Backend-Response
// noch kein SSE-Streaming liefert, wird sie nach Erhalt hier per
// fakeStream token-weise "nachgestreamt".
// =====================================================================

function fakeStream(text, onToken, onDone) {
  const tokens = text.split(" ");
  let i = 0;
  const interval = setInterval(() => {
    if (i >= tokens.length) {
      clearInterval(interval);
      onDone();
      return;
    }
    onToken(tokens[i] + " ");
    i++;
  }, 60);
  return () => clearInterval(interval);
}

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState("frage"); // "frage" | "fall"
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView();
  }, [messages]);

  async function send() {
    const text = input.trim();
    if (!text || streaming) return;

    const history = messages.map(({ role, text }) => ({ role, text }));

    setMessages((m) => [
      ...m,
      { role: "user", text, mode },
      { role: "assistant", text: "", sources: null },
    ]);
    setInput("");
    setStreaming(true);

    const appendToken = (token) => {
      setMessages((m) => {
        const copy = [...m];
        copy[copy.length - 1] = {
          ...copy[copy.length - 1],
          text: copy[copy.length - 1].text + token,
        };
        return copy;
      });
    };

    const setErrorText = (errorText) => {
      setMessages((m) => {
        const copy = [...m];
        copy[copy.length - 1] = { ...copy[copy.length - 1], text: errorText };
        return copy;
      });
    };

    try {
      const requestBody: ChatRequest = { query: text, history };
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorText(`Fehler: ${data.error ?? "Unbekannter Fehler"}`);
        setStreaming(false);
        return;
      }

      const chatResponse: ChatResponse = data;
      fakeStream(chatResponse.response, appendToken, () => setStreaming(false));
    } catch (err) {
      setErrorText("Fehler beim Abrufen der Antwort.");
      setStreaming(false);
    }
  }

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: 16 }}>
      <h1>Bierses</h1>

      {/* Modus-Umschalter */}
      <div>
        <label>
          <input
            type="radio"
            checked={mode === "frage"}
            onChange={() => setMode("frage")}
          />{" "}
          Frage stellen
        </label>{" "}
        <label>
          <input
            type="radio"
            checked={mode === "fall"}
            onChange={() => setMode("fall")}
          />{" "}
          Fall lösen
        </label>
      </div>

      <hr />

      {/* Nachrichtenverlauf */}
      <div style={{ minHeight: 300 }}>
        {messages.length === 0 && (
          <p>
            Ich bin Bierses und weiß alles über das Legohandgesetzbuch. <br/> 
            Ich kann Fälle lösen oder Fragen zu einzelnen Paragraphen Beantworten. <br/>
            <br/>
            Cheers!
          </p>
        )}
        {messages.map((msg, i) => (
          <div key={i} style={{ marginBottom: 12 }}>
            <b>{msg.role === "user" ? "Du" : "Bot"}:</b>{" "}
            {msg.mode === "fall" && msg.role === "user" && <i>[Fall] </i>}
            {msg.text}
            {msg.sources && (
              <div>
                <small>
                  Quellen:{" "}
                  {msg.sources.map((s, j) => (
                    <span key={j}>
                      <a href={"#" + s.paragraph}>
                        {s.paragraph} ({s.title})
                      </a>
                      {j < msg.sources.length - 1 ? ", " : ""}
                    </span>
                  ))}
                </small>
              </div>
            )}
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
    </div>
  );
}
