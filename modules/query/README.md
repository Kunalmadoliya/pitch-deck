# Query phase

```text
guard -> route --chat--> friendly reply (no search) -> save
              --content/metadata/both--> optimize -> retrieve -> RRF -> rerank -> answer stream -> verify -> save
```

`pipeline/` orchestrates the flow. Routing runs before optimization so greetings, thanks and
general questions skip search: `routing/detect-small-talk.ts` catches obvious small talk with no AI
call, and the router prompt has a `chat` route for the rest (`generation/generate-chat-reply.ts`). `optimization/`, `routing/`, `adapters/`,
`retrieval/`, `rerank/`, `generation/`, and `guardrails/` each contain one
stage. `history/` owns conversation persistence; `llm/` and `prompts/` keep
provider configuration and prompt text isolated. The API routes expose SSE
chat plus owner-scoped conversation listing, reading, and deletion.

The rate limiter is intentionally in-memory and should be replaced with a
shared store before deploying multiple instances.
