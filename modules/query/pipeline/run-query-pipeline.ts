import { runInputGuard } from "../guardrails/input/run-input-guard";
import { buildContext } from "../generation/build-context";
import { generateAnswer } from "../generation/generate-answer";
import { generateChatReply } from "../generation/generate-chat-reply";
import { loadHistory } from "../history/load-history";
import { optimizeQuery } from "../optimization/optimize-query";
import { selectTopK } from "../optimization/select-top-k";
import { metadataAdapter } from "../adapters/metadata-adapter";
import { contentAdapter } from "../adapters/content-adapter";
import { mergeRrf } from "../retrieval/merge-rrf";
import { routeQuery } from "../routing/route-query";
import { PineconeReranker } from "../rerank/pinecone-reranker";
import { rerankChunks } from "../rerank/rerank-chunks";
import { NO_ANSWER } from "../generation/no-answer";
import type { HistoryMessage, ContextChunk, Citation } from "../types";

export type PipelineEvent =
  | { type: "status"; stage: "guarding" | "optimizing" | "retrieving" | "reranking" | "generating" | "verifying" }
  | { type: "token"; text: string }
  | { type: "complete"; answer: string; chunks: ContextChunk[]; context: string; citations: Citation[] };

export async function* runQueryPipeline(input: {
  userId: string; conversationId: string; message: string; documentIds?: string[]; signal?: AbortSignal;
}): AsyncGenerator<PipelineEvent> {
  let stage: "guarding" | "optimizing" | "retrieving" | "reranking" | "generating" | "verifying" = "guarding";
  try {
    yield { type: "status", stage };
    const safeMessage = await runInputGuard(input.message);
    const history: HistoryMessage[] = await loadHistory(input.conversationId, input.userId);
    // Route BEFORE optimizing: greetings and general questions skip query rewriting and search entirely.
    const route = await routeQuery(safeMessage, history);
    if (route.route === "chat") {
      stage = "generating";
      yield { type: "status", stage };
      let reply = "";
      for await (const token of generateChatReply(input.userId, safeMessage, history, input.signal)) {
        reply += token; yield { type: "token", text: token };
      }
      // No chunks: the output guard passes it through without citation checks.
      yield { type: "complete", answer: reply, chunks: [], context: "", citations: [] };
      return;
    }
    stage = "optimizing";
    yield { type: "status", stage };
    const optimized = await optimizeQuery(safeMessage, history);
    const queries = selectTopK(optimized);
    stage = "retrieving";
    yield { type: "status", stage };
    const lists = route.route === "metadata" ? [] : await contentAdapter(input.userId, queries, input.documentIds);
    const facts = route.route === "content" ? [] : await metadataAdapter(input.userId, route.metadataIntent);
    const merged = mergeRrf(lists);
    stage = "reranking";
    yield { type: "status", stage };
    const ranked = merged.length ? await rerankChunks(input.message, merged, new PineconeReranker()) : [];
    const context = buildContext(ranked);
    const dataContext = [context.text, ...facts.map((fact) => `FACT documentId=${fact.documentId ?? "none"} ${fact.text}`)].filter(Boolean).join("\n");
  if (!ranked.length && !facts.length) {
    yield { type: "token", text: NO_ANSWER };
    yield { type: "complete", answer: NO_ANSWER, chunks: [], context: "", citations: [] };
    return;
  }
  stage = "generating";
  yield { type: "status", stage };
  let answer = "";
  for await (const token of generateAnswer(input.message, dataContext, history, input.signal)) {
    answer += token; yield { type: "token", text: token };
  }
  stage = "verifying";
  yield { type: "status", stage };
  yield { type: "complete", answer, chunks: context.chunks, context: dataContext, citations: [] };
  } catch (error) {
    console.error("[chat-pipeline]", {
      stage,
      errorName: error instanceof Error ? error.name : "UNKNOWN",
      errorMessage: error instanceof Error ? error.message : "UNKNOWN",
      errorCode: typeof error === "object" && error !== null && "code" in error ? String(error.code) : undefined,
    });
    throw error;
  }
}
