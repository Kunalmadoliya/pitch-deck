# Read-Only Audit Report: Company Policy Reader

This audit provides a factual, code-backed inventory of the current repository state against the target goal: running all slow operations (OCR, PDF page rendering, chunking, embeddings, and Pinecone upserts) asynchronously inside discrete Inngest background steps.

---

## 1. Project Overview

### Full Folder Structure
*(Excluding `node_modules`, `.next`, `.git`, `.agents`, and generated build artifacts)*

```text
ai-pitch/
├── .env
├── .env.example
├── .gitignore
├── AGENTS.md
├── components.json
├── eslint.config.mjs
├── next-env.d.ts
├── next.config.ts
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── prisma7.config.ts
├── README.md
├── skills-lock.json
├── tsconfig.json
├── tsconfig.tsbuildinfo
├── app/
│   ├── api/
│   │   └── auth/
│   │       └── [...all]/
│   │           └── route.ts
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx
│   ├── login/
│   │   ├── login-form.tsx
│   │   └── page.tsx
│   ├── page.tsx
│   └── providers.tsx
├── auth/
│   └── auth.ts
├── components/
│   ├── drafting/
│   │   ├── dashed-button.tsx
│   │   ├── dashed-grid.tsx
│   │   ├── draw-line.tsx
│   │   ├── index.ts
│   │   ├── pipeline-flow.tsx
│   │   ├── policy-viewer-sketch.tsx
│   │   ├── pop-in.tsx
│   │   └── region.tsx
│   ├── layout/
│   │   ├── site-footer.tsx
│   │   └── site-header.tsx
│   ├── theme-toggle.tsx
│   └── ui/
│       ├── accordion.tsx
│       ├── alert-dialog.tsx
│       ├── alert.tsx
│       ├── aspect-ratio.tsx
│       ├── attachment.tsx
│       ├── avatar.tsx
│       ├── badge.tsx
│       ├── breadcrumb.tsx
│       ├── bubble.tsx
│       ├── button-group.tsx
│       ├── button.tsx
│       ├── calendar.tsx
│       ├── card.tsx
│       ├── carousel.tsx
│       ├── chart.tsx
│       ├── checkbox.tsx
│       ├── code-block.tsx
│       ├── collapsible.tsx
│       ├── combobox.tsx
│       ├── command.tsx
│       ├── context-menu.tsx
│       ├── dialog.tsx
│       ├── direction.tsx
│       ├── drawer.tsx
│       ├── dropdown-menu.tsx
│       ├── empty.tsx
│       ├── field.tsx
│       ├── hover-card.tsx
│       ├── input-group.tsx
│       ├── input-otp.tsx
│       ├── input.tsx
│       ├── item.tsx
│       ├── kbd.tsx
│       ├── label.tsx
│       ├── marker.tsx
│       ├── menubar.tsx
│       ├── message-scroller.tsx
│       ├── message.tsx
│       ├── native-select.tsx
│       ├── navigation-menu.tsx
│       ├── pagination.tsx
│       ├── popover.tsx
│       ├── progress.tsx
│       ├── questionnaire.tsx
│       ├── radio-group.tsx
│       ├── resizable.tsx
│       ├── scroll-area.tsx
│       ├── select.tsx
│       ├── separator.tsx
│       ├── sheet.tsx
│       ├── sidebar.tsx
│       ├── skeleton.tsx
│       ├── slider.tsx
│       ├── spinner.tsx
│       ├── switch.tsx
│       ├── table.tsx
│       ├── tabs.tsx
│       ├── textarea.tsx
│       ├── toast.tsx
│       ├── toggle-group.tsx
│       ├── toggle.tsx
│       ├── tooltip.tsx
│       └── trace.tsx
├── hooks/
│   ├── use-auth.ts
│   ├── use-highlighted-code.ts
│   └── use-mobile.ts
├── inngest/
│   ├── client.ts
│   ├── index.ts
│   └── functions/
│       ├── indexing.ts
│       └── query.ts
├── lib/
│   ├── auth-client.ts
│   ├── highlighter.tsx
│   ├── prisma.ts
│   └── query-client.ts
├── prisma/
│   ├── migrations/
│   │   ├── 20261116155050_init/
│   │   │   └── migration.sql
│   │   ├── 20261116161332_add_better_auth/
│   │   │   └── migration.sql
│   │   └── migration_lock.toml
│   └── schema.prisma
└── public/
    ├── file.svg
    ├── globe.svg
    ├── next.svg
    ├── vercel.svg
    └── window.svg
```

