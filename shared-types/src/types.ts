export type PipelineContext = {
    role: "user" | "assistant";
    query: string;
    response?: string;
    history?: { role: "user" | "assistant"; text: string }[];
    sources?: { paragraph: string; title: string }[] | null;
    isRelevant?: boolean;
    gesetzbuchText?: string;
    error?: string;
};

export type PipelineStep = (ctx: PipelineContext) => Promise<PipelineContext>;

export type ChatRequest = {
    query: string;
    history?: { role: "user" | "assistant"; text: string }[];
};

export type ChatResponse = {
    response: string;
    sources: { paragraph: string; title: string }[] | null;
};
