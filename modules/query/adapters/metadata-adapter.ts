import { runMetadataQuery } from "../retrieval/metadata-queries";
import type { MetadataFact, MetadataIntent } from "../types";
export function metadataAdapter(userId: string, intent: MetadataIntent | undefined): Promise<MetadataFact[]> {
  return runMetadataQuery(userId, intent ?? "list_documents");
}
