"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteDocumentApi, documentKeys, type DocumentItem } from "@/lib/api/documents";

export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string, { previousDocs?: DocumentItem[] }>({
    mutationFn: (id: string) => deleteDocumentApi(id),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: documentKeys.list() });
      const previousDocs = queryClient.getQueryData<DocumentItem[]>(documentKeys.list());

      if (previousDocs) {
        queryClient.setQueryData<DocumentItem[]>(
          documentKeys.list(),
          previousDocs.filter((doc) => doc.id !== id),
        );
      }

      return { previousDocs };
    },
    onError: (err, _id, context) => {
      if (context?.previousDocs) {
        queryClient.setQueryData(documentKeys.list(), context.previousDocs);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: documentKeys.all });
    },
  });
}
