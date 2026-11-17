import { z } from "zod";

const envSchema = z.object({
  UPLOAD_DIR: z.string().default("uploads"),
  OCR_LANG: z.string().default("eng"),
  PAGE_BATCH_SIZE: z.coerce.number().int().positive().default(3),
  OCR_TEXT_THRESHOLD: z.coerce.number().int().nonnegative().default(50),
  CHUNK_SIZE: z.coerce.number().int().positive().default(1000),
  CHUNK_OVERLAP: z.coerce.number().int().nonnegative().default(150),
  OPENAI_API_KEY: z.string().optional(),
  PINECONE_API_KEY: z.string().optional(),
  PINECONE_INDEX: z.string().optional(),
});

export const indexingConfig = envSchema.parse({
  UPLOAD_DIR: process.env.UPLOAD_DIR,
  OCR_LANG: process.env.OCR_LANG,
  PAGE_BATCH_SIZE: process.env.PAGE_BATCH_SIZE,
  OCR_TEXT_THRESHOLD: process.env.OCR_TEXT_THRESHOLD,
  CHUNK_SIZE: process.env.CHUNK_SIZE,
  CHUNK_OVERLAP: process.env.CHUNK_OVERLAP,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  PINECONE_API_KEY: process.env.PINECONE_API_KEY,
  PINECONE_INDEX: process.env.PINECONE_INDEX,
});

export const EMBEDDING_MODEL = "text-embedding-3-small";
export const EMBEDDING_DIMENSION = 1536;
