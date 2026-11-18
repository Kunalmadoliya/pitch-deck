# Query phase

```text
guard -> optimize -> route -> retrieve -> RRF -> rerank -> answer stream -> verify -> save
```

`pipeline/` orchestrates the flow. `optimization/`, `routing/`, `adapters/`,
`retrieval/`, `rerank/`, `generation/`, and `guardrails/` each contain one
stage. `history/` owns conversation persistence; `llm/` and `prompts/` keep
provider configuration and prompt text isolated. The API routes expose SSE
chat plus owner-scoped conversation listing, reading, and deletion.

The rate limiter is intentionally in-memory and should be replaced with a
shared store before deploying multiple instances.
