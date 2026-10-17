import type { PipelineContext, PipelineStep } from "shared-types";
import { AnswerQuestion, isRelevantQuery, ReadLegohandGesetzbuch } from "./pipelineSteps.js";

export const QuestionQuery: PipelineStep[] = [ isRelevantQuery, ReadLegohandGesetzbuch, AnswerQuestion];
export const CaseQuery: PipelineStep[] = [];

export const runPipeline = async (steps: PipelineStep[], initialContext: PipelineContext): Promise<PipelineContext> => {
    let context = initialContext;
    for (const step of steps) {
        const startedAt = Date.now();
        console.log(`[pipeline] ${step.name} gestartet`);
        try {
            context = await step(context);
            console.log(`[pipeline] ${step.name} fertig nach ${Date.now() - startedAt} ms`);
        } catch (err) {
            console.error("Pipeline-Step fehlgeschlagen:", err);
            return { ...context, error: "Interner Fehler bei der Verarbeitung" };
        }
    }
    return context;
}
