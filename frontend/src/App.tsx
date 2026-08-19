import logo from "../assets/Logo.png";
import ChatWindow from "./components/ChatWindow";
import { useChatController } from "./chatController";

export default function App() {
  const { messages, input, setInput, mode, setMode, streaming, send } =
    useChatController();

  return (
    <div
      style={{
        maxWidth: 640,
        margin: "0 auto",
        padding: 16,
        fontFamily: '"Times New Roman", Times, serif',
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1>BIERSES</h1>
        <img src={logo} alt="Logo" style={{ height: 80 }} />
      </div>

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

      <ChatWindow
        messages={messages}
        input={input}
        setInput={setInput}
        mode={mode}
        streaming={streaming}
        send={send}
      />
    </div>
  );
}
