import { AIMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import { prisma } from "@/lib/prisma";
import { fastModel } from "../llm/models";
import { chatReplySystemPrompt, chatReplyUserPrompt } from "../prompts/chat-reply.prompt";
import type { HistoryMessage } from "../types";

const MAX_DOC_NAMES = 8;

/** Names of the user's ready documents, so a greeting can suggest a relevant question. */
async function readyDocumentNames(userId: string): Promise<string[]> {
  const docs = await prisma.document.findMany({
    where: { userId, status: "INDEXED" },
    orderBy: { createdAt: "desc" },
    take: MAX_DOC_NAMES,
    select: { fileName: true },
  });
  return docs.map((d) => d.fileName);
}

/**
 * Streams a conversational reply for the "chat" route (greetings, thanks, general questions).
 * Uses the fast model and skips document search entirely.
 */
export async function* generateChatReply(
  userId: string, message: string, history: HistoryMessage[], signal?: AbortSignal,
): AsyncGenerator<string> {
  const documentNames = await readyDocumentNames(userId).catch(() => []);
  const messages = [
    new SystemMessage(chatReplySystemPrompt),
    ...history.slice(-6).map((item) =>
      item.role === "USER" ? new HumanMessage(item.content) : new AIMessage(item.content),
    ),
    new HumanMessage(chatReplyUserPrompt(message, documentNames)),
  ];
  const stream = await fastModel().stream(messages, { signal });
  for await (const chunk of stream) {
    if (signal?.aborted) return;
    if (typeof chunk.content === "string" && chunk.content) yield chunk.content;
  }
}