### Framework Version, Package Manager & Dependencies Audit

- **Framework**: Next.js `16.4.6` (App Router, Turbopack, React `19.3.0`, React DOM `19.3.0`)
- **Package Manager**: `pnpm@11.28.5` (defined in `package.json` line 49)

| Dependency Domain | Package Name | Status in `package.json` | Version / Notes |
| :--- | :--- | :--- | :--- |
| **LangChain packages** | `langchain`, `@langchain/*` | ❌ **NOT INSTALLED** | None found |
| **OCR** | `tesseract.js` | ❌ **NOT INSTALLED** | None found |
| **PDF Extraction** | `pdfjs-dist` | ❌ **NOT INSTALLED** | None found |
| **Canvas / Rendering** | `canvas`, `pdf-img-convert`, `@napi-rs/canvas` | ❌ **NOT INSTALLED** | None found |
| **Vector DB** | `@pinecone-database/pinecone` | ❌ **NOT INSTALLED** | None found |
| **Background Jobs** | `inngest` |  **INSTALLED** | `^4.26.2` |
| **Embeddings / LLM** | `openai`, `@ai-sdk/*` | ❌ **NOT INSTALLED** | None found |
| **Schema Validation** | `zod` | ❌ **NOT INSTALLED** | None found |
| **ORM / Database** | `prisma`, `@prisma/client`, `@prisma/adapter-pg`, `pg` |  **INSTALLED** | `prisma@^7.10.1`, `@prisma/client@^7.10.1`, `@prisma/adapter-pg@^7.10.1`, `pg@^8.23.1` |
| **Authentication** | `better-auth` |  **INSTALLED** | `^1.7.25` |

---

## 2. Indexing Phase: What is Already Built

Below is the status of each of the 10 indexing pipeline stages. Where code exists, it is pasted verbatim.

### 1. Upload API Route (auth check, validation, file storage)
- **Exists**: ❌ **NO**
- **Exact file path**: None (route `app/api/upload/route.ts` or similar does not exist)
- **Function name**: N/A
- **Code**:
```text
/* File does not exist */
```

---

### 2. File Type Detection (image vs PDF, text layer vs scanned, per page)
- **Exists**: ❌ **NO**
- **Exact file path**: None
- **Function name**: N/A
- **Code**:
```text
/* File does not exist */
```

---

### 3. PDF Text Extraction
- **Exists**: ❌ **NO**
- **Exact file path**: None (`pdfjs-dist` is not installed)
- **Function name**: N/A
- **Code**:
```text
/* File does not exist */
```

---

### 4. PDF Page Rendering to Image
- **Exists**: ❌ **NO**
- **Exact file path**: None
- **Function name**: N/A
- **Code**:
```text
/* File does not exist */
```

---

### 5. OCR with tesseract.js (worker handling, language, confidence)
- **Exists**: ❌ **NO**
- **Exact file path**: None (`tesseract.js` is not installed). *Note: The homepage UI components (`PipelineFlow` and `PolicyViewerSketch`) contain static presentation mock strings displaying `"OCR 100%"` and `"acme_infosec_handbook_v4.pdf"`, but no backend or functional OCR code exists.*
- **Function name**: N/A
- **Code**:
```text
/* File does not exist */
```

---

