export function logQueryEvent(
  event: "start" | "end" | "error",
  details: { conversationId?: string; stage: string; durationMs?: number; errorCode?: string; count?: number },
): void {
  console.info(JSON.stringify({ event, ...details }));
}

export async function withQueryLogging<T>(
  conversationId: string | undefined, stage: string, operation: () => Promise<T>,
): Promise<T> {
  const started = Date.now(); logQueryEvent("start", { conversationId, stage });
  try {
    const result = await operation();
    logQueryEvent("end", { conversationId, stage, durationMs: Date.now() - started });
    return result;
  } catch (error) {
    logQueryEvent("error", { conversationId, stage, durationMs: Date.now() - started, errorCode: error instanceof Error ? error.name : "UNKNOWN" });
    throw error;
  }
}
