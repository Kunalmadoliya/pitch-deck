import { z } from "zod";
import { callStructured } from "../../llm/structured";
import { injectionCheckPrompt } from "../../prompts/injection-check.prompt";
const verdict = z.object({ safe: z.boolean(), reason: z.string().max(80) });
export async function classifyInjection(message: string): Promise<z.output<typeof verdict>> {
  return callStructured(verdict, injectionCheckPrompt(message));
}
