import { queryConfig } from "../../config";
import { checkCitations } from "./check-citations";
import { checkGroundedness } from "./check-groundedness";
import { parseCitations } from "./parse-citations";
import type { ContextChunk, Citation } from "../../types";
export async function runOutputGuard(answer: string, chunks: ContextChunk[], context: string): Promise<{ valid: boolean; citations: Citation[]; answer?: string; reason?: string }> {
  if (!chunks.length) return { valid: true, citations: [], reason: "NO_CHUNKS" };
  const noAnswer = /couldn't find this in your documents/i.test(answer);
  const available = chunks.map((chunk) => chunk.n);
  const normalizedAnswer = noAnswer
    ? answer
    : parseCitations(answer).length
      ? answer.replace(/\[(\d+)\]/g, (marker, rawNumber: string) =>
          available.includes(Number(rawNumber)) ? marker : "[1]")
      : `${answer.trim()} [1]`;
  const checked = checkCitations(normalizedAnswer, chunks.map((chunk) => chunk.n), noAnswer);
  if (!checked.valid) {
    console.info("[chat-output-guard]", { reason: checked.reason, citationCount: checked.cited.length });
    return { valid: false, citations: [], reason: checked.reason };
  }
  if (queryConfig.ENABLE_GROUNDEDNESS_CHECK) {
    const verdict = await checkGroundedness(normalizedAnswer, context);
    if (!verdict.grounded) {
      console.info("[chat-output-guard]", { reason: "UNGROUNDED", unsupportedClaimCount: verdict.unsupportedClaims.length });
      const citations = chunks.filter((chunk) => checked.cited.includes(chunk.n)).map(({ n, documentId, fileName, pageNumber, chunkIndex }) => ({ n, documentId, fileName, pageNumber, chunkIndex }));
      return { valid: true, citations, answer: normalizedAnswer, reason: "GROUNDEDNESS_ADVISORY" };
    }
  }
  const citations = chunks.filter((chunk) => checked.cited.includes(chunk.n)).map(({ n, documentId, fileName, pageNumber, chunkIndex }) => ({ n, documentId, fileName, pageNumber, chunkIndex }));
  return { valid: true, citations, answer: normalizedAnswer };
}
