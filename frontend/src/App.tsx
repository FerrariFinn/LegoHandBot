import { useState, useRef, useEffect } from "react";

// =====================================================================
// UI-KONZEPT: Lego-Gesetzbuch Chatbot
// Bewusst ungestylt — nur Struktur & Verhalten. Design kommt von dir.
// Streaming ist hier gemockt; im echten Frontend ersetzt useChatStream
// (SSE gegen POST /api/chat) die fakeStream-Funktion.
// =====================================================================

const MOCK_ANSWER =
  "Nach § 12 Abs. 2 ist das Zerlegen fremder Bauwerke ohne Zustimmung des Erbauers unzulässig. Eine Ausnahme gilt nach § 14, wenn das Bauwerk die gemeinsame Bauplatte blockiert. Im vorliegenden Fall greift die Ausnahme nicht, da die Blockade nicht nachgewiesen wurde.";

const MOCK_SOURCES = [
  { paragraph: "§ 12", title: "Schutz fremder Bauwerke" },
  { paragraph: "§ 14", title: "Ausnahmen bei Plattenblockade" },
];

function fakeStream(onToken, onDone) {
  const tokens = MOCK_ANSWER.split(" ");
  let i = 0;
  const interval = setInterval(() => {
    if (i >= tokens.length) {
      clearInterval(interval);
      onDone(MOCK_SOURCES);
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

  function send() {
    const text = input.trim();
    if (!text || streaming) return;

    setMessages((m) => [
      ...m,
      { role: "user", text, mode },
      { role: "assistant", text: "", sources: null },
    ]);
    setInput("");
    setStreaming(true);

    fakeStream(
      (token) => {
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = {
            ...copy[copy.length - 1],
            text: copy[copy.length - 1].text + token,
          };
          return copy;
        });
      },
      (sources) => {
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = { ...copy[copy.length - 1], sources };
          return copy;
        });
        setStreaming(false);
      }
    );
  }

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: 16 }}>
      <h1>Lego-Gesetzbuch Bot</h1>

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
            Stell eine Frage zum Gesetzbuch oder schilder einen Fall.
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
              ? "z. B. Was sagt das Gesetz zu fremden Bauwerken?"
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
