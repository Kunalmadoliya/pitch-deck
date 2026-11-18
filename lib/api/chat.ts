import type {
  ConversationSummary,
  ConversationWithMessages,
} from "./chat-types";

export * from "./chat-types";

export const conversationKeys = {
  all: ["conversations"] as const,
  lists: () => [...conversationKeys.all, "list"] as const,
  detail: (id: string) => [...conversationKeys.all, "detail", id] as const,
};

export async function fetchConversations(): Promise<ConversationSummary[]> {
  const response = await fetch("/api/conversations", {
    credentials: "include",
  });
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Your session has expired. Please sign in again.");
    }
    throw new Error("Failed to load conversations.");
  }
  return response.json();
}

export async function fetchConversation(
  id: string,
): Promise<ConversationWithMessages> {
  const response = await fetch(`/api/conversations/${id}`, {
    credentials: "include",
  });
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Conversation not found.");
    }
    if (response.status === 401) {
      throw new Error("Your session has expired. Please sign in again.");
    }
    throw new Error("Failed to load conversation messages.");
  }
  return response.json();
}

export async function deleteConversationApi(id: string): Promise<void> {
  const response = await fetch(`/api/conversations/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!response.ok) {
    if (response.status === 404) return;
    if (response.status === 401) {
      throw new Error("Your session has expired. Please sign in again.");
    }
    throw new Error("Failed to delete conversation.");
  }
}