### 6. Chunking (splitter, chunk size, overlap, page number kept per chunk)
- **Exists**: ❌ **NO**
- **Exact file path**: None
- **Function name**: N/A
- **Code**:
```text
/* File does not exist */
```

---

### 7. Embeddings (provider, model, batching, retry)
- **Exists**: ❌ **NO**
- **Exact file path**: None (no embedding SDK or client is installed)
- **Function name**: N/A
- **Code**:
```text
/* File does not exist */
```

---

### 8. Pinecone (client, index name, namespace strategy, vector IDs, metadata fields, delete function)
- **Exists**: ❌ **NO**
- **Exact file path**: None (`@pinecone-database/pinecone` is not installed)
- **Function name**: N/A
- **Code**:
```text
/* File does not exist */
```

---

### 9. Inngest (client, served route, functions, events, which parts use step.run)
- **Exists**: ⚠️ **PARTIAL**
  - **Inngest client**: Exists in `inngest/client.ts`.
  - **Served route (`/api/inngest`)**: ❌ **NO** (route file does not exist).
  - **Functions array**: Exists in `inngest/index.ts` but is empty (`[]`).
  - **Function stub files**: `inngest/functions/indexing.ts` and `inngest/functions/query.ts` exist as 1-line comments only.
  - **Events / step.run**: ❌ None implemented.
- **Exact file path**:
  - `inngest/client.ts`
  - `inngest/index.ts`
  - `inngest/functions/indexing.ts`
  - `inngest/functions/query.ts`
- **Code**:

From `inngest/client.ts`:
```typescript
// src/inngest/client.ts
import { Inngest } from "inngest";

export const inngest = new Inngest({ id:"ai-pitch" });
```

From `inngest/index.ts`:
```typescript
//here we are exporting the inngest client and the functions array so that we can use them in other parts of the application

import { inngest } from "./client";

export { inngest };
export const functions = [];
```

From `inngest/functions/indexing.ts`:
```typescript
//this file hs all the steps of indexing 
```

From `inngest/functions/query.ts`:
```typescript
// this file has all the steps of querying the database and returning the results
```

---

### 10. Document Status Tracking (Prisma model, status enum, where status is updated)
- **Exists**: ❌ **NO**
- **Exact file path**: None (no `Document` model or `Status` enum in `prisma/schema.prisma`)
- **Function name**: N/A
- **Code**:
```text
/* No document tracking models or update functions exist */
```

---

## 3. Sync vs Async Map

| Step | File | Runs Where | Approx Time Cost | Problem |
| :--- | :--- | :--- | :--- | :--- |
| **Authentication Handler** | `app/api/auth/[...all]/route.ts` | Inside HTTP request | Fast (~50–200ms) | None for auth, but lacks tenant/document session linking. |
| **Document Upload** | *Not implemented* | Target: HTTP request | Fast (<100ms) if offloaded | Needs to parse multipart/form-data, write to blob/disk, create pending DB record, and dispatch Inngest event. |
| **PDF Page Rendering / Extraction** | *Not implemented* | Target: Inngest step | **Slow** (2s–30s+ for multi-page PDFs) | **Must NOT run in API route**; will trigger HTTP gateway timeouts. Must run in an isolated Inngest step. |
| **OCR (Tesseract)** | *Not implemented* | Target: Inngest step | **Very Slow** (1s–5s per page, CPU-bound) | **Must NOT run in API route**; requires worker lifecycle management inside an Inngest step. |
| **Chunking** | *Not implemented* | Target: Inngest step | Fast to Moderate (100ms–1s) | Needs dedicated step to preserve page/line metadata before embedding. |
| **Embedding Generation** | *Not implemented* | Target: Inngest step | **Slow** (1s–10s+ depending on token count & rate limits) | **Must NOT run in API route**; external API network calls subject to rate-limiting and retries. |
| **Pinecone Vector Upsert** | *Not implemented* | Target: Inngest step | **Slow** (500ms–3s network I/O) | **Must NOT run in API route**; batch vector writes belong in Inngest step with auto-retry. |
| **Document Status Updates** | *Not implemented* | Target: Inngest step | Fast (<50ms per DB call) | DB status transitions (`PENDING` -> `EXTRACTING` -> `INDEXING` -> `READY` / `FAILED`) need to be invoked at step boundaries. |

