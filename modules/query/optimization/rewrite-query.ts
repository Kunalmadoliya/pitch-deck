import { z } from "zod";
import type { HistoryMessage } from "../types";
import { callStructured } from "../llm/structured";
import { rewritePrompt } from "../prompts/rewrite.prompt";
const result = z.object({ question: z.string().min(1) });
export async function rewriteQuery(message: string, history: HistoryMessage[]): Promise<string> {
  const text = history.map((item) => `${item.role}: ${item.content}`).join("\n");
  return (await callStructured(result, rewritePrompt(message, text))).question;
}
