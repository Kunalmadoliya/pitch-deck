export type MessageRole = "USER" | "ASSISTANT" | "SYSTEM";

export interface Citation {
  n: number;
  documentId: string;
  fileName: string;
  pageNumber: number;
  chunkIndex: number;
}

export interface MessageItem {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  citations?: Citation[] | null;
  createdAt: string;
}

export interface ConversationSummary {
  id: string;
  title: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationWithMessages extends ConversationSummary {
  messages: MessageItem[];
}

export type QueryStage =
  | "guarding"
  | "optimizing"
  | "retrieving"
  | "reranking"
  | "generating"
  | "verifying";

export interface ChatStatusEvent {
  stage: QueryStage;
}

export interface ChatTokenEvent {
  text: string;
}

export interface ChatReplaceEvent {
  text: string;
}

export interface ChatFinalEvent {
  conversationId: string;
  messageId: string;
  citations: Citation[];
  verdict: "passed" | "replaced";
}

export interface ChatErrorEvent {
  code: string;
  message: string;
}

export const MAX_QUERY_CHARS = 4000;

export function stageLabel(stage: QueryStage | string): string {
  switch (stage) {
    case "guarding":
      return "Checking your question";
    case "optimizing":
      return "Understanding your question";
    case "retrieving":
      return "Searching your documents";
    case "reranking":
      return "Picking the best passages";
    case "generating":
      return "Writing the answer";
    case "verifying":
      return "Verifying against your documents";
    default:
      return "Processing...";
  }
}

export function errorMessage(code: string): string {
  switch (code) {
    case "rate_limited":
      return "You're asking too fast. Try again in a minute.";
    case "blocked_by_guardrail":
      return "I can't help with that request.";
    case "retrieval_failed":
      return "I couldn't find relevant information in your documents.";
    case "generation_failed":
      return "Unable to generate an answer right now. Please try again.";
    case "unauthorized":
      return "Your session has expired. Please sign in again.";
    default:
      return "Unable to complete request right now. Please try again.";
  }
}
