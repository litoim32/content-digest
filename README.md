# Content Digest

Paste an article → get a short summary, key points, tags, and a suggested
category, organized as cards on a topic board.

This repository is being rebuilt toward the **v2 architecture** described in
[docs/PLAN.md](docs/PLAN.md) (Vite + React + TS frontend, FastAPI on Vercel,
Postgres, OpenRouter). See [docs/PRD.md](docs/PRD.md) for the product scope.

## Status

Issue #1 — frontend scaffold. A Vite + React + TypeScript shell with the app
header and an empty topic board. The add-article form and the live board follow in
the next issues.

## Getting started

```bash
npm install
npm run dev      # http://127.0.0.1:5173/
npm run build    # type-check (tsc -b) + production build
```

## Layout

```
src/            # Vite + React + TS frontend
  components/   # UI components (DigestBoard, …)
  App.tsx       # app shell
docs/           # PRD, PLAN, decisions/ (ADRs), retrospectives/
legacy/         # previous prototype (crypto dashboard + local-heuristic digest)
```

The previous prototype is preserved under [legacy/](legacy/) for reference.
