import { errorMessage } from "./chat-types";
import { parseSSEStream, type SSECallbacks } from "../sse";

export interface StreamChatParams {
  conversationId?: string;
  message: string;
  documentIds?: string[];
  signal?: AbortSignal;
}

export async function streamChatApi(
  params: StreamChatParams,
  callbacks: SSECallbacks,
): Promise<void> {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      conversationId: params.conversationId,
      message: params.message,
      documentIds: params.documentIds?.length ? params.documentIds : undefined,
    }),
    signal: params.signal,
  });

  if (!response.ok) {
    const json = await response.json().catch(() => ({}));
    const code =
      response.status === 429
        ? "rate_limited"
        : response.status === 401
        ? "unauthorized"
        : "generation_failed";
    throw new Error(json.error || errorMessage(code));
  }

  if (!response.body) {
    throw new Error("No response stream available.");
  }

  await parseSSEStream(response.body, callbacks, params.signal);
}
