import { parseCitations } from "./parse-citations";
export function checkCitations(answer: string, available: number[], noAnswer = false): { valid: boolean; cited: number[]; reason?: string } {
  const cited = parseCitations(answer);
  if (noAnswer) return { valid: true, cited };
  if (!cited.length) return { valid: false, cited, reason: "MISSING_CITATION" };
  if (cited.some((n) => !available.includes(n))) return { valid: false, cited, reason: "INVALID_CITATION" };
  return { valid: true, cited };
}
