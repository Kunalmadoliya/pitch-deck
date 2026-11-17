export async function finalizeDocument(
  repo: { finalize: (id: string) => Promise<unknown> },
  documentId: string,
): Promise<void> {
  await repo.finalize(documentId);
}