> **Critical Note:** Currently, **no slow operations are running inside HTTP requests because none of the indexing pipeline has been wired up yet.** When building the upload flow, PDF extraction, OCR, embedding, and Pinecone upserts must be scheduled as an Inngest background event (`inngest.send({ name: "document.uploaded", data: ... })`) from the upload route rather than awaited in-process.

---

## 4. Prisma Schema

### Full Current `prisma/schema.prisma`

```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

// Get a free hosted Postgres database in seconds: `npx create-db`

generator client {
  provider = "prisma-client"
  output   = "../lib/generated/prisma"
}

datasource db {
  provider = "postgresql"
}

model User {
  id            String    @id
  name          String
  email         String
  emailVerified Boolean   @default(false)
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  sessions      Session[]
  accounts      Account[]

  @@unique([email])
  @@map("user")
}

model Session {
  id        String   @id
  expiresAt DateTime
  token     String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  ipAddress String?
  userAgent String?
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([token])
  @@index([userId])
  @@map("session")
}

model Account {
  id                    String    @id
  accountId             String
  providerId            String
  userId                String
  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  accessToken           String?
  refreshToken          String?
  idToken               String?
  accessTokenExpiresAt  DateTime?
  refreshTokenExpiresAt DateTime?
  scope                 String?
  password              String?
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt

  @@index([userId])
  @@map("account")
}

model Verification {
  id         String   @id
  identifier String
  value      String
  expiresAt  DateTime
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@index([identifier])
  @@map("verification")
}
```

### Model Classification
- **Models for Better Auth**:
  - `User`: Core user profile and identity.
  - `Session`: Active user sessions and tokens.
  - `Account`: OAuth provider links (Google, GitHub) and credentials.
  - `Verification`: Token verification for auth flows.
- **Models for Documents or Indexing**:
  - ❌ **NONE**. (No `Document`, `Chunk`, `Page`, or `Policy` models exist).
- **Chat, Conversation, or Message Tables**:
  - ❌ **NONE**. Neither `Chat`, `Conversation`, `Thread`, nor `Message` models exist. *(Note: shadcn UI presentation components exist in `components/ui/message.tsx` and `components/ui/message-scroller.tsx`, but no database schema exists).*

---

## 5. Code Quality Check

### 1. Files doing multiple jobs or exceeding ~150 lines

