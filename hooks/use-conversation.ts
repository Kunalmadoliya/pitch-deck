"use client";

import { useQuery } from "@tanstack/react-query";
import {
  conversationKeys,
  fetchConversation,
  type ConversationWithMessages,
} from "@/lib/api/chat";

export function useConversation(id?: string) {
  return useQuery<ConversationWithMessages, Error>({
    queryKey: conversationKeys.detail(id ?? ""),
    queryFn: () => fetchConversation(id!),
    enabled: Boolean(id),
  });
}
