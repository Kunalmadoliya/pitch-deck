"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  conversationKeys,
  deleteConversationApi,
  type ConversationSummary,
} from "@/lib/api/chat";

export function useDeleteConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteConversationApi(id),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: conversationKeys.lists() });
      const previous = queryClient.getQueryData<ConversationSummary[]>(
        conversationKeys.lists(),
      );

      if (previous) {
        queryClient.setQueryData<ConversationSummary[]>(
          conversationKeys.lists(),
          previous.filter((c) => c.id !== id),
        );
      }

      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(conversationKeys.lists(), context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: conversationKeys.lists() });
    },
  });
}
