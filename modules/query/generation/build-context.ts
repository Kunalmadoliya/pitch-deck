import type { Chunk, ContextChunk } from "../types";
export function buildContext(chunks: Chunk[]): { text: string; chunks: ContextChunk[] } {
  const numbered = chunks.map((chunk, index) => ({ ...chunk, n: index + 1 }));
  const text = numbered.map((chunk) =>
    `[${chunk.n}] DATA fileName="${chunk.fileName}" page=${chunk.pageNumber}\n<<<${chunk.text}>>>`,
  ).join("\n\n");
  return { text, chunks: numbered };
}
