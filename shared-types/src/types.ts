export type ChatRole = "user" | "assistant";

export type ChatTurn = { role: ChatRole; text: string };

export type ChatSource = { paragraph: string; title: string };

/** Wählt zwischen den beiden Pipelines (QuestionQuery/CaseQuery, siehe
 *  backend/src/pipelineController.ts) bzw. der statischen LHGB-Ansicht.
 *  Ist Teil von PipelineContext (siehe unten). */
export type ChatMode = "frage" | "fall" | "lhgb";


export type PipelineContext = {
    role: ChatRole;
    query: string;
    chatmode: ChatMode;
    response?: string;
    history?: ChatTurn[];
    sources?: ChatSource[] | null;
    isRelevant?: boolean;
    gesetzbuchText?: string;
    /** Access-Token des anfragenden Nutzers — wird für Supabase-Storage-Zugriffe
     *  (z. B. gesetzbuchLoader) durchgereicht, siehe requireAuth.ts/index.ts. */
    token?: string;
    error?: string;
    /** Wird pro empfangenem Gemini-Chunk aufgerufen — Transport (SSE) ist Aufgabe der Route. */
    onToken?: (token: string) => void;
    /** Client-Disconnect o.ä.; wird an den Gemini-Stream-Call durchgereicht. */
    signal?: AbortSignal;
};

export type PipelineStep = (ctx: PipelineContext) => Promise<PipelineContext>;

export type ChatStreamEvent =
    | { event: "token"; data: { text: string } }
    | { event: "done"; data: { sources: ChatSource[] | null } }
    | { event: "error"; data: { error: string } };

export type LhgbResponse = { text: string };
