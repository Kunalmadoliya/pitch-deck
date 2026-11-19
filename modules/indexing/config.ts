import { availableParallelism } from "node:os";
import { z } from "zod";

const envSchema = z.object({
  OCR_LANG: z.string().default("eng"),
  PAGE_BATCH_SIZE: z.coerce.number().int().positive().default(10),
  OCR_WORKERS: z.coerce.number().int().positive().max(16).optional(),
  PDF_RENDER_SCALE: z.coerce.number().positive().max(4).default(2),
  OCR_TEXT_THRESHOLD: z.coerce.number().int().nonnegative().default(50),
  CHUNK_SIZE: z.coerce.number().int().positive().default(1000),
  CHUNK_OVERLAP: z.coerce.number().int().nonnegative().default(150),
  MAX_UPLOAD_MB: z.coerce.number().int().positive().default(50),
  IMAGEKIT_PUBLIC_KEY: z.string().optional(),
  IMAGEKIT_PRIVATE_KEY: z.string().optional(),
  IMAGEKIT_URL_ENDPOINT: z.string().url().optional(),
  OPENAI_API_KEY: z.string().optional(),
  PINECONE_API_KEY: z.string().optional(),
  PINECONE_INDEX: z.string().optional(),
});

export const indexingConfig = envSchema.parse({
  OCR_LANG: process.env.OCR_LANG,
  PAGE_BATCH_SIZE: process.env.PAGE_BATCH_SIZE,
  OCR_WORKERS: process.env.OCR_WORKERS || undefined,
  PDF_RENDER_SCALE: process.env.PDF_RENDER_SCALE || undefined,
  OCR_TEXT_THRESHOLD: process.env.OCR_TEXT_THRESHOLD,
  CHUNK_SIZE: process.env.CHUNK_SIZE,
  CHUNK_OVERLAP: process.env.CHUNK_OVERLAP,
  MAX_UPLOAD_MB: process.env.MAX_UPLOAD_MB,
  IMAGEKIT_PUBLIC_KEY: process.env.IMAGEKIT_PUBLIC_KEY,
  IMAGEKIT_PRIVATE_KEY: process.env.IMAGEKIT_PRIVATE_KEY,
  IMAGEKIT_URL_ENDPOINT: process.env.IMAGEKIT_URL_ENDPOINT,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  PINECONE_API_KEY: process.env.PINECONE_API_KEY,
  PINECONE_INDEX: process.env.PINECONE_INDEX,
});

export const UPLOAD_FOLDER_PREFIX = "/policy-docs";
export const IMAGEKIT_SIGNED_URL_EXPIRY_SECONDS = 300;
export const IMAGEKIT_UPLOAD_AUTH_EXPIRY_SECONDS = 1800;
export const PDF_RENDER_SCALE = indexingConfig.PDF_RENDER_SCALE;
export const MAX_UPLOAD_BYTES = indexingConfig.MAX_UPLOAD_MB * 1024 * 1024;
export const ALLOWED_MIME_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"] as const;

/** How many Tesseract workers to keep alive. Default: CPU cores - 1, between 1 and 4. */
export const OCR_POOL_SIZE = indexingConfig.OCR_WORKERS ?? Math.max(1, Math.min(4, availableParallelism() - 1));
/** Shut the OCR workers down after this long with no work, to free memory. */
export const OCR_IDLE_SHUTDOWN_MS = 60_000;
/** How long a downloaded file stays in memory so later steps can reuse it. */
export const FILE_CACHE_TTL_MS = 10 * 60_000;
export const FILE_CACHE_MAX_FILES = 3;
/** Pages worked on at the same time inside one batch. One more than the OCR pool so a reader never waits. */
export const PAGE_CONCURRENCY = OCR_POOL_SIZE + 1;
