"use client";

import { useQuery } from "@tanstack/react-query";
import {
  conversationKeys,
  fetchConversations,
  type ConversationSummary,
} from "@/lib/api/chat";

export function useConversations() {
  return useQuery<ConversationSummary[], Error>({
    queryKey: conversationKeys.lists(),
    queryFn: fetchConversations,
  });
}
