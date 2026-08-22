import { readFileSync } from "node:fs";
import { join } from "node:path";

// Wird beim ersten Zugriff einmalig eingelesen und danach im Modul-Scope
// zwischengespeichert — die Datei ändert sich zur Laufzeit nicht (Phase 0).
// Eigenes Modul statt Teil von pipelineSteps.ts, damit auch die /api/lhgb-
// Route (index.ts) denselben Cache nutzt statt die Datei doppelt zu lesen.
let gesetzbuchTextCache: string | undefined;

export function loadGesetzbuchText(): string {
    if (gesetzbuchTextCache === undefined) {
        // Pfad relativ zu process.cwd() statt __dirname/import.meta.url: tsc kopiert
        // die .md nicht nach dist/, aber sowohl `tsx watch src/index.ts` als auch
        // `node dist/index.js` laufen mit backend/ als cwd (Yarn-Workspace-Skripte).
        const path = join(process.cwd(), "src/Legohand_Gesetzbuch_Camping.md");
        gesetzbuchTextCache = readFileSync(path, "utf-8");
    }
    return gesetzbuchTextCache;
}
