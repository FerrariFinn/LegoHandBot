import type { PipelineContext, PipelineStep } from "shared-types";
import { AnswerQuestion, isRelevantQuery, ReadLegohandGesetzbuch } from "./pipelineSteps.js";

export const QuestionQuery: PipelineStep[] = [ isRelevantQuery, ReadLegohandGesetzbuch, AnswerQuestion];
export const CaseQuery: PipelineStep[] = [];

export const runPipeline = async (steps: PipelineStep[], initialContext: PipelineContext): Promise<PipelineContext> => {
    let context = initialContext;
    for (const step of steps) {
        try {
            context = await step(context);
        } catch (err) {
            console.error("Pipeline-Step fehlgeschlagen:", err);
            return { ...context, error: "Interner Fehler bei der Verarbeitung" };
        }
    }
    return context;
}
