import { supabaseAsUser } from "./supabaseClient.js";

// Liegt im privaten Supabase-Storage-Bucket "LegohandGesetzbuch" (RLS: nur
// authenticated darf lesen, siehe backend/sql/gesetzbuch_storage_policy.sql)
// statt im Repo — deshalb der Fetch über den Nutzer-Token statt readFileSync.
const BUCKET = "LegohandGesetzbuch";
const OBJECT_PATH = "Legohand_Gesetzbuch_Camping.md";

// Wird beim ersten Zugriff einmalig geladen und danach im Modul-Scope
// zwischengespeichert — der Inhalt ändert sich zur Laufzeit nicht (Phase 0)
// und ist unabhängig davon, wessen Token den Erstabruf ausgelöst hat.
// Eigenes Modul statt Teil von pipelineSteps.ts, damit auch die /api/lhgb-
// Route (index.ts) denselben Cache nutzt statt die Datei doppelt zu laden.
let gesetzbuchTextCache: string | undefined;

export async function loadGesetzbuchText(token: string): Promise<string> {
    if (gesetzbuchTextCache === undefined) {
        const { data, error } = await supabaseAsUser(token)
            .storage.from(BUCKET)
            .download(OBJECT_PATH);

        if (error || !data) {
            throw new Error(
                `Gesetzbuch konnte nicht aus Supabase Storage geladen werden: ${error?.message ?? "unbekannter Fehler"}`
            );
        }

        gesetzbuchTextCache = await data.text();
    }
    return gesetzbuchTextCache;
}
