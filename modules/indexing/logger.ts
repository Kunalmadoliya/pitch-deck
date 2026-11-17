export function logIndexingEvent(
  event: "start" | "end" | "error",
  details: { documentId: string; stage: string; durationMs?: number; errorCode?: string },
): void {
  console.info(JSON.stringify({ event, ...details }));
}

export async function withIndexingLogging<T>(
  documentId: string,
  stage: string,
  operation: () => Promise<T>,
): Promise<T> {
  const startedAt = Date.now();
  logIndexingEvent("start", { documentId, stage });
  try {
    const result = await operation();
    logIndexingEvent("end", { documentId, stage, durationMs: Date.now() - startedAt });
    return result;
  } catch (error) {
    logIndexingEvent("error", {
      documentId,
      stage,
      durationMs: Date.now() - startedAt,
      errorCode: error instanceof Error ? error.name : "UNKNOWN",
    });
    throw error;
  }
}
