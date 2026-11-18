import { prisma } from "@/lib/prisma";
import { queryConfig } from "../config";
import type { HistoryMessage } from "../types";
export async function loadHistory(conversationId: string, userId: string): Promise<HistoryMessage[]> {
  const rows = await prisma.message.findMany({
    where: { conversationId, conversation: { userId } }, orderBy: { createdAt: "desc" }, take: queryConfig.HISTORY_MESSAGES,
    select: { role: true, content: true },
  });
  return rows.reverse().filter((row): row is HistoryMessage => row.role === "USER" || row.role === "ASSISTANT");
}