| File | Line Count | Architectural Responsibility & Issues |
| :--- | :--- | :--- |
| `app/page.tsx` | **494 lines** | Monolithic landing page combining Hero telemetry benchmarks, 4-step workflow, inspection preview, 4 feature breakdowns, security statements, and CTA buttons into one giant client component. |
| `components/drafting/pipeline-flow.tsx` | **235 lines** | Interactive 6-stage RAG visualizer; mixes timer loops, state management, and mock telemetry data into one presentation component. |
| `app/login/login-form.tsx` | **177 lines** | Combines OAuth dispatch, error parsing, inline SVGs for Google/GitHub icons, redirect handling, and loading state. |
| *Large shadcn UI components (>150 lines)* | | |
| `components/ui/sidebar.tsx` | 674 lines | Multi-part collapsible navigation layout |
| `components/ui/chart.tsx` | 336 lines | Recharts wrappers |
| `components/ui/questionnaire.tsx` | 306 lines | Multi-step form primitives |
| `components/ui/combobox.tsx` | 277 lines | Autocomplete combobox |
| `components/ui/menubar.tsx` | 261 lines | Application menu bar |
| `components/ui/context-menu.tsx` | 253 lines | Context menu primitive |
| `components/ui/dropdown-menu.tsx` | 250 lines | Radix dropdown menu |
| `components/ui/code-block.tsx` | 232 lines | Code block formatting |
| `components/ui/field.tsx` | 218 lines | Form field wrappers |
| `components/ui/carousel.tsx` | 215 lines | Embla carousel wrapper |
| `components/ui/calendar.tsx` | 211 lines | Date picker calendar |
| `components/ui/toast.tsx` | 209 lines | Notification toasts |
| `components/ui/drawer.tsx` | 207 lines | Bottom sheet drawer |
| `components/ui/attachment.tsx` | 194 lines | File attachment display |
| `components/ui/select.tsx` | 188 lines | Custom select |
| `components/ui/item.tsx` | 187 lines | List item display |
| `components/ui/command.tsx` | 184 lines | Command palette |
| `components/ui/alert-dialog.tsx` | 172 lines | Modal alerts |
| `components/ui/navigation-menu.tsx` | 157 lines | Navbar navigation menu |
| `components/ui/trace.tsx` | 152 lines | Execution trace visualizer |

### 2. Type Safety, Error Handling & Logging
- **`any` types**: There are no explicit `: any` or `as any` annotations in the custom codebase.
- **Swallowed Errors**:
  - In `hooks/use-highlighted-code.ts` line 23: `.catch(() => {})` silently swallows Shiki language loading errors.
- **Missing Error Handling**:
  - In `auth/auth.ts` lines 12–19: Non-null assertions `process.env.GOOGLE_CLIENT_ID!` and `process.env.GITHUB_CLIENT_ID!` will throw runtime errors on server startup if OAuth env variables are unset.
- **Document Contents Logging**:
  - No `console.log` statements exist in the codebase. Document contents are not logged anywhere.

### 3. Duplicated Logic & Hardcoded Values
- **Hardcoded RAG Telemetry & Metadata**:
  - In `components/drafting/pipeline-flow.tsx`: Hardcoded mock document names (`"acme_global_handbook_2026.pdf (142 pages)"`), dimensions (`"1536-dim semantic representation"`), accuracy metrics (`"Top-5 precision @ 99.4%"`), and tenant IDs (`"tenant_usr_981a"`).
  - In `components/drafting/policy-viewer-sketch.tsx`: Hardcoded sample PDF excerpt (`"acme_infosec_handbook_v4.pdf"`, `"Policy Rule #SEC-08"`, `"Line 042 | Section 3.2"`, `"300s Inactivity"`).
- **Hardcoded Query / UI Parameters**:
  - In `lib/query-client.ts`: `staleTime: 60_000`, `retry: 1`.
  - In `hooks/use-mobile.ts`: `MOBILE_BREAKPOINT = 768`.
  - In `inngest/client.ts`: App ID `"ai-pitch"`.

### 4. Missing Tests
- **Zero test suites**: There is no testing framework installed (`vitest`, `jest`, `playwright`, or `cypress` are absent).
- No `*.test.ts`, `*.test.tsx`, `*.spec.ts`, or `__tests__` folders exist in the project.
- `package.json` contains no `"test"` script.

---

## 6. Environment and Setup

### Expected Environment Variables

