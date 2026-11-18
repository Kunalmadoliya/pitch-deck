import { z } from "zod";
import { callStructured } from "../llm/structured";
import { stepBackPrompt } from "../prompts/step-back.prompt";
export async function stepBackQuery(question: string): Promise<string> {
  return (await callStructured(z.object({ question: z.string() }), stepBackPrompt(question))).question;
}
