import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { answerModel } from "../llm/models";
import { answerSystemPrompt } from "../prompts/answer-system.prompt";
import type { HistoryMessage } from "../types";
export async function* generateAnswer(
  question: string, context: string, history: HistoryMessage[], signal?: AbortSignal,
): AsyncGenerator<string> {
  const messages = [
    new SystemMessage(answerSystemPrompt),
    ...history.map((item) => new HumanMessage(`${item.role}: ${item.content}`)),
    new HumanMessage(`DATA:\n${context}\n\nORIGINAL USER QUESTION:\n${question}`),
  ];
  const stream = await answerModel().stream(messages, { signal });
  for await (const chunk of stream) {
    if (signal?.aborted) return;
    if (typeof chunk.content === "string" && chunk.content) yield chunk.content;
  }
}
