import type { ChatMode } from "shared-types";
import logo from "../../assets/Logo.png";
import { Heading } from "./ui/Heading";
import { Button } from "./ui/Button";
import ModeSwitcher from "./ModeSwitcher";

// =====================================================================
// Rein präsentational: Titel + Logo + Modus-Umschalter als ein
// zusammenhängender, sticky positionierter Block. Bleibt beim Scrollen
// exakt oben stehen — der Chatverlauf verschwindet dahinter/darunter.
// Die untere Kante (border-b) markiert sichtbar, wo dieser Bereich endet.
// Kein eigener State — alle Werte/Callbacks kommen von App.tsx.
// =====================================================================

export default function Header({
  onLogout,
  mode,
  setMode,
  canStartNewChat,
  onNewChat,
}: {
  onLogout?: () => void;
  mode: ChatMode;
  setMode: (mode: ChatMode) => void;
  canStartNewChat: boolean;
  onNewChat: () => void;
}) {
  function handleNewChat() {
    if (window.confirm("Neuen Chat starten? Der bisherige Verlauf in diesem Tab geht verloren.")) {
      onNewChat();
    }
  }

  return (
    <div className="sticky top-0 z-20 flex flex-col bg-white px-4 py-3">
      <div className="flex items-center justify-between">
        <Heading variant="brand" className="my-0">
          Frag BIERSES
        </Heading>
        <div className="flex flex-col items-end">
          <img src={logo} alt="Logo" className="h-20 translate-y-3" />
          <div className="flex items-center gap-2 translate-y-8">
            {/* Setzt nur den Verlauf des aktuell aktiven Tabs zurück; erst
                sichtbar, sobald es in diesem Tab etwas zum Zurücksetzen gibt. */}
            {canStartNewChat && (
              <Button
                type="button"
                variant="secondary"
                onClick={handleNewChat}
                className="text-xs"
              >
                Neuer Chat
              </Button>
            )}
            {onLogout && (
              <Button
                type="button"
                variant="secondary"
                onClick={onLogout}
                className="text-xs"
              >
                Abmelden
              </Button>
            )}
          </div>
        </div>
      </div>
      <ModeSwitcher mode={mode} setMode={setMode} />
    </div>
  );
}
