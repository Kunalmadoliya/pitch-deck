export async function deleteDocumentVectors(
  index: {
    namespace: (name: string) => {
      documents: {
        list: (options: { prefix: string; limit?: number; paginationToken?: string }) => Promise<{
          documents: Array<{ _id: string }>;
          pagination?: { next: string };
        }>;
        delete: (options: { ids: string[] }) => Promise<unknown>;
      };
    };
  },
  namespace: string,
  documentId: string,
): Promise<void> {
  const documents = index.namespace(namespace).documents;
  let paginationToken: string | undefined;

  do {
    const page = await documents.list({
      prefix: `${documentId}:`,
      limit: 100,
      ...(paginationToken ? { paginationToken } : {}),
    });
    const ids = page.documents.map((document) => document._id);
    if (ids.length > 0) await documents.delete({ ids });
    paginationToken = page.pagination?.next;
  } while (paginationToken);
}
