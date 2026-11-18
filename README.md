# PolicyExtract

> **Enterprise Company Policy Reader & Grounded RAG Intelligence Engine**  
> Transform complex corporate handbooks, compliance manuals, HR policies, and vendor SLAs into provable, clause-cited answers with sub-second retrieval, automated OCR fallback, and multi-tenant isolation.

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [End-to-End System Architecture](#end-to-end-system-architecture)
3. [Ingestion & Indexing Pipeline (Asynchronous)](#ingestion--indexing-pipeline-asynchronous)
4. [Query & Grounded Retrieval Engine (RAG)](#query--grounded-retrieval-engine-rag)
5. [Data Models & Persistence Strategy](#data-models--persistence-strategy)
6. [Multi-Tenant Security & Privacy Model](#multi-tenant-security--privacy-model)
7. [Frontend Architecture & Design Philosophy](#frontend-architecture--design-philosophy)
8. [Technology Stack](#technology-stack)
9. [Environment Configuration Reference](#environment-configuration-reference)
10. [Local Development & Operations Runbook](#local-development--operations-runbook)

---

## Executive Summary

Enterprise policy documentation is historically difficult to query: agreements are long, scanned PDFs lack text layers, answers frequently hallucinate, and traditional keyword search fails on semantic nuance. 

**PolicyExtract** solves this with a purpose-built, dual-engine architecture:
- **Asynchronous Ingestion Engine**: Decouples slow operations (OCR, PDF rendering, chunking, embedding generation, Pinecone upserts) into isolated, idempotent background steps powered by **Inngest**. API routes remain sub-50ms.
- **Grounded Query Engine**: Implements an advanced 9-stage Retrieval-Augmented Generation (RAG) pipeline incorporating prompt injection guardrails, multi-angle query optimization (HyDE, Step-Back, Sub-Queries), Reciprocal Rank Fusion (RRF), Cross-Encoder Reranking, strict clause-level citation enforcement, and output hallucination verification.
- **Family.co Aesthetic**: Designed with spacious typography, hairline dividers, soft rounded shapes, and zero "card soup", delivering a modern, calm corporate tool.

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
        OCR["@napi-rs/canvas + Tesseract.js"]
        Chunker["Page-Boundary Clause Splitter"]
        Embedder["OpenAI text-embedding-3-small"]
    end

    subgraph VectorEngine["Vector Storage & Reranking"]
        Pinecone[("Pinecone Serverless Index")]
        Reranker["Pinecone BGE Reranker (bge-reranker-v2-m3)"]
    end

    subgraph QueryEngine["Query & RAG Pipeline"]
        ChatRoute["/api/chat (POST Stream)"]
        InputGuard["Input Guardrail & Injection Classifier"]
        Optimizer["Query Optimizer (HyDE, Step-Back, Sub-Queries)"]
        Router["Intent Router (Content / Metadata / Both)"]
        RRF["Reciprocal Rank Fusion (RRF)"]
        Generator["GPT-4o-mini Answer Generator"]
        OutputGuard["Groundedness & Citation Verifier"]
    end

    %% Client Interactions
    UI --> BA
    UI --> UploadAuth
    UploadAuth --> IK
    UI --> DocReg
    DocReg --> PG
    DocReg -.->|Event: document.uploaded| Worker

    %% Ingestion Flow
    Worker --> IK
    Worker --> PDFParser
    PDFParser -.->|Low Text Density| OCR
    PDFParser --> Chunker
    OCR --> Chunker
    Chunker --> Embedder
    Embedder --> Pinecone
    Worker --> PG

    %% Query Flow
    UI --> ChatRoute
    ChatRoute --> Session
    ChatRoute --> InputGuard
    InputGuard --> Optimizer
    Optimizer --> Router
    Router --> Pinecone
    Router --> PG
    Pinecone --> RRF
    RRF --> Reranker
    Reranker --> Generator
    Generator --> OutputGuard
    OutputGuard --> PG
    OutputGuard --> SSE
    SSE --> UI
```

---

## Ingestion & Indexing Pipeline (Asynchronous)

All heavy document processing runs out-of-band via Inngest step functions. API routes never perform OCR, embedding, or parsing synchronously.

```mermaid
sequenceDiagram
    autonumber
    actor User as User Browser
    participant API as /api/upload-auth & /api/documents
    participant IK as ImageKit Storage
    participant Inngest as Inngest Orchestrator
    participant PG as PostgreSQL (Prisma)
    participant OpenAI as OpenAI API
    participant Pinecone as Pinecone Vector DB

    User->>API: GET /api/upload-auth
    API-->>User: Ephemeral upload signature & token
    User->>IK: Direct upload to /policy-docs/{userId}
    IK-->>User: fileId, filePath, sizeBytes
    User->>API: POST /api/documents (receipt)
    API->>PG: Create Document (status: UPLOADED)
    API->>Inngest: Send event: document.uploaded
    API-->>User: HTTP 202 Accepted (documentId)

    Note over Inngest,Pinecone: Background Pipeline Begins
    Inngest->>PG: Update stage: INSPECTING
    Inngest->>IK: Fetch file binary stream
    Inngest->>Inngest: Validate magic bytes & MIME type
    Inngest->>Inngest: Count pages via PDF.js

    loop For each page batch (Batch size = 10)
        Inngest->>PG: Update stage: EXTRACTING
        alt Page has digital text
            Inngest->>Inngest: Extract text layer via PDF.js
        else Scanned image or low character density
            Inngest->>Inngest: Render to canvas (@napi-rs/canvas)
            Inngest->>Inngest: Run OCR with Tesseract.js
        end
        Inngest->>Inngest: Split into clause chunks (Max 800 chars, 100 overlap)
        Note over Inngest: Chunks strictly preserve pageNumber
        Inngest->>PG: Update stage: EMBEDDING
        Inngest->>OpenAI: Generate embeddings (text-embedding-3-small, 1536 dims)
        OpenAI-->>Inngest: Vector embeddings array
        Inngest->>PG: Update stage: UPSERTING
        Inngest->>Pinecone: Upsert vectors into namespace user_{userId}
        Inngest->>PG: Record DocumentPage records
    end

    Inngest->>PG: Set Document status: INDEXED, stage: DONE
    Inngest-->>User: TanStack Query poll receives INDEXED state
```

### Ingestion Pipeline Highlights

1. **Direct-to-Cloud Upload**: Files bypass the Next.js application server entirely during upload, preventing memory bloat and execution timeouts on serverless runtimes.
2. **Selective OCR Fallback**: Digital PDFs are parsed with PDF.js in milliseconds. Tesseract.js OCR is dynamically invoked only for scanned pages or images where text density falls below the threshold.
3. **Strict Page-Boundary Chunking**: Chunks never cross page boundaries. Every chunk explicitly carries its source `pageNumber`, `documentId`, `fileName`, and `chunkIndex`, ensuring citations point to verifiable physical pages.
4. **Deterministic Vector IDs**: Vectors are upserted with IDs formatted as `${documentId}:${pageNumber}:${chunkIndex}`. Re-indexing a document overwrites existing records idempotently without duplicates.

---

## Query & Grounded Retrieval Engine (RAG)

The query engine handles incoming questions through an orchestrated multi-stage pipeline exposed over Server-Sent Events (SSE).

```mermaid
flowchart LR
    Q[User Prompt] --> S1[1. Input Guard]
    S1 --> S2[2. Query Optimizer]
    S2 --> S3[3. Multi-Route Dispatcher]
    S3 --> S4[4. Pinecone Dense Retrieval]
    S4 --> S5[5. Reciprocal Rank Fusion]
    S5 --> S6[6. Cross-Encoder Reranker]
    S6 --> S7[7. Answer Streamer]
    S7 --> S8[8. Output Groundedness Check]
    S8 --> S9[9. SSE Emitter & Save]

    subgraph OptimizerStage["Optimization Breakdown"]
        S2 --- O1[HyDE Generation]
        S2 --- O2[Step-Back Inquiry]
        S2 --- O3[Sub-Query Splitting]
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
| **2** | **Query Optimizer** | Expands the query into multiple search variants: **HyDE** (Hypothetical Document Embeddings for conceptual matching), **Step-Back Prompting** (high-level policy concepts), and **Sub-Queries** (multi-intent questions). |
| **3** | **Intent Router** | Determines if the question queries document content, document metadata (e.g., "how many documents are uploaded?"), or both. |
| **4** | **Dense Retrieval** | Executes multi-query vector searches in Pinecone under the user's isolated namespace (`user_{userId}`). |
| **5** | **Reciprocal Rank Fusion** | Merges results across original, hypothetical, and sub-queries using RRF formula \(RRF(d) = \sum \frac{1}{k + r_i(d)}\), producing an integrated candidate ranking. |
| **6** | **Pinecone Reranker** | Passes top candidate passages through `bge-reranker-v2-m3` cross-attention to discard low-relevance noise and retain the top \(N\) most authoritative chunks. |
| **7** | **Streaming Generation** | Streams tokens using GPT-4o-mini with system constraints strictly prohibiting speculation and requiring inline bracketed citations (`[1]`, `[2]`). |
| **8** | **Output Verification** | Verifies that all generated statements and citations match the source text chunks. If hallucination or unverifiable claims are detected, the response is replaced with a safe fallback notice. |
| **9** | **Persistence & Finalization** | Saves the user message and assistant answer with structured citation metadata to PostgreSQL, triggers conversation list cache invalidation, and closes the SSE channel. |

---

## Data Models & Persistence Strategy

The system uses **PostgreSQL** via **Prisma 7** for operational state and **Pinecone Serverless** for high-dimensional vector search.

```mermaid
erDiagram
    User ||--o{ Session : "has"
    User ||--o{ Account : "has"
    User ||--o{ Document : "owns"
    User ||--o{ Conversation : "owns"

    Document ||--o{ DocumentPage : "contains"
    Conversation ||--o{ Message : "contains"

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

Every embedding stored in Pinecone is tagged with rich metadata to facilitate hybrid filtering and grounded attribution:

```typescript
interface PineconeChunkRecord {
  id: string; // Deterministic: `${documentId}:${pageNumber}:${chunkIndex}`
  values: number[]; // 1536-dimensional embedding vector
  metadata: {
    documentId: string; // Foreign key to PostgreSQL Document
    userId: string; // Tenant identifier
    fileName: string; // Human-readable file name
    pageNumber: number; // Physical page number (1-indexed)
    chunkIndex: number; // Index of chunk within page
    text: string; // Raw textual content of the clause
    charCount: number; // Character count of the clause
    createdAt: string; // ISO-8601 timestamp
  };
}
```

---

## Multi-Tenant Security & Privacy Model

1. **Namespace Isolation in Vector Database**: Every Pinecone vector operation is strictly scoped to `namespace: user_${session.user.id}`. Cross-tenant retrieval is architecturally impossible at the query layer.
2. **Private Cloud File Store**: Document uploads reside in private ImageKit folders (`/policy-docs/{userId}`). Files are inaccessible without server-signed authentication.
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
| **Embeddings** | OpenAI | `text-embedding-3-small` | 1536-dimensional semantic embeddings |
| **LLM Inference** | OpenAI | `gpt-4o-mini` | Query optimization, guardrails, and streaming answer generation |
| **Document Storage** | ImageKit | 2.1.6 / 7.15.0 | Private cloud file hosting and direct-upload signing |
| **PDF Processing** | PDF.js | 6.5.438 | Digital PDF text extraction and page parsing |
| **Canvas & OCR** | @napi-rs/canvas + Tesseract.js | 1.1.1 / 7.0.0 | Server-side page image rasterization and OCR fallback |
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
PINECONE_INDEX_NAME="your-pinecone-index-name"

# LLM & Embedding Models (OpenAI)
OPENAI_API_KEY="your-openai-api-key"

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
