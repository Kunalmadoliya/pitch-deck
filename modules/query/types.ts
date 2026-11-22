export type QueryKind = "rewrite" | "step-back" | "sub-query" | "hyde";
/** chat = greetings, thanks, questions about the assistant, or general questions that need no document search. */
export type QueryRoute = "content" | "metadata" | "both" | "chat";
export type MetadataIntent = "list_documents" | "count_documents" | "document_status" | "recent_documents";

export interface HistoryMessage { role: "USER" | "ASSISTANT"; content: string }
export interface OptimizedQuery {
  original: string; rewritten: string; stepBack?: string; subQueries: string[]; hyde?: string;
}
export interface SearchQuery { text: string; kind: QueryKind }
export interface Chunk {
  id: string; text: string; documentId: string; fileName: string; pageNumber: number; chunkIndex: number; score?: number;
}
export interface ContextChunk extends Chunk { n: number }
export interface Citation { n: number; documentId: string; fileName: string; pageNumber: number; chunkIndex: number }
export interface MetadataFact { documentId?: string; text: string }
export interface RouteDecision { route: QueryRoute; metadataIntent?: MetadataIntent }
