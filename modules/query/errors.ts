export class QueryError extends Error {
  constructor(message: string, public readonly code: string, options?: ErrorOptions) {
    super(message, options); this.name = "QueryError";
  }
}
export class GuardrailBlockedError extends QueryError { constructor() { super("Request blocked", "BLOCKED_BY_GUARDRAIL"); } }
export class RetrievalError extends QueryError { constructor(options?: ErrorOptions) { super("Retrieval failed", "RETRIEVAL_FAILED", options); } }
export class RerankError extends QueryError { constructor(options?: ErrorOptions) { super("Reranking failed", "RERANK_FAILED", options); } }
export class GenerationError extends QueryError { constructor(options?: ErrorOptions) { super("Generation failed", "GENERATION_FAILED", options); } }
