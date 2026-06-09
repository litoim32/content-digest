# PLAN — Content Digest (target architecture)

> Note: this is the **v2 target stack**. The current shipped MVP is deliberately
> frontend-only (local heuristic + `localStorage`). Adopting this plan introduces a
> backend, a database, and an external AI call — it **supersedes** the frontend-only
> stance in [ADR 003](decisions/003-local-persistence.md) and
> [ADR 004](decisions/004-dev-extract-middleware.md), so it needs a new ADR + a
> `constraints.md` update before building.

## Stack

- **Frontend:** Vite + React + TypeScript (static build).
- **Backend:** Python **FastAPI** as serverless functions under `/api`, deployed on
  **Vercel**.
- **Storage:** **Postgres** (Vercel Postgres / Neon), accessed from the API.
- **AI:** **OpenRouter** chat-completions for summary / key points / tags / category.

Data flow: browser → `/api/digest` (FastAPI) → OpenRouter for the digest, Postgres
for read/write → JSON back to the board.

## Folder structure

```
content-digest/
  api/                      # Python FastAPI on Vercel (serverless)
    index.py                # FastAPI app + routes (the Vercel entrypoint)
    digest.py               # OpenRouter call + prompt → structured digest
    db.py                   # Postgres connection + queries
    models.py               # request/response + row schemas
    requirements.txt        # fastapi, httpx, psycopg, pydantic
  src/                      # Vite + React + TS frontend
    components/             # AddDigestForm, DigestBoard, DigestCard
    lib/api.ts              # fetch wrappers for /api/*
    App.tsx
    main.tsx
  index.html
  package.json
  vite.config.ts
  vercel.json               # /api/* → python runtime; everything else → static dist
  .env.example              # OPENROUTER_API_KEY, DATABASE_URL (no real secrets)
  docs/                     # PRD.md, PLAN.md, decisions/
```

## Build steps (empty → MVP)

1. **Frontend shell.** Scaffold Vite + React + TS. Build the paste form (URL +
   text) and a topic-grouped board reading from in-memory state. No backend yet.
2. **AI endpoint.** Add FastAPI under `/api` with `POST /api/digest` that takes the
   article text, calls OpenRouter, and returns `{ summary, keyPoints, tags,
   category }`. Add `vercel.json` routing; point the frontend at it. Key lives in
   `OPENROUTER_API_KEY` (server-side only).
3. **Persistence.** Provision Postgres; create a `cards` table; implement `db.py`
   plus `POST /api/cards` (create), `GET /api/cards` (list), `DELETE /api/cards/{id}`,
   and `PATCH /api/cards/{id}` (category). Frontend loads/saves through these.
4. **Deploy.** Push to Vercel; set `OPENROUTER_API_KEY` and `DATABASE_URL` env vars;
   connect the Postgres instance; confirm the static build + `/api` both serve.
5. **MVP polish & verify.** Category override, newest-first grouping, loading/empty/
   error states; check against the PRD success criteria.

## Environment

- `OPENROUTER_API_KEY` — server-side only; never shipped to the browser.
- `DATABASE_URL` — Postgres connection string (Vercel/Neon).
- Documented in `.env.example`; real values live in Vercel project settings.
