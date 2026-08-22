import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import ChatWindow from "./components/ChatWindow";
import Header from "./components/Header";
import LhgbView from "./components/LhgbView";
import LoginPage from "./components/LoginPage";
import { useChatController } from "./chatController";
import { supabase } from "./lib/supabaseClient";

export default function App() {
  const { messages, input, setInput, mode, setMode, streaming, send, newChat } =
    useChatController();

  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  function handleLogout() {
    supabase.auth.signOut();
  }

  if (loading) {
    return null;
  }

  if (!session) {
    return <LoginPage />;
  }

  return (
    <div className="mx-auto flex max-w-[640px] flex-col gap-4 p-4 font-serif">
      <Header
        onLogout={handleLogout}
        mode={mode}
        setMode={setMode}
        canStartNewChat={messages.length > 0}
        onNewChat={newChat}
      />

      {mode === "lhgb" ? (
        <LhgbView />
      ) : (
        <ChatWindow
          messages={messages}
          input={input}
          setInput={setInput}
          mode={mode}
          streaming={streaming}
          send={send}
        />
      )}
    </div>
  );
}
