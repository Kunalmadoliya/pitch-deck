import { z } from "zod";
import { callStructured } from "../../llm/structured";
import { groundednessPrompt } from "../../prompts/groundedness.prompt";
const verdict = z.object({ grounded: z.boolean(), unsupportedClaims: z.array(z.string()) });
export async function checkGroundedness(answer: string, context: string): Promise<z.output<typeof verdict>> {
  return callStructured(verdict, groundednessPrompt(answer, context));
}