| Variable Name | Present in `.env` | Present in `.env.example` | Where Referenced in Code |
| :--- | :---: | :---: | :--- |
| `DATABASE_URL` |  Yes |  Yes | `lib/prisma.ts`, `prisma7.config.ts` |
| `BETTER_AUTH_SECRET` |  Yes |  Yes | `auth/auth.ts` |
| `BETTER_AUTH_URL` |  Yes |  Yes | `auth/auth.ts` |
| `NEXT_PUBLIC_BETTER_AUTH_URL` | ❌ Missing |  Yes | `lib/auth-client.ts` |
| `GOOGLE_CLIENT_ID` | ❌ Missing |  Yes | `auth/auth.ts` |
| `GOOGLE_CLIENT_SECRET` | ❌ Missing |  Yes | `auth/auth.ts` |
| `GITHUB_CLIENT_ID` | ❌ Missing |  Yes | `auth/auth.ts` |
| `GITHUB_CLIENT_SECRET` | ❌ Missing |  Yes | `auth/auth.ts` |
| `INNGEST_DEV` |  Yes | ❌ Missing | Inngest CLI internal flag |
| `PINECONE_API_KEY` | ❌ Missing | ❌ Missing | *Not yet referenced (Pinecone not set up)* |
| `PINECONE_INDEX` | ❌ Missing | ❌ Missing | *Not yet referenced* |
| `OPENAI_API_KEY` | ❌ Missing | ❌ Missing | *Not yet referenced* |

### Inngest Dev Server & `/api/inngest` Route Status
- **How Inngest dev server is run**:
  - There is currently **no script** in `package.json` for running Inngest.
  - The standard way to run it is `pnpm dlx inngest-cli@latest dev -u http://localhost:3000/api/inngest` (or `npx inngest-cli@latest dev`).
- **Does `/api/inngest` work?**:
  - ❌ **NO**. The file `app/api/inngest/route.ts` **does not exist**.
  - Inngest dev server requires a served endpoint exposing `GET`, `POST`, and `PUT` via `serve({ client: inngest, functions })`. Calling `/api/inngest` right now will return a **404 Not Found**.
  - Furthermore, `inngest/index.ts` exports an empty array (`functions = []`), so even if served, Inngest would register 0 functions.

---

## 7. What Works and What is Broken

### 1. What Has Been Tested and Confirmed Working
- **Marketing Landing Page & Interactive UI Sketches**:
  - The Family.co-style design system, dark/light theme toggle, dashed borders, and animated UI mockup components (`PipelineFlow`, `PolicyViewerSketch`) render in the browser.
- **Database Connection & Auth Migration**:
  - Prisma connection adapter with PostgreSQL is verified. The initial migration `20261116161332_add_better_auth` has been executed.
- **Better Auth Core Handler**:
  - `app/api/auth/[...all]/route.ts` is wired to Better Auth.

> **Clarification:** **OCR reading documents has NOT been built or executed in the backend.** The `"OCR 100%"` and `"acme_infosec_handbook_v4.pdf"` labels on the home screen are purely hardcoded SVG/React presentation elements. Neither `tesseract.js` nor file upload routes exist yet.

### 2. Errors, TODOs, and Commented-Out Code
- **TODOs in Code**:
  - `app/login/login-form.tsx` line 18: `// TODO: redirect to /dashboard once built`
  - `app/login/login-form.tsx` line 28: `// TODO: redirect to /dashboard once built`
- **Typos in Comments / Stubs**:
  - `inngest/functions/indexing.ts` line 1: `//this file hs all the steps of indexing` (stub placeholder).
  - `inngest/functions/query.ts` line 1: `// this file has all the steps of querying the database and returning the results` (stub placeholder).
- **Missing OAuth Credentials in Local `.env`**:
  - `auth/auth.ts` requires Google and GitHub credentials. Without them in `.env`, triggering login fails.

### 3. Half-Finished Items
1. **Inngest Setup**: The client is instantiated in `inngest/client.ts`, but the Next.js API route (`app/api/inngest/route.ts`) is missing, and the function files are empty comments.
2. **Authentication Flow**: Login page exists with social buttons, but redirects to `/` because the dashboard route does not exist.
3. **Database Schema**: Only Better Auth tables exist; no document, page, chunk, or status tracking models exist in `prisma/schema.prisma`.
4. **Entire Indexing Pipeline**: Upload, file validation, text extraction, page rendering, OCR, chunking, embeddings, and Pinecone synchronization are 0% implemented in code.
