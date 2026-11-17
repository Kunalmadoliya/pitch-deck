import { z } from "zod";

const envSchema = z.object({
  OCR_LANG: z.string().default("eng"),
  PAGE_BATCH_SIZE: z.coerce.number().int().positive().default(3),
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
export const PDF_RENDER_SCALE = 2;
export const EMBEDDING_BATCH_SIZE = 32;
export const MAX_UPLOAD_BYTES = indexingConfig.MAX_UPLOAD_MB * 1024 * 1024;
export const ALLOWED_MIME_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"] as const;
export const EMBEDDING_MODEL = "text-embedding-3-small";
export const EMBEDDING_DIMENSION = 1536;
