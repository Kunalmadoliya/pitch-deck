# Environment Variables Reference (`ENV_TEMPLATE.md`)

This file documents all environment variables required by the Company Policy Reader application across local development and production.

> [!NOTE]
> Never commit actual secret values into git. Store your secrets locally in `.env` (which is git-ignored).

---

## Complete `.env` Template

Copy and paste this into your local `.env` file and replace the placeholder values:

```bash
# ==========================================
# 1. DATABASE (PostgreSQL / Neon)
# ==========================================
# Connection string for PostgreSQL database
DATABASE_URL="postgresql://user:password@host:5432/neondb?sslmode=require"

# ==========================================
# 2. BETTER AUTH & SSO
# ==========================================
# 32+ character random secret for signing tokens (generate with `openssl rand -hex 32`)
BETTER_AUTH_SECRET="replace-with-a-long-random-secret"

# Canonical app URLs
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_BETTER_AUTH_URL="http://localhost:3000"

# Google OAuth Credentials (from Google Cloud Console)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# GitHub OAuth Credentials (from GitHub Developer Settings)
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# ==========================================
# 3. INNGEST (Background Jobs)
# ==========================================
# Tells Inngest client to connect to local dev server
INNGEST_DEV=1

# Production Inngest keys (optional in local development)
# INNGEST_SIGNING_KEY="signkey-..."
# INNGEST_EVENT_KEY="eventkey-..."

# ==========================================
# 4. PINECONE (Vector Database)
# ==========================================
# Pinecone API key (from Pinecone Console)
PINECONE_API_KEY="your-pinecone-api-key"

# The name of your Pinecone vector index (1536 dimensions, cosine distance)
PINECONE_INDEX="your-pinecone-index-name"

# ==========================================
# 5. OPENAI (Embeddings)
# ==========================================
# OpenAI API key for text-embedding-3-small embeddings
OPENAI_API_KEY="sk-proj-..."

# ==========================================
# 6. IMAGEKIT (Media & Cloud File Storage)
# ==========================================
# Credentials from ImageKit Developer Dashboard
IMAGEKIT_PUBLIC_KEY="public_..."
IMAGEKIT_PRIVATE_KEY="private_..."
IMAGEKIT_URL_ENDPOINT="https://ik.imagekit.io/your_imagekit_id"
IMAGEKIT_ID="your_imagekit_id"

# ==========================================
# 7. INDEXING PIPELINE CONFIGURATION (Optional Defaults)
# ==========================================
# Local upload directory path (default: uploads)
UPLOAD_DIR="uploads"

# Tesseract OCR language code (default: eng)
OCR_LANG="eng"

# Number of PDF pages processed per Inngest background step (default: 10)
PAGE_BATCH_SIZE=10

# Tesseract workers kept alive and reused for OCR (default: CPU cores - 1, max 4)
OCR_WORKERS=

# Scale used to draw scanned PDF pages for OCR (default: 2; lower is faster but may miss tiny text)
PDF_RENDER_SCALE=2

# Character length threshold below which a PDF page triggers OCR (default: 50)
OCR_TEXT_THRESHOLD=50

# LangChain RecursiveCharacterTextSplitter chunk size (default: 1000)
CHUNK_SIZE=1000

# LangChain RecursiveCharacterTextSplitter chunk overlap (default: 150)
CHUNK_OVERLAP=150
```

---

## Variable Details & Specifications

| Variable Name | Required? | Default (if unset) | Purpose / Description |
| :--- | :---: | :---: | :--- |
| `DATABASE_URL` | **Yes** | — | PostgreSQL connection string for Prisma ORM (used with `@prisma/adapter-pg`). |
| `BETTER_AUTH_SECRET` | **Yes** | — | Encryption key for Better Auth session cookies and tokens. |
| `BETTER_AUTH_URL` | **Yes** | — | Base URL of the server (e.g. `http://localhost:3000`). |
| `NEXT_PUBLIC_BETTER_AUTH_URL` | **Yes** | — | Client-side accessible base URL for `createAuthClient`. |
| `GOOGLE_CLIENT_ID` | **Yes** | — | OAuth Client ID for Google Workspace / Gmail login. |
| `GOOGLE_CLIENT_SECRET` | **Yes** | — | OAuth Client Secret for Google login. |
| `GITHUB_CLIENT_ID` | **Yes** | — | OAuth Client ID for GitHub login. |
| `GITHUB_CLIENT_SECRET` | **Yes** | — | OAuth Client Secret for GitHub login. |
| `INNGEST_DEV` | No | `1` | Forces Inngest SDK to communicate with local Inngest Dev Server. |
| `PINECONE_API_KEY` | **Yes** (for indexing) | — | API key to authenticate with Pinecone serverless vector database. |
| `PINECONE_INDEX` | **Yes** (for indexing) | — | Name of the Pinecone index configured for 1536-dimension vectors. |
| `OPENAI_API_KEY` | **Yes** (for indexing) | — | API key used by `modules/indexing/embeddings/embedder.ts` for `text-embedding-3-small`. |
| `IMAGEKIT_PUBLIC_KEY` | **Yes** (for ImageKit) | — | Public key for client-side authentication and ImageKit URL generation. |
| `IMAGEKIT_PRIVATE_KEY` | **Yes** (for ImageKit) | — | Private key for server-side upload and deletion. |
| `IMAGEKIT_URL_ENDPOINT` | **Yes** (for ImageKit) | — | Base CDN endpoint URL (e.g. `https://ik.imagekit.io/<id>`). |
| `IMAGEKIT_ID` | No | — | ImageKit account identifier. |
| `UPLOAD_DIR` | No | `uploads` | Local folder where uploaded files are saved before background processing. |
| `OCR_LANG` | No | `eng` | Tesseract language training model to load for OCR recognition. |
| `PAGE_BATCH_SIZE` | No | `10` | Pages grouped into each Inngest step (prevents serverless function timeouts). Pages inside a step run in parallel. |
| `OCR_WORKERS` | No | CPU cores - 1 (1–4) | Tesseract workers started once and reused for every OCR page. |
| `PDF_RENDER_SCALE` | No | `2` | Render scale for scanned PDF pages before OCR. Lower is faster but less accurate on small text. |
| `OCR_TEXT_THRESHOLD` | No | `50` | If extracted text layer contains fewer than this many characters, page is treated as scanned and processed with OCR. |
| `CHUNK_SIZE` | No | `1000` | Target chunk size for LangChain text splitter. |
| `CHUNK_OVERLAP` | No | `150` | Character overlap between consecutive chunks to maintain semantic context. |
