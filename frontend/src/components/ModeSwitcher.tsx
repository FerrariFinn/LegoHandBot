import type { ChatMode } from "shared-types";
import { Tab } from "./ui/Tab";

// =====================================================================
// Rein präsentational: Umschalter zwischen "Frage stellen" und
// "Fall lösen", als Browserstyle-Tabs auf einer goldenen Trennlinie.
// Nimmt den aktuellen Modus und einen Setter als Props.
// =====================================================================

export default function ModeSwitcher({
  mode,
  setMode,
}: {
  mode: ChatMode;
  setMode: (mode: ChatMode) => void;
}) {
  return (
    <div role="tablist" className="flex gap-1 border-b-2 border-gold">
      <Tab active={mode === "frage"} onClick={() => setMode("frage")}>
        Frage stellen
      </Tab>
      <Tab active={mode === "fall"} onClick={() => setMode("fall")}>
        Fall lösen
      </Tab>
      <Tab active={mode === "lhgb"} onClick={() => setMode("lhgb")}>
        LHGB
      </Tab>
    </div>
  );
}
