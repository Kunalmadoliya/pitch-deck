"use client";

import { useQuery } from "@tanstack/react-query";
import { documentKeys, fetchDocument, type DocumentItem } from "@/lib/api/documents";

export function useDocument(id: string | null | undefined) {
  return useQuery<DocumentItem, Error>({
    queryKey: documentKeys.detail(id ?? ""),
    queryFn: () => fetchDocument(id!),
    enabled: Boolean(id),
    refetchInterval: (query) => {
      const doc = query.state.data;
      if (!doc) return false;
      const isBusy = doc.status === "UPLOADED" || doc.status === "PROCESSING";
      return isBusy ? 2000 : false;
    },
  });
}
