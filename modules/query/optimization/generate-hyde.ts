import { z } from "zod";
import { callStructured } from "../llm/structured";
import { hydePrompt } from "../prompts/hyde.prompt";
export async function generateHyde(question: string): Promise<string> {
  return (await callStructured(z.object({ passage: z.string() }), hydePrompt(question))).passage;
}
