# Spur – AI Live Chat Agent

## Quick Start

### Prerequisites
- Node.js 22+ (required for the built-in `node:sqlite` module)
- An OpenAI API key

### 1. Clone & install dependencies

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 2. Configure environment

```bash
cp backend/.env.example backend/.env
```

Open `backend/.env` and fill in your `OPENAI_API_KEY`.

### 3. Run the backend

```bash
cd backend && npm run dev
```

Starts on port 3001. SQLite database is created automatically at `backend/data/chat.db`.

### 4. Run the frontend

```bash
cd frontend && npm run dev
```

Starts on port 5173.

### 5. Open the app

```
http://localhost:5173
```

---

## Architecture Overview

### Backend layers (strict separation of concerns)

- **routes/chat.ts** — HTTP only. Parses requests, calls services, sends responses. Zero business logic.
- **services/conversationService.ts** — conversation lookup and creation.
- **services/messageService.ts** — message persistence and retrieval.
- **services/llmService.ts** — the only file that talks to OpenAI. Exposes one function: `generateReply(history, userMessage)`. To swap in Claude or Gemini, replace only this file.
- **db/index.ts** — opens SQLite via Node's built-in `node:sqlite`, runs migrations on startup. No ORM.

### Why this structure makes multi-channel extension easy

Adding a WhatsApp or Instagram channel means: add a new route file, reuse the existing services unchanged. The LLM, persistence, and business logic layers are completely channel-agnostic.

---

## LLM Notes

- **Provider:** OpenAI `gpt-4o-mini`
- **History window:** last 10 messages sent per request (cost control). Full history is still stored in the DB and shown in the UI.
- **System prompt:** hardcoded in `llmService.ts` — defines Nova Store persona, shipping policy, return policy, and support hours.
- **Max tokens per reply:** 500

---

## Trade-offs & If I had more time…

- **No streaming:** OpenAI streaming (SSE) would reduce perceived latency. The typing indicator covers this UX gap for now.
- **SQLite not PostgreSQL:** fine for single-instance deployment. Switching to Postgres means replacing `node:sqlite` in `db/index.ts` and making the service calls async.
- **node:sqlite over better-sqlite3:** `better-sqlite3` requires native C++ compilation which fails without Visual Studio Build Tools on Windows. Switched to Node's built-in `node:sqlite` (v22+) — zero compilation, identical synchronous API.
- **No message queue:** a production system would queue LLM calls to handle traffic spikes. Redis + BullMQ would slot in at the route layer.
- **Session via localStorage:** a real product would use signed cookies or JWT. localStorage is fine for a demo with no auth requirement.
- **No rate limiting:** `express-rate-limit` on `POST /chat/message` would prevent abuse. Left out per scope constraints.
