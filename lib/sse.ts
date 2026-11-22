import {z} from "zod";
import type {
  ChatStatusEvent,
  ChatTokenEvent,
  ChatReplaceEvent,
  ChatFinalEvent,
  ChatErrorEvent,
} from "./api/chat-types";

const statusSchema = z.object({
  stage: z.enum([
    "guarding",
    "optimizing",
    "retrieving",
    "reranking",
    "generating",
    "verifying",
  ]),
});

const tokenSchema = z.object({
  text: z.string(),
});

const replaceSchema = z.object({
  text: z.string(),
});

const citationSchema = z.object({
  n: z.number(),
  documentId: z.string(),
  fileName: z.string(),
  pageNumber: z.number(),
  chunkIndex: z.number(),
});

const finalSchema = z.object({
  conversationId: z.string(),
  messageId: z.string(),
  citations: z.array(citationSchema),
  verdict: z.enum(["passed", "replaced"]),
});

const errorSchema = z.object({
  code: z.string(),
  message: z.string(),
});

export interface SSECallbacks {
  onStatus?: (data: ChatStatusEvent) => void;
  onToken?: (data: ChatTokenEvent) => void;
  onReplace?: (data: ChatReplaceEvent) => void;
  onFinal?: (data: ChatFinalEvent) => void;
  onError?: (data: ChatErrorEvent) => void;
  onDone?: () => void;
}

export function parseSSEBlock(block: string, callbacks: SSECallbacks): void {
  const lines = block.split(/\r?\n/);
  let eventType = "message";
  let dataRaw = "";

  for (const line of lines) {
    if (line.startsWith("event:")) {
      eventType = line.slice(6).trim();
    } else if (line.startsWith("data:")) {
      const value = line.slice(5).trim();
      dataRaw = dataRaw ? `${dataRaw}\n${value}` : value;
    }
  }

  if (!dataRaw && eventType !== "done") return;

  try {
    const json = dataRaw ? JSON.parse(dataRaw) : {};

    switch (eventType) {
      case "status": {
        const parsed = statusSchema.safeParse(json);
        if (parsed.success && callbacks.onStatus) {
          callbacks.onStatus(parsed.data);
        }
        break;
      }
      case "token": {
        const parsed = tokenSchema.safeParse(json);
        if (parsed.success && callbacks.onToken) {
          callbacks.onToken(parsed.data);
        }
        break;
      }
      case "replace": {
        const parsed = replaceSchema.safeParse(json);
        if (parsed.success && callbacks.onReplace) {
          callbacks.onReplace(parsed.data);
        }
        break;
      }
      case "final": {
        const parsed = finalSchema.safeParse(json);
        if (parsed.success && callbacks.onFinal) {
          callbacks.onFinal(parsed.data);
        }
        break;
      }
      case "error": {
        const parsed = errorSchema.safeParse(json);
        if (parsed.success && callbacks.onError) {
          callbacks.onError(parsed.data);
        }
        break;
      }
      case "done": {
        if (callbacks.onDone) {
          callbacks.onDone();
        }
        break;
      }
      default:
        // Unknown events are safely ignored
        break;
    }
  } catch {
    // Malformed JSON is safely ignored
  }
}

export async function parseSSEStream(
  stream: ReadableStream<Uint8Array>,
  callbacks: SSECallbacks,
  signal?: AbortSignal,
): Promise<void> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (!signal?.aborted) {
      const {done, value} = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, {stream: true});
      const blocks = buffer.split(/\r?\n\r?\n/);
      buffer = blocks.pop() ?? "";

      for (const block of blocks) {
        if (block.trim()) {
          parseSSEBlock(block, callbacks);
        }
      }
    }

    if (buffer.trim() && !signal?.aborted) {
      parseSSEBlock(buffer, callbacks);
    }
  } finally {
    reader.releaseLock();
  }
}
