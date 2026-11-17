"use client";

import { useQuery } from "@tanstack/react-query";
import { documentKeys, fetchDocuments, type DocumentItem } from "@/lib/api/documents";

export function useDocuments() {
  return useQuery<DocumentItem[], Error>({
    queryKey: documentKeys.list(),
    queryFn: fetchDocuments,
    refetchInterval: (query) => {
      const docs = query.state.data;
      if (!docs || docs.length === 0) return false;
      const isBusy = docs.some(
        (doc) => doc.status === "UPLOADED" || doc.status === "PROCESSING",
      );
      return isBusy ? 2000 : false;
    },
  });
}
