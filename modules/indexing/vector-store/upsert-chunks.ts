import type { VectorRecord } from "../types";

export async function upsertChunks(
  index: { namespace: (name: string) => { upsert: (options: { records: VectorRecord[] }) => Promise<unknown> } },
  namespace: string,
  records: VectorRecord[],
): Promise<void> {
  if (records.length > 0) await index.namespace(namespace).upsert({ records });
}
