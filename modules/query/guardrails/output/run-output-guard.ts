import { queryConfig } from "../../config";
import { checkCitations } from "./check-citations";
import { checkGroundedness } from "./check-groundedness";
import type { ContextChunk, Citation } from "../../types";
export async function runOutputGuard(answer: string, chunks: ContextChunk[], context: string): Promise<{ valid: boolean; citations: Citation[] }> {
  if (!chunks.length) return { valid: true, citations: [] };
  const noAnswer = /couldn't find this in your documents/i.test(answer);
  const checked = checkCitations(answer, chunks.map((chunk) => chunk.n), noAnswer);
  if (!checked.valid) return { valid: false, citations: [] };
  if (queryConfig.ENABLE_GROUNDEDNESS_CHECK && !(await checkGroundedness(answer, context)).grounded) return { valid: false, citations: [] };
  const citations = chunks.filter((chunk) => checked.cited.includes(chunk.n)).map(({ n, documentId, fileName, pageNumber, chunkIndex }) => ({ n, documentId, fileName, pageNumber, chunkIndex }));
  return { valid: true, citations };
}
