import { z } from "zod";
import { callStructured } from "../llm/structured";
import { subQueriesPrompt } from "../prompts/sub-queries.prompt";
export async function generateSubQueries(question: string): Promise<string[]> {
  return (await callStructured(z.object({ questions: z.array(z.string()).max(3) }), subQueriesPrompt(question))).questions;
}
