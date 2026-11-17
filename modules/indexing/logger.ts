export function logIndexingEvent(
  event: "start" | "end" | "error",
  details: { documentId: string; stage: string; durationMs?: number; errorCode?: string },
): void {
  console.info(JSON.stringify({ event, ...details }));
}
