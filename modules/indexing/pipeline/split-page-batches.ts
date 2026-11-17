export function splitPageBatches(pageCount: number, batchSize: number): number[][] {
  if (pageCount < 1 || batchSize < 1) return [];
  const batches: number[][] = [];
  for (let page = 1; page <= pageCount; page += batchSize) {
    batches.push(Array.from({ length: Math.min(batchSize, pageCount - page + 1) }, (_, index) => page + index));
  }
  return batches;
}
