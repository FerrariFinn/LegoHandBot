# LegoHandBot

A chatbot for the **Legohandgesetzbuch (LHGB)** — a fictional body of law governing the "Lego hand" gesture: whoever spots someone forming the C-shaped Lego-minifigure hand is legally obligated to bring them a beer. The bot plays it completely straight, answering like a lawyer who has genuinely dedicated their career to this.

It's a full TypeScript stack (React + Express + Gemini) built around that joke premise, used as a hands-on project for LLM pipeline design, streaming, auth, and rate limiting.

## How it works

- **Two chat modes**: "Frage stellen" (ask what a paragraph says) and "Fall lösen" (work through a fact pattern in classic legal-memo/Gutachtenstil), plus a static "LHGB" tab showing the full statute text.
- The backend loads the LHGB text (from private Supabase Storage) and passes it in full as the Gemini system instruction — a long-context "baseline" pipeline rather than retrieval/RAG.
- Every query first passes a lightweight relevance check (a cheaper Gemini model) — off-topic questions get a canned refusal instead of paying for a full generation call.
- Answers stream to the browser token-by-token over SSE.
- Supabase Auth gates every request, and a Postgres-backed atomic rate limiter caps each user to 5 requests/hour.

## Stack

- **Backend**: Node/Express + TypeScript, `@google/genai` (Gemini) SDK, Supabase (auth, Postgres, storage)
- **Frontend**: React + Vite + Tailwind
- **shared-types**: pipeline/context types shared by both sides
- Yarn workspaces monorepo

## Project layout

```
backend/
  src/
    index.ts              Express app: CORS, routes
    apiHandlers.ts        /api/chat (SSE) and /api/lhgb handlers
    pipelineController.ts runs an ordered array of pipeline steps
    pipelineSteps.ts      relevance check -> load LHGB text -> generate answer
    prompts.ts            system prompts per mode + relevance-check prompt
    lib/
      gemini.ts             Gemini SDK wrapper (generateText / generateTextStream)
      gesetzbuchLoader.ts    loads + caches the LHGB text from Supabase Storage
      requireAuth.ts         Supabase-token auth middleware
      chatRateLimit.ts       hourly per-user rate limit (Postgres RPC)
      sse.ts                 SSE response helper
      supabaseClient.ts      anon + per-user Supabase clients
  sql/                     Supabase SQL to apply by hand (RLS policy, rate-limit RPC)
frontend/
  src/
    App.tsx, chatController.ts, chatState.ts  chat orchestration
    streamClient.ts         fetch + SSE frame parsing
    components/             ChatWindow, ModeSwitcher, LhgbView, LoginPage, ...
shared-types/
  src/types.ts             PipelineContext, ChatMode, ChatStreamEvent, ...
```

## Setup

Prerequisites: Node 18+, Yarn, a Supabase project, and a Gemini API key ([Google AI Studio](https://aistudio.google.com)).

1. Install dependencies at the repo root (workspaces install everything):
   ```
   yarn install
   ```
2. Create `backend/.env`:
   ```
   GEMINI_API_KEY=...
   GEMINI_MODEL=gemini-2.5-flash
   GEMINI_MODEL_LIGHT=gemini-2.5-flash-lite
   SupabaseURL=...
   SupabaseKey=...
   FRONTEND_URL=http://localhost:5173
   ```
3. Create `frontend/.env`:
   ```
   VITE_SUPABASE_URL=...
   VITE_SUPABASE_ANON_KEY=...
   ```
4. In the Supabase SQL editor, run `backend/sql/rate_limit.sql` and `backend/sql/gesetzbuch_storage_policy.sql` (top to bottom, once each). Then create a **private** Storage bucket named `LegohandGesetzbuch` and upload the statute text as `Legohand_Gesetzbuch_Camping.md`.
5. Start everything:
   ```
   yarn dev
   ```
   This runs the backend on port 3001 and the frontend on port 5173 (which proxies `/api` to the backend) concurrently.

## Deployment

Both `backend` and `frontend` expose a `start` script (Express server / `serve -s dist`), sized for a platform like Render's free tier: set the same env vars in the dashboard, plus `VITE_API_URL` on the frontend build so its static host knows where to reach the backend once it's no longer running behind Vite's dev proxy.

## Notes

- Generation and the relevance check run on the Gemini free tier — inputs may be used for training under that tier, so don't reuse this key/setup for anything containing real data.
- This is currently the "baseline" pipeline (the whole statute in context on every call) rather than a chunked/retrieval pipeline — reasonable for a ~40-page fictional statute, and deliberately the simpler option for a project this size.
