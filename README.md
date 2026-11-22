# PolicyExtract

> **Enterprise Company Policy Reader & Grounded RAG Intelligence Engine**  
> Transform complex corporate handbooks, compliance manuals, HR policies, and vendor SLAs into provable, clause-cited answers with sub-second retrieval, automated OCR fallback, and multi-tenant isolation.
> Plus an **AI Pitch Deck** builder that turns a one-paragraph idea into a 7-slide investor deck with AI-drawn diagrams and pictures.

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [How It Works (The Simple Version)](#how-it-works-the-simple-version)
3. [End-to-End System Architecture](#end-to-end-system-architecture)
4. [Ingestion & Indexing Pipeline (Asynchronous)](#ingestion--indexing-pipeline-asynchronous)
5. [Query & Grounded Retrieval Engine (RAG)](#query--grounded-retrieval-engine-rag)
6. [AI Pitch Deck Generator](#ai-pitch-deck-generator)
7. [Data Models & Persistence Strategy](#data-models--persistence-strategy)
8. [Multi-Tenant Security & Privacy Model](#multi-tenant-security--privacy-model)
9. [Frontend Architecture & Design Philosophy](#frontend-architecture--design-philosophy)
10. [Technology Stack](#technology-stack)
11. [Environment Configuration Reference](#environment-configuration-reference)
12. [Local Development & Operations Runbook](#local-development--operations-runbook)

---

## Executive Summary

Enterprise policy documentation is historically difficult to query: agreements are long, scanned PDFs lack text layers, answers frequently hallucinate, and traditional keyword search fails on semantic nuance. 

**PolicyExtract** solves this with a purpose-built, dual-engine architecture:
- **Asynchronous Ingestion Engine**: Decouples slow operations (OCR, PDF rendering, chunking, embedding generation, Pinecone upserts) into isolated, idempotent background steps powered by **Inngest**. API routes remain sub-50ms.
- **Grounded Query Engine**: Implements an advanced 9-stage Retrieval-Augmented Generation (RAG) pipeline incorporating prompt injection guardrails, intent routing (including a fast **chat** route for greetings and general questions), multi-angle query optimization (HyDE, Step-Back, Sub-Queries), Reciprocal Rank Fusion (RRF), Cross-Encoder Reranking, strict clause-level citation enforcement, and output hallucination verification.
- **AI Pitch Deck Generator**: A LangChain agent with input and output guardrails writes a 7-slide deck plus a picture plan for every slide. An Inngest job then draws every slide image at once (OpenAI `gpt-image-2`), uploads it to ImageKit, and only hands the deck over when everything is ready.
- **Family.co Aesthetic**: Designed with spacious typography, hairline dividers, soft rounded shapes, and zero "card soup", delivering a modern, calm corporate tool.

---

## How It Works (The Simple Version)

No code talk here. Just boxes and arrows so anyone can get it in 2 minutes.

### The big picture

```
   +---------+        +------------------+        +-------------+
   |   YOU   | -----> |  Log in (Google  | -----> |  Dashboard  |
   |         |        |   or GitHub)     |        |             |
   +---------+        +------------------+        +------+------+
                                                         |
                     +-----------------------------------+-----------------------------------+
                     |                                   |                                   |
                     v                                   v                                   v
          +---------------------+             +---------------------+             +---------------------+
          |  1. Upload a policy |             |  2. Ask a question  |             |  3. Make a pitch    |
          |     (PDF / image)   |             |   about your docs   |             |  deck from an idea  |
          +---------------------+             +---------------------+             +---------------------+
```

That's it. Three things: **put docs in**, **ask questions out**, and **turn an idea into a deck**.

---

### Flow 1: Uploading a document

```
   You drop a file
          |
          v
   +-------------------------------+
   | Is it OK? (PDF or image,      |----- no ---->  "Nope, can't take this file"
   | not too big, your own folder) |
   +-------------------------------+
          | yes
          v
   File gets saved safely in private storage
          |
          v
   App says "Got it! Working on it..."   <-- you don't have to wait here
          |
          v
   ~~~~~~~~~~~~ the rest happens in the background ~~~~~~~~~~~~
          |
          v
   Download the file ONCE (kept in memory for the next steps)
          |
          v
   Count the pages, then take them 10 at a time
   (open the PDF ONCE for each group of 10)
          |
          v
   Work on several pages AT THE SAME TIME, like an assembly line:

     page 1:  read -> cut into pieces -> save to search -> done ✓
     page 2:  read -> cut into pieces -> save to search -> done ✓
     page 3:  read -> cut into pieces -> save to search -> done ✓
       ...      (page 1 is searchable while page 3 is still being read)

          "read" means:
          +---------------------------+
          | Can we read the text on   |
          | this page directly?       |
          +---------------------------+
              |                 |
             yes               no (it's a scan / photo)
              |                 |
              v                 v
          Grab the text     Draw the page as a picture and let a
          (super fast)      Tesseract reader read it (OCR)
                            -- a small team of readers is started
                               ONCE and reused for every page

          "save to search" means:
          Send the pieces to Pinecone, tagged with YOUR name only.
          Pinecone turns them into "meaning numbers" itself, so the app
          can find stuff by meaning, not just exact words.
          |
          v
   More pages left? ---- yes ---> next group of 10
          |
         no
          v
   Status becomes  DONE  -- ready to ask questions!
   You also see how long it took, like "Indexed in 14s · 1.2s/page"

   (If something breaks, it tries again up to 3 times -- pages that
    were already done are not counted twice. If it still fails, the
    doc is marked FAILED with a reason.)
```

You can watch the status move along on screen:
`QUEUED -> INSPECTING -> READING & INDEXING PAGES (x of y pages) -> DONE`

**Why it's fast now**

```
 OLD:  [download][open pdf][page1][open pdf][page2]...  one by one, new OCR reader every page
 NOW:  [download once][open once] -> page1 | page2 | page3 | page4   (side by side, readers reused)
```

---

### Flow 2: Asking a question

```
   You type a question
          |
          v
   +------------------------+
   | Too many questions too |---- yes ---->  "Slow down a bit"
   | fast?                  |
   +------------------------+
          | no
          v
   +------------------------+
   | Is it a trick / sneaky |---- yes ---->  "I can't help with that"
   | message? (safety check)|
   +------------------------+
          | no
          v
   Look at your earlier chat, so follow-up questions make sense
          |
          v
   +-----------------------------------------------+
   | What kind of message is it?                   |
   | ("hi", "thanks", "bye" are spotted instantly, |
   |  everything else is decided by a quick AI)    |
   +-----------------------------------------------+
      |               |                  |              |
   just chatting   about what's       about your     both
   ("hi", "thanks",  INSIDE the docs   files ("how
   "what can you                       many files?")
   do?", "what's
   15% of 2400?")
      |               |                  |              |
      v               |                  |              |
   Friendly short     |                  |              |
   reply, no search,  |                  |              |
   no sources needed  |                  |              |
   (done!)            v                  |              |
              Make the question better:  |              |
                - clean it up            |              |
                - ask a bigger "step back" version      |
                - split it into smaller questions       |
                - guess what a good answer looks like   |
                      |                  |              |
                      v                  v              v
              Search your doc     Check your file    Do both
              pieces (only YOURS) list
                      |                  |              |
                      +--------+---------+--------------+
                 |
                 v
   Mix all the results together and keep the best ones on top
                 |
                 v
   Found nothing? ---- yes ---->  "I couldn't find this in your documents"
                 |
                 no
                 v
   AI writes the answer using ONLY those pieces
   (words show up live, one by one, while it types)
                 |
                 v
   +---------------------------------------------+
   | Final check: does every claim point to a    |
   | real source like [1], [2]?                  |
   +---------------------------------------------+
        |                         |
       yes                        no
        |                         |
        v                         v
   Show answer with          Swap it for "I couldn't verify
   clickable sources         this answer against your documents"
   (file name + page)
        |
        v
   Save the chat so you can come back to it later
```

**Why "hi" is fast now:** greetings, thanks and general questions skip the question rewriting, Pinecone search and reranking (5+ AI calls), so they get a short, natural reply in about a second instead of "I couldn't find this in your documents". Real policy questions, even casual ones like "can I bring my dog to office?" or a follow-up like "and for interns?", still go to document search.

---

### Flow 3: Making a pitch deck

```
   You type a project idea (20+ characters)
          |
          v
   Deck saved as "Queued"  -->  App says "Building your deck..."  <-- you can leave the page
          |
          v
   ~~~~~~~~~~~~ the rest happens in the background (Inngest) ~~~~~~~~~~~~
          |
          v
   AI writes 7 slides: Title, Problem, Solution, Market, Product, Business Model, The Ask
   ...and plans ONE picture for each slide:
      - teaching / learning ideas  -> diagrams, flowcharts, timelines
      - other ideas                -> charts, product mockups, photos
      - short labels spelled out exactly (e.g. "TAM $10B"), or no text at all
          |
          v
   +------------------------------+
   | Quality check: placeholder   |---- bad ----> Deck marked FAILED with a reason
   | text, empty slides, unsafe?  |
   +------------------------------+
          | good
          v
   Draw ALL 7 pictures at the same time:
     picture prompt -> OpenAI gpt-image-2 -> picture bytes -> upload to ImageKit -> link saved
     (a hiccup is retried once on a backup model; a refused picture is skipped, the slide keeps its text)
          |
          v
   Everything done? -> Deck becomes READY and opens   (about 20-30 seconds, ~4 cents)
```

While you wait you see the real progress: `Writing & checking slides -> Drawing images 4 / 7 -> Finishing up`.

---

### The golden rules

```
   +----------------------------------------------------------+
   |  1. You only ever see YOUR docs. Nobody else's.          |
   |  2. No made-up answers. No source = no answer.           |
   |  3. Every answer tells you which file and which page.    |
   |  4. Slow stuff runs in the background, so the app stays  |
   |     fast.                                                |
   |  5. A deck is only shown when its text AND pictures are  |
   |     all finished.                                        |
   +----------------------------------------------------------+
```

---

## End-to-End System Architecture

```mermaid
flowchart TD
    subgraph Client["Frontend Client (Next.js 16 App Router)"]
        UI["Family.co Dashboard & Chat UI"]
        SSE["SSE Stream Reader / Parser"]
        QueryCache["TanStack Query Cache"]
    end

    subgraph Auth["Identity & Authentication"]
        BA["Better Auth (Google / GitHub OAuth)"]
        Session["Session Token & Cookie Check"]
    end

    subgraph Storage["Storage & Relational Persistence"]
        PG[("PostgreSQL (Prisma 7)")]
        IK["ImageKit (Private Document Storage)"]
    end

    subgraph IngestEngine["Ingestion & Indexing Engine (Inngest)"]
        UploadAuth["/api/upload-auth"]
        DocReg["/api/documents (HTTP 202)"]
        Worker["Inngest Background Orchestrator"]
        PDFParser["PDF.js Text Extractor"]
        OCR["@napi-rs/canvas + Tesseract.js worker pool"]
        Chunker["Page-Boundary Clause Splitter"]
        FileCache["In-Memory File Cache (download once)"]
    end

    subgraph VectorEngine["Vector Storage & Reranking"]
        Pinecone[("Pinecone Index (integrated embedding)")]
        Reranker["Pinecone BGE Reranker (bge-reranker-v2-m3)"]
    end

    subgraph QueryEngine["Query & RAG Pipeline"]
        ChatRoute["/api/chat (POST Stream)"]
        InputGuard["Input Guardrail & Injection Classifier"]
        Router["Intent Router (Chat / Content / Metadata / Both)"]
        ChatReply["Chat Reply (greetings, general questions)"]
        Optimizer["Query Optimizer (HyDE, Step-Back, Sub-Queries)"]
        RRF["Reciprocal Rank Fusion (RRF)"]
        Generator["GPT-4o-mini Answer Generator"]
        OutputGuard["Groundedness & Citation Verifier"]
    end

    subgraph DeckEngine["AI Pitch Deck (Inngest)"]
        DeckRoute["/api/decks (HTTP 202)"]
        DeckJob["generate-deck job"]
        DeckAgent["Deck Agent (gpt-4.1-mini + guardrails)"]
        ImageGen["Slide Images (gpt-image-2, all at once)"]
    end

    %% Client Interactions
    UI --> BA
    UI --> UploadAuth
    UploadAuth --> IK
    UI --> DocReg
    DocReg --> PG
    DocReg -.->|Event: document.uploaded| Worker

    %% Ingestion Flow
    Worker --> FileCache
    FileCache --> IK
    Worker --> PDFParser
    PDFParser -.->|Low Text Density| OCR
    PDFParser --> Chunker
    OCR --> Chunker
    Chunker --> Pinecone
    Worker --> PG

    %% Query Flow
    UI --> ChatRoute
    ChatRoute --> Session
    ChatRoute --> InputGuard
    InputGuard --> Router
    Router -->|chat| ChatReply
    ChatReply --> OutputGuard
    Router -->|content / both| Optimizer
    Optimizer --> Pinecone
    Router -->|metadata / both| PG
    Pinecone --> RRF
    RRF --> Reranker
    Reranker --> Generator
    Generator --> OutputGuard
    OutputGuard --> PG
    OutputGuard --> SSE
    SSE --> UI

    %% Pitch Deck Flow
    UI --> DeckRoute
    DeckRoute --> PG
    DeckRoute -.->|Event: deck/generate-deck| DeckJob
    DeckJob --> DeckAgent
    DeckJob --> ImageGen
    ImageGen --> IK
    DeckJob --> PG
```

---

## Ingestion & Indexing Pipeline (Asynchronous)

All heavy document processing runs out-of-band via Inngest step functions. API routes never perform OCR, chunking, or parsing synchronously. Inside each step, pages flow through an assembly line: every page is extracted, chunked and upserted on its own, so it becomes searchable as soon as it is finished.

```mermaid
sequenceDiagram
    autonumber
    actor User as User Browser
    participant API as /api/upload-auth & /api/documents
    participant IK as ImageKit Storage
    participant Inngest as Inngest Orchestrator
    participant PG as PostgreSQL (Prisma)
    participant Pinecone as Pinecone (integrated embedding)

    User->>API: GET /api/upload-auth
    API-->>User: Ephemeral upload signature & token
    User->>IK: Direct upload to /policy-docs/{userId}
    IK-->>User: fileId, filePath, sizeBytes
    User->>API: POST /api/documents (receipt)
    API->>IK: Verify file metadata & ownership
    API->>PG: Create Document (status: UPLOADED, stage: QUEUED)
    API->>Inngest: Send event: document/uploaded
    API-->>User: HTTP 202 Accepted (documentId)

    Note over Inngest,Pinecone: Background pipeline begins
    Inngest->>IK: Download file once (kept in in-memory cache)
    Inngest->>Inngest: Validate magic bytes & MIME type
    Inngest->>Inngest: Open PDF once, count pages
    Inngest->>PG: stage: INSPECTING, pageCount

    loop For each page batch (PAGE_BATCH_SIZE = 10, one Inngest step each)
        Inngest->>Inngest: Reuse cached file, open PDF once for the batch
        Inngest->>PG: stage: EXTRACTING
        par Several pages at once (OCR pool size + 1)
            alt Page has a digital text layer
                Inngest->>Inngest: Read text layer via PDF.js
            else Scanned page or image
                Inngest->>Inngest: Render page (@napi-rs/canvas, async encode)
                Inngest->>Inngest: OCR with shared Tesseract.js worker pool
            end
            Inngest->>Inngest: Chunk page (1000 chars, 150 overlap)
            Inngest->>Pinecone: Upsert chunk_text into namespace {userId}
            Note over Pinecone: Pinecone embeds chunk_text itself
            Inngest->>PG: Save DocumentPage + bump progress (transaction)
        end
    end

    Inngest->>PG: status: INDEXED, stage: DONE, indexedAt
    Inngest-->>User: TanStack Query poll shows "Indexed in Xs · Ys/page"
```

### Ingestion Pipeline Highlights

1. **Direct-to-Cloud Upload**: Files bypass the Next.js application server entirely during upload, preventing memory bloat and execution timeouts on serverless runtimes.
2. **Download Once, Open Once**: The file is downloaded a single time and cached in memory (`storage/read-file-cached.ts`, 10 min, up to 3 files), so later batch steps on the same server reuse it. Each batch opens the PDF a single time and reads every page from it (`extraction/open-pdf.ts`). If a step lands on a different server, it just downloads again.
3. **Selective OCR with a Reused Worker Pool**: Digital PDF pages are read from the text layer in milliseconds. Only pages with fewer than `OCR_TEXT_THRESHOLD` characters (scans, photos) are rendered and sent to OCR. Tesseract workers are started once, shared through a scheduler (`extraction/ocr-pool.ts`), and shut down after 60s idle. In a local test this read 4 scanned pages in ~4s instead of ~13.5s.
4. **Assembly-Line Pages**: Inside a batch, pages run in parallel (`OCR pool size + 1` at a time). Each page is chunked and upserted the moment it is read, so a long document becomes searchable page by page.
5. **Pinecone Integrated Embedding**: Chunks are upserted as `chunk_text` and Pinecone generates the vectors itself. There is no separate OpenAI embedding call during indexing.
6. **Strict Page-Boundary Chunking**: Chunks never cross page boundaries. Every chunk carries its source `pageNumber`, `documentId`, `fileName`, and `chunkIndex`, so citations point to real pages (and power the hover page preview in chat).
7. **Deterministic Vector IDs & Retry-Safe Progress**: Vectors use IDs `${documentId}:${pageNumber}:${chunkIndex}`, so a retry overwrites instead of duplicating. Page progress is recorded in a transaction that never counts the same page twice.
8. **Speed You Can See**: Logs emit `timing:page` (extract / OCR / upsert ms), `timing:batch` (download, open, ms per page) and `timing:document` (total). The UI shows "Indexed in 14s · 1.2s/page" for each finished document.

### Indexing Tuning

| Variable | Default | What it does |
|---|---|---|
| `PAGE_BATCH_SIZE` | `10` | Pages per Inngest step. Lower it (3–5) on serverless hosts with short time limits. |
| `OCR_WORKERS` | CPU cores − 1 (1–4) | Tesseract workers kept alive and reused. Lower it (e.g. `2`) if OCR runs out of memory. |
| `PDF_RENDER_SCALE` | `2` | How big scanned pages are drawn before OCR. Lower is faster but may miss tiny text. |
| `OCR_TEXT_THRESHOLD` | `50` | Pages with fewer characters than this in the text layer are treated as scanned. |
| `CHUNK_SIZE` / `CHUNK_OVERLAP` | `1000` / `150` | Size of each text piece and how much neighbouring pieces overlap. |
| `OCR_LANG` | `eng` | OCR language. `eng.traineddata` in the project root is used, so nothing is downloaded at runtime. |

### Deploying Indexing on Vercel

pdf.js and Tesseract load some files by paths built at runtime, which Vercel's file tracing cannot see. The project handles this for you:

- `extraction/open-pdf.ts` imports `pdf.worker.mjs` directly, so it is bundled and used in-process.
- `next.config.ts` lists the Tesseract worker script, `tesseract.js-core` wasm files, their dependencies, and `eng.traineddata` in `outputFileTracingIncludes` for `/api/inngest`.

On a long-running server (Railway, Render, a VPS) the file cache and OCR pool are reused across steps and documents. On serverless each step may start fresh, so it is slower but still works.

---

## Query & Grounded Retrieval Engine (RAG)

The query engine handles incoming questions through an orchestrated multi-stage pipeline exposed over Server-Sent Events (SSE).

```mermaid
flowchart LR
    Q[User Prompt] --> S1[1. Input Guard]
    S1 --> S2[2. Intent Router]
    S2 -->|chat| C[Chat Reply, no search]
    C --> S9
    S2 -->|content / metadata / both| S3[3. Query Optimizer]
    S3 --> S4[4. Pinecone Dense Retrieval]
    S4 --> S5[5. Reciprocal Rank Fusion]
    S5 --> S6[6. Cross-Encoder Reranker]
    S6 --> S7[7. Answer Streamer]
    S7 --> S8[8. Output Groundedness Check]
    S8 --> S9[9. SSE Emitter & Save]

    subgraph OptimizerStage["Optimization Breakdown"]
        S3 --- O1[HyDE Generation]
        S3 --- O2[Step-Back Inquiry]
        S3 --- O3[Sub-Query Splitting]
    end

    subgraph GuardrailStage["Verification Breakdown"]
        S8 --- G1[Check Citation Tags]
        S8 --- G2[Factuality Scoring]
        S8 --- G3[Safe Fallback on Failure]
    end
```

### 9-Stage Query Pipeline Details

| Stage | Name | Description |
| :---: | :--- | :--- |
| **1** | **Input Guard** | Evaluates the user query against heuristic rules and an LLM-based injection classifier to intercept prompt leaks, jailbreaks, and instructions attempting to override system behavior. |
| **2** | **Intent Router** | Runs **before** optimization. Obvious small talk ("hi", "thanks", "bye", "what can you do?") is caught by an instant rule (`routing/detect-small-talk.ts`), with no AI call. Everything else goes to a fast model that picks **chat** (greetings, questions about the app, general questions), **content**, **metadata**, or **both**. It sees the last few turns, so "and for interns?" stays a document question. When unsure it picks content. |
| **2b** | **Chat Reply** | For the chat route only: a short, friendly streamed reply (`prompts/chat-reply.prompt.ts`) using the fast model, with no search, no citations, and the user's ready document names to suggest example questions. General answers are labelled as general information, policy questions are never answered from general knowledge, and off-topic requests (e.g. writing code) are politely declined. The pipeline ends here. |
| **3** | **Query Optimizer** | Expands the query into multiple search variants: **HyDE** (Hypothetical Document Embeddings for conceptual matching), **Step-Back Prompting** (high-level policy concepts), and **Sub-Queries** (multi-intent questions). |
| **4** | **Dense Retrieval** | Executes multi-query vector searches in Pinecone under the user's isolated namespace (`{userId}`). |
| **5** | **Reciprocal Rank Fusion** | Merges results across original, hypothetical, and sub-queries using RRF formula \(RRF(d) = \sum \frac{1}{k + r_i(d)}\), producing an integrated candidate ranking. |
| **6** | **Pinecone Reranker** | Passes top candidate passages through `bge-reranker-v2-m3` cross-attention to discard low-relevance noise and retain the top \(N\) most authoritative chunks. |
| **7** | **Streaming Generation** | Streams tokens using GPT-4o-mini with system constraints strictly prohibiting speculation and requiring inline bracketed citations (`[1]`, `[2]`). |
| **8** | **Output Verification** | Verifies that all generated statements and citations match the source text chunks. If hallucination or unverifiable claims are detected, the response is replaced with a safe fallback notice. |
| **9** | **Persistence & Finalization** | Saves the user message and assistant answer with structured citation metadata to PostgreSQL, triggers conversation list cache invalidation, and closes the SSE channel. |

---

## AI Pitch Deck Generator

Code lives in `modules/pitch-deck/`, the background job in `inngest/functions/generate-deck.ts`, pages in `app/dashboard/decks/`, and UI in `components/decks/`.

```mermaid
sequenceDiagram
    autonumber
    actor User as User Browser
    participant API as /api/decks
    participant PG as PostgreSQL (Prisma)
    participant Inngest as Inngest (generate-deck)
    participant Agent as Deck Agent (gpt-4.1-mini)
    participant Img as OpenAI Images (gpt-image-2)
    participant IK as ImageKit

    User->>API: POST /api/decks { idea }
    API->>PG: Create Deck (PENDING)
    API->>Inngest: Send event: deck/generate-deck
    API-->>User: HTTP 202 (deckId), page polls every 2.5s
    Inngest->>PG: Deck GENERATING
    Inngest->>Agent: Idea
    Note over Agent: beforeAgent guardrail: idea >= 20 chars<br/>structured output: slides + picture plan<br/>afterAgent guardrail: quality checker
    Agent-->>Inngest: 7 slides + image prompts
    Inngest->>PG: Save slides (imageStatus PENDING), deck still GENERATING
    par One Inngest step per slide, all at once
        Inngest->>Img: Image prompt (1536x1024, quality low)
        Img-->>Inngest: base64 PNG -> Buffer
        Inngest->>IK: Upload to /deck-images/{userId}/{deckId}
        IK-->>Inngest: URL + fileId
        Inngest->>PG: Slide.imageUrl, imageStatus COMPLETE
    end
    Inngest->>PG: Deck COMPLETE (only now are slides returned by the API)
```

### How it works

| Part | File | What it does |
|---|---|---|
| **Agent** | `pitch-deck-agent.ts` | LangChain `createAgent` with the deck system prompt, structured output (`PitchDeckOutputSchema`), and both guardrails as middleware. |
| **Guardrails** | `guardrail.ts` | Input: rejects ideas under 20 characters (no AI call). Output: a second agent checks for placeholders, empty slides, and unsafe content. Any business topic is allowed. |
| **Picture plan** | system prompt | Each slide gets a `visualType` (diagram, flowchart, timeline, chart, infographic, illustration, product_mockup, photo), a scene, and `imageText` labels. Educational ideas (`isEducational`) prefer diagrams, flowcharts and timelines. |
| **Image prompt** | `image-prompt.ts` | Builds the final prompt: slide + visual style + scene + exact text rule + house style. Labels are short (max 6, 4 words each) and quoted with "spelled exactly"; no labels means "draw no letters at all". This prevents made-up text in images. |
| **Image generator** | `image-generator.ts` | OpenAI Images API. A temporary failure (429/5xx, timeout, no image, missing model) is retried once on the fallback model. A refusal is not retried. Returns `ok` or a `refused` / `transient` / `error` reason. |
| **Storage** | `image-storage.ts` | Uploads the Buffer to ImageKit (public, AI-made pictures only) and deletes them when a deck is deleted. |
| **Job** | `generate-deck.ts` | Steps: load → GENERATING → write slides → save → `image-<slideId>` for every slide in parallel → COMPLETE. Steps return only URLs, never image bytes (Inngest step output has a size limit). Concurrency is 16 steps per user, so every image of a deck runs at once. |

**Statuses.** Deck: `PENDING → GENERATING → COMPLETE` or `FAILED` (failed only if no slides were written). Slide image: `PENDING → COMPLETE`, `FAILED`, `REFUSED`, or `SKIPPED` (slides made before images existed).

**Viewer.** A 16:9 slide player with arrow keys, thumbnails, fullscreen "Present", and "Copy as text". All sizes use container units (`cqw`), so the slide scales as one piece. Labelled pictures are never cropped (`object-contain` in a 3:2 frame), and long text shrinks instead of overflowing.

**Cost and speed.** About $0.005 per image at `quality: low`, so about 4 cents per deck, ready in about 20–30 seconds.

---

## Data Models & Persistence Strategy

The system uses **PostgreSQL** via **Prisma 7** for operational state and **Pinecone Serverless** for high-dimensional vector search.

```mermaid
erDiagram
    User ||--o{ Session : "has"
    User ||--o{ Account : "has"
    User ||--o{ Document : "owns"
    User ||--o{ Conversation : "owns"

    User ||--o{ Deck : "owns"

    Document ||--o{ DocumentPage : "contains"
    Conversation ||--o{ Message : "contains"
    Deck ||--o{ Slide : "contains"

    Deck {
        string id PK
        string userId FK
        string idea
        string title
        enum status "PENDING | GENERATING | COMPLETE | FAILED"
        string errorMessage
        datetime createdAt
        datetime updatedAt
    }

    Slide {
        string id PK
        string deckId FK
        int order
        string title
        string content
        string imagePrompt
        string imageUrl
        string imageFileId
        enum imageStatus "PENDING | COMPLETE | FAILED | REFUSED | SKIPPED"
        string imageError
        datetime createdAt
    }

    Document {
        string id PK
        string userId FK
        string fileName
        string filePath
        string fileId
        string mimeType
        int sizeBytes
        enum status "UPLOADED | PROCESSING | INDEXED | FAILED"
        enum stage "QUEUED | INSPECTING | EXTRACTING | CHUNKING | EMBEDDING | UPSERTING | DONE"
        int pageCount
        int pagesProcessed
        int chunkCount
        string errorMessage
        datetime indexedAt
        datetime createdAt
    }

    DocumentPage {
        string id PK
        string documentId FK
        int pageNumber
        boolean hasTextLayer
        boolean ocrApplied
        int characterCount
        int chunkCount
        datetime createdAt
    }

    Conversation {
        string id PK
        string userId FK
        string title
        datetime createdAt
        datetime updatedAt
    }

    Message {
        string id PK
        string conversationId FK
        enum role "USER | ASSISTANT | SYSTEM"
        string content
        json citations
        datetime createdAt
    }
```

### Pinecone Vector Schema

Records are upserted into a Pinecone index with **integrated embedding**: the app sends `chunk_text` and Pinecone creates the vector. Each user gets their own namespace (`{userId}`), and every record carries metadata for citations:

```typescript
interface PineconeChunkRecord {
  _id: string; // Deterministic: `${documentId}:${pageNumber}:${chunkIndex}`
  chunk_text: string; // Text Pinecone embeds and searches
  title: string; // File name, shown in citations
  documentId: string; // Foreign key to PostgreSQL Document
  userId: string; // Tenant identifier (also the namespace)
  fileName: string; // Human-readable file name
  pageNumber: number; // Physical page number (1-indexed)
  chunkIndex: number; // Index of chunk within the page
  source: "text-layer" | "ocr"; // How the page text was obtained
  ocrConfidence: number; // Tesseract confidence (0 for text-layer pages)
  text: string; // Raw text of the chunk
}
```

---

## Multi-Tenant Security & Privacy Model

1. **Namespace Isolation in Vector Database**: Every Pinecone vector operation is strictly scoped to `namespace: user_${session.user.id}`. Cross-tenant retrieval is architecturally impossible at the query layer.
2. **Private Cloud File Store**: Document uploads reside in private ImageKit folders (`/policy-docs/{userId}`). Files are inaccessible without server-signed authentication. AI-generated slide pictures (no user documents) are stored as public files in `/deck-images/{userId}/{deckId}` so slides can load them directly; they are deleted with their deck.
3. **Database Row-Level Verification**: All Prisma queries for documents, pages, conversations, and messages filter by `userId: session.user.id`.
4. **Prompt Injection Hardening**: All user inputs pass through a multi-layer guardrail before hitting retrieval or generation models.
5. **Redaction & Privacy by Default**: Document text, vectors, and citation payloads are never exposed to client logs or analytics pipelines.

---

## Frontend Architecture & Design Philosophy

The interface is inspired by the **Family.co** product aesthetic: calm, spacious, soft, and confident.

- **No Card Soup**: The entire chat experience features **at most 1 card-like element** (the composer pill at the bottom). Assistant messages live directly on the canvas without boxed borders or card shadows.
- **Hairline Dividers & Typography**: Visual hierarchy is created through whitespace, subtle borders (`border-stone-200/70 dark:border-stone-800/70`), and sentence-case typography.
- **Real-Time Pipeline Status**: During generation, the assistant message crossfades through query stages (`Checking your question` → `Understanding your question` → `Searching your documents` → `Picking the best passages` → `Writing the answer` → `Verifying against your documents`) before streaming tokens.
- **Interactive Superscript Citations**: Inline markers (`[1]`, `[2]`) render as superscript pills. Hovering previews the document name and page number; clicking smoothly scrolls to and highlights the corresponding source row.
- **Theme Persistence**: Light and dark mode transitions are governed by an inline pre-hydration script, preventing screen flash or theme flickering during page transitions.

---

## Technology Stack

| Layer | Component | Version / Provider | Purpose |
| :--- | :--- | :--- | :--- |
| **Framework** | Next.js (App Router) | 16.4.6 | Full-stack server and client runtime with Turbopack |
| **Language** | TypeScript | 5.x | Strict end-to-end type safety |
| **Database** | PostgreSQL | 15+ | Relational metadata, documents, auth, conversations |
| **ORM** | Prisma ORM | 7.10.1 | Type-safe query builder and database migrations |
| **Auth** | Better Auth | 1.7.25 | OAuth SSO (Google & GitHub) session management |
| **Background Jobs** | Inngest | 4.26.2 | Event-driven background orchestrator for slow tasks |
| **Vector Engine** | Pinecone Serverless | 9.2.0 | Multi-tenant dense vector index with namespaces |
| **Reranker** | Pinecone Rerank | `bge-reranker-v2-m3` | Cross-encoder relevance re-scoring |
| **Embeddings** | Pinecone integrated embedding | model set on the index | Pinecone embeds `chunk_text` on upsert and on search; no app-side embedding calls |
| **LLM Inference** | OpenAI | `gpt-4o-mini` | Query optimization, routing, guardrails, chat replies, and streaming answer generation |
| **Agents** | LangChain (`langchain`) | 1.6.7 | Pitch deck agent with structured output and guardrail middleware (`gpt-4.1-mini`) |
| **Image Generation** | OpenAI Images | `gpt-image-2` (fallback `gpt-image-1.5`) | Slide diagrams, charts and pictures at `quality: low` |
| **Document Storage** | ImageKit | 2.1.6 / 7.15.0 | Private cloud file hosting and direct-upload signing |
| **PDF Processing** | PDF.js | 6.5.438 | Digital PDF text extraction and page parsing |
| **Canvas & OCR** | @napi-rs/canvas + Tesseract.js | 1.1.1 / 7.0.0 | Page rendering, OCR with a reused worker pool, and citation page previews |
| **State & Cache** | TanStack React Query | 5.107.1 | Client data fetching, caching, polling, and optimistic updates |
| **Animation** | Motion (Framer Motion) | 14.14.0 | 60fps spring transitions, layout morphing, and status fades |
| **Test Suite** | Vitest | 5.1.0 | Fast, isolated unit and integration test suite |

---

## Environment Configuration Reference

Create a `.env` file in the project root. For security, never commit secrets to source control.

```bash
# Database Connection (PostgreSQL)
DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"

# Application URL & Better Auth
BETTER_AUTH_SECRET="your-32-char-random-secret"
BETTER_AUTH_URL="http://localhost:3000"

# Social Authentication Providers
GITHUB_CLIENT_ID="your-github-oauth-client-id"
GITHUB_CLIENT_SECRET="your-github-oauth-client-secret"
GOOGLE_CLIENT_ID="your-google-oauth-client-id"
GOOGLE_CLIENT_SECRET="your-google-oauth-client-secret"

# Cloud File Storage (ImageKit)
IMAGEKIT_PUBLIC_KEY="your-imagekit-public-key"
IMAGEKIT_PRIVATE_KEY="your-imagekit-private-key"
IMAGEKIT_URL_ENDPOINT="https://ik.imagekit.io/your-id"

# Vector Search (Pinecone)
PINECONE_API_KEY="your-pinecone-api-key"
PINECONE_INDEX="your-pinecone-index-name"  # index with integrated embedding on field chunk_text

# LLM for chat answers and pitch decks (OpenAI)
OPENAI_API_KEY="your-openai-api-key"

# Pitch deck slide images (optional, blank = default)
# DECK_IMAGE_MODEL="gpt-image-2"
# DECK_IMAGE_FALLBACK_MODEL="gpt-image-1.5"   # set to "" to turn the retry off
# DECK_IMAGE_QUALITY="low"                    # low (cheapest, fastest) | medium | high

# Indexing speed knobs (optional, see "Indexing Tuning")
PAGE_BATCH_SIZE=10
OCR_WORKERS=
PDF_RENDER_SCALE=2

# Inngest Background Orchestration
INNGEST_EVENT_KEY="your-inngest-event-key"
INNGEST_SIGNING_KEY="your-inngest-signing-key"
```

---

## Local Development & Operations Runbook

### Prerequisites

- **Node.js**: v20 or v22 LTS
- **Package Manager**: `pnpm` (v9 or v11)
- **PostgreSQL**: Local instance or hosted database (e.g. Supabase, Neon)

### 1. Installation

```bash
# Clone the repository
git clone <repository-url>
cd "ai pitch deck"

# Install dependencies
pnpm install
```

### 2. Database Setup

```bash
# Generate the Prisma Client
pnpm prisma generate

# Apply pending database migrations
pnpm prisma migrate deploy
```

### 3. Running Development Servers

Start the Next.js dev server and the Inngest local orchestrator side-by-side:

```bash
# Terminal 1: Next.js application server
pnpm dev

# Terminal 2: Inngest local development orchestrator
pnpm dlx inngest-cli@latest dev -u http://localhost:3000/api/inngest
```

- Web Application: [http://localhost:3000](http://localhost:3000)
- Inngest Dashboard: [http://localhost:8288](http://localhost:8288)

### 4. Running Verification & Tests

```bash
# Run Vitest test suite
pnpm test

# Type-check TypeScript codebase
pnpm tsc --noEmit

# Run ESLint validation
pnpm lint
```

---

## License

Internal corporate software. All rights reserved.
