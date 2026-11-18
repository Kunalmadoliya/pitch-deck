import type { VectorRecord } from "../types";

export async function upsertChunks(
  index: {
    namespace: (name: string) => {
      documents: {
        upsert: (options: { documents: Array<{ _id: string; chunk_text: string; title: string }> }) => Promise<unknown>;
      };
    };
  },
  namespace: string,
  records: VectorRecord[],
): Promise<void> {
  if (records.length === 0) return;

  await index.namespace(namespace).documents.upsert({
    documents: records.map((record) => ({
      _id: record.id,
      chunk_text: record.text,
      title: record.title,
    })),
  });
}
