import { FILE_CACHE_MAX_FILES, FILE_CACHE_TTL_MS } from "../config";
import type { Storage } from "./storage.interface";

interface CacheEntry {
  data: Promise<Buffer>;
  expiresAt: number;
}

// Kept on globalThis so Next.js hot reload in dev does not throw the cache away.
const globalForCache = globalThis as unknown as { __indexingFileCache?: Map<string, CacheEntry> };
const cache = (globalForCache.__indexingFileCache ??= new Map<string, CacheEntry>());

/**
 * Download a stored file once and reuse it for every indexing step that runs in
 * this server process. If a step lands on a different server, it just downloads again.
 */
export function readFileCached(storage: Storage, fileId: string): Promise<Buffer> {
  const now = Date.now();
  for (const [key, entry] of cache) {
    if (entry.expiresAt <= now) cache.delete(key);
  }

  const hit = cache.get(fileId);
  if (hit) {
    hit.expiresAt = now + FILE_CACHE_TTL_MS;
    return hit.data;
  }

  const data = storage.read(fileId);
  cache.set(fileId, { data, expiresAt: now + FILE_CACHE_TTL_MS });
  // A failed download must not stay cached, or every retry would fail too.
  data.catch(() => cache.delete(fileId));

  while (cache.size > FILE_CACHE_MAX_FILES) {
    const oldest = cache.keys().next().value;
    if (oldest === undefined) break;
    cache.delete(oldest);
  }
  return data;
}

export function evictCachedFile(fileId: string): void {
  cache.delete(fileId);
}
