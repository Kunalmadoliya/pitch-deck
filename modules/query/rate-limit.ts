import { queryConfig } from "./config";
const windows = new Map<string, number[]>();
export function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const recent = (windows.get(userId) ?? []).filter((time) => now - time < 60000);
  if (recent.length >= queryConfig.RATE_LIMIT_PER_MINUTE) { windows.set(userId, recent); return false; }
  recent.push(now); windows.set(userId, recent); return true;
}
