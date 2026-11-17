export async function deleteDocumentVectors(
  index: { namespace: (name: string) => { deleteMany: (filter: Record<string, unknown>) => Promise<unknown> } },
  namespace: string,
  documentId: string,
): Promise<void> {
  await index.namespace(namespace).deleteMany({ documentId: { $eq: documentId } });
}
