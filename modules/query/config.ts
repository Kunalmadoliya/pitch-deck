import { z } from "zod";

const schema = z.object({
  MAX_QUERY_CHARS: z.coerce.number().int().positive().default(4000),
  HISTORY_MESSAGES: z.coerce.number().int().positive().default(6),
  TOP_K_QUERIES: z.coerce.number().int().positive().default(5),
  PINECONE_TOP_K: z.coerce.number().int().positive().default(20),
  RRF_K: z.coerce.number().int().positive().default(60),
  RERANK_CANDIDATES: z.coerce.number().int().positive().default(50),
  RERANK_TOP_N: z.coerce.number().int().positive().default(6),
  MIN_RERANK_SCORE: z.coerce.number().default(0),
  FAST_MODEL: z.string().default("gpt-4o-mini"),
  ANSWER_MODEL: z.string().default("gpt-4o-mini"),
  RERANK_MODEL: z.string().default("bge-reranker-v2-m3"),
  ENABLE_STEP_BACK: z.coerce.boolean().default(true),
  ENABLE_SUB_QUERIES: z.coerce.boolean().default(true),
  ENABLE_HYDE: z.coerce.boolean().default(true),
  ENABLE_GROUNDEDNESS_CHECK: z.coerce.boolean().default(true),
  RATE_LIMIT_PER_MINUTE: z.coerce.number().int().positive().default(20),
  QUERY_TIMEOUT_MS: z.coerce.number().int().positive().default(60000),
  STAGE_TIMEOUT_MS: z.coerce.number().int().positive().default(15000),
});

const values = schema.parse({
  MAX_QUERY_CHARS: process.env.MAX_QUERY_CHARS,
  HISTORY_MESSAGES: process.env.HISTORY_MESSAGES,
  TOP_K_QUERIES: process.env.TOP_K_QUERIES,
  PINECONE_TOP_K: process.env.PINECONE_TOP_K,
  RRF_K: process.env.RRF_K,
  RERANK_CANDIDATES: process.env.RERANK_CANDIDATES,
  RERANK_TOP_N: process.env.RERANK_TOP_N,
  MIN_RERANK_SCORE: process.env.MIN_RERANK_SCORE,
  FAST_MODEL: process.env.FAST_MODEL,
  ANSWER_MODEL: process.env.ANSWER_MODEL,
  RERANK_MODEL: process.env.RERANK_MODEL,
  ENABLE_STEP_BACK: process.env.ENABLE_STEP_BACK,
  ENABLE_SUB_QUERIES: process.env.ENABLE_SUB_QUERIES,
  ENABLE_HYDE: process.env.ENABLE_HYDE,
  ENABLE_GROUNDEDNESS_CHECK: process.env.ENABLE_GROUNDEDNESS_CHECK,
  RATE_LIMIT_PER_MINUTE: process.env.RATE_LIMIT_PER_MINUTE,
  QUERY_TIMEOUT_MS: process.env.QUERY_TIMEOUT_MS,
  STAGE_TIMEOUT_MS: process.env.STAGE_TIMEOUT_MS,
});

export const queryConfig = { ...values, MAX_DURATION: Math.ceil(values.QUERY_TIMEOUT_MS / 1000) };
