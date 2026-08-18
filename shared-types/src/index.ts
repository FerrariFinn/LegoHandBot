// shared-types
//
// Zentrale TS-Typen, die von frontend/ und backend/ gemeinsam genutzt werden.
// Wird per Yarn-Workspace ("shared-types": "workspace:*") eingebunden.
//
// Kommt in Phase 1 (siehe ticket-gesetzbuch-chatbot-v4.md):
// - Chunk-Typ (chapter, paragraph, title, text, embedding?, score?)
// - PipelineContext / Step-Typen
//
// Platzhalter, damit das Package schon jetzt als Dependency referenzierbar ist.
export type Placeholder = unknown;
