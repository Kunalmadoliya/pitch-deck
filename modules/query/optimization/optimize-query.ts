import { queryConfig } from "../config";
import type { HistoryMessage, OptimizedQuery } from "../types";
import { generateHyde } from "./generate-hyde";
import { generateSubQueries } from "./generate-sub-queries";
import { rewriteQuery } from "./rewrite-query";
import { stepBackQuery } from "./step-back-query";

export async function optimizeQuery(original: string, history: HistoryMessage[]): Promise<OptimizedQuery> {
  let rewritten = original;
  try { rewritten = await rewriteQuery(original, history); } catch { /* raw query is the safe fallback */ }
  const tasks = await Promise.allSettled([
    queryConfig.ENABLE_STEP_BACK ? stepBackQuery(rewritten) : Promise.resolve(undefined),
    queryConfig.ENABLE_SUB_QUERIES ? generateSubQueries(rewritten) : Promise.resolve([]),
    queryConfig.ENABLE_HYDE ? generateHyde(rewritten) : Promise.resolve(undefined),
  ]);
  return {
    original, rewritten,
    stepBack: tasks[0].status === "fulfilled" ? tasks[0].value : undefined,
    subQueries: tasks[1].status === "fulfilled" ? tasks[1].value : [],
    hyde: tasks[2].status === "fulfilled" ? tasks[2].value : undefined,
  };
}
