import { queryConfig } from "../../config";

const injectionPatterns = [
  /ignore\s+(all\s+)?previous\s+instructions/i,
  /reveal\s+(your|the)\s+system\s+prompt/i,
  /disregard\s+(the|all)\s+instructions/i,
  /pretend\s+you\s+are/i,
];
export interface InputRuleResult { safe: boolean; message: string; reason?: string }
export function checkInputRules(message: string): InputRuleResult {
  const cleaned = message.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim();
  if (!cleaned) return { safe: false, message: "", reason: "EMPTY_QUERY" };
  if (cleaned.length > queryConfig.MAX_QUERY_CHARS) return { safe: false, message: cleaned.slice(0, queryConfig.MAX_QUERY_CHARS), reason: "QUERY_TOO_LONG" };
  if (injectionPatterns.some((pattern) => pattern.test(cleaned))) return { safe: false, message: cleaned, reason: "INJECTION_PATTERN" };
  return { safe: true, message: cleaned };
}
