import { useState } from "react";
import logo from "../../assets/Logo.png";
import { Heading } from "./ui/Heading";
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";
import { supabase } from "../lib/supabaseClient";

// =====================================================================
// Login-Gate vor der eigentlichen App. Authentifizierung läuft über
// Supabase (E-Mail/Passwort) — bei Erfolg meldet supabase.auth einen
// Session-Change, auf den App.tsx reagiert und die App freischaltet.
// =====================================================================

type Mode = "signin" | "signup";

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setInfo(null);

    const { error, data } =
      mode === "signin"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    if (mode === "signup" && !data.session) {
      setInfo("Bestätige deine E-Mail, um dich anzumelden.");
    }

    // Bei Erfolg mit sofortiger Session übernimmt App.tsx via
    // onAuthStateChange automatisch das Freischalten.
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-[640px] items-center justify-center p-4 font-serif">
      <div className="flex w-full max-w-[360px] flex-col items-center gap-4">
        <img src={logo} alt="Logo" className="h-[120px]" />
        <Heading variant="brand" className="m-0">
          BIERSES
        </Heading>

        <form onSubmit={handleSubmit} className="flex w-full flex-col gap-3">
          <Input
            type="email"
            placeholder="E-Mail"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Passwort"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          {error && <p className="m-0 text-sm text-error">{error}</p>}
          {info && <p className="m-0 text-sm text-muted">{info}</p>}
          <Button type="submit" variant="primary" disabled={loading}>
            {loading
              ? "Bitte warten…"
              : mode === "signin"
                ? "Anmelden"
                : "Registrieren"}
          </Button>
        </form>

        <button
          type="button"
          onClick={() => {
            setMode(mode === "signin" ? "signup" : "signin");
            setError(null);
            setInfo(null);
          }}
          className="cursor-pointer border-0 bg-transparent p-0 font-serif text-sm underline"
        >
          {mode === "signin"
            ? "Noch kein Konto? Registrieren"
            : "Bereits registriert? Anmelden"}
        </button>
      </div>
    </div>
  );
}
