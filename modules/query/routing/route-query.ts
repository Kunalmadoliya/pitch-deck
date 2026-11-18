import { z } from "zod";
import { callStructured } from "../llm/structured";
import { routerPrompt } from "../prompts/router.prompt";
import type { RouteDecision } from "../types";
const decision = z.object({
  route: z.enum(["content", "metadata", "both"]),
  metadataIntent: z.enum(["list_documents", "count_documents", "document_status", "recent_documents"]).nullable(),
});
export async function routeQuery(question: string): Promise<RouteDecision> {
  if (/\b(my documents|what did i upload|how many files|is my file processed)\b/i.test(question)) {
    return { route: "metadata", metadataIntent: /\bhow many\b/i.test(question) ? "count_documents" : "list_documents" };
  }
  const result = await callStructured(decision, routerPrompt(question));
  return { route: result.route, metadataIntent: result.metadataIntent ?? undefined };
}
