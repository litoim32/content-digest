# Retrospective 010 — Content Digest

## What we did

Added a second view, **Content Digest**: paste an article's text (and optional
URL) → a local, deterministic "AI" produces a **summary**, **key points**, and
**tags**, and **suggests a category** → the result lands as a **card on a board
grouped into topic sections**. A header pill nav switches between **Digest**
(default) and the existing **Crypto** dashboard, which is unchanged.

Pure, unit-tested logic under `app/src/digest/`:
- `text.ts` — `tokenize` (Unicode/Cyrillic-aware) + uk/en `STOPWORDS`.
- `extract.ts` — `htmlToText` / `decodeEntities`.
- `digest.ts` — `summarize` (extractive, frequency-scored) + `splitSentences` +
  `deriveTitle`.
- `board.ts` — `CATEGORIES` taxonomy + keyword `suggestCategory`,
  `groupByCategory`, `sortCards`, `serializeCards`/`parseCards`.

Presentational components `AddDigestForm` + `DigestBoard`, a `ContentDigest`
container owning state + `localStorage`, and a dev-only Vite middleware
(`/api/extract`) for true "paste a link → fetch text" while developing.

## What worked

- **Spec/ADR-first paid off on the load-bearing forks.** Three real
  constraints/architecture choices each got an ADR: view switching without a
  router (002), `localStorage` persistence amending the "no persistence"
  constraint (003), and the dev-only extract middleware that keeps the
  frontend-only rule intact (004).
- **Pure/presentational split held cleanly.** Everything decision-making is pure
  and tested (40 new tests); components only render; clock/id/network live at the
  impure edges (`ContentDigest`, `AddDigestForm`, the middleware). `summarize` and
  friends are clock-free and deterministic, so specs are simple.
- **Reusing `htmlToText` in both the (future) client and the dev middleware** meant
  the extraction logic is tested once and the middleware is a thin transport shell.
- Matched house theme by reusing `index.css` tokens + the crypto palette; no new
  deps; strict TS stayed on; `tsc -b` + `eslint .` clean.

## What didn't / friction points

- **CORS makes pure client-side "fetch any URL" impossible** — surfaced up front
  and handled with manual-paste as the always-works path plus a dev-only
  server-side fetch. Auto-fetch does not exist in `build`/`preview`; the form
  degrades with a hint.
- **Heuristic category keywords are prefix-matched**, which risks false positives
  from short/common stems (`art`→`article`, `гол`→`голова`, `рак`→`ракета`).
  Mitigated by dropping risky stems and preferring ≥4-char stems; still approximate
  by design.
- **Preview MCP was flaky here**: `preview_start` succeeded but follow-up
  `screenshot`/`fill` reported "no running servers for this workspace" (server not
  retained between calls). Fell back to headless verification — `npm run dev` root
  returned HTTP 200 and `/api/extract` returned real extracted text + correct 400s
  on bad input — consistent with prior retros treating visual checks as a human
  step.

## Decisions to carry forward

- For any "AI"/LLM feature, keep a **pure summarizer seam** (local heuristic now,
  Claude API adapter later through the same dev endpoint with the key server-side).
- When a feature needs the network or persistence, **state the constraint conflict
  and resolve it with an ADR** rather than silently adding infra.

## Changes made to CLAUDE.md / constraints / working agreement

- `constraints.md`: amended "No backend or database" to allow client-side
  `localStorage` (ADR 003); clarified that uk/en word lists are content processing,
  not UI i18n.
- `CLAUDE.md`: updated "Current state", added the Feature 010 doc, ADRs 002–004, and
  this retro to the Documentation / Self-improvement links.

## Open questions for next session

- Phase 2: real Claude-API summaries via the dev middleware (`ANTHROPIC_API_KEY`),
  which needs the Anthropic SDK + an ADR.
- A small DOM-testing layer (RTL) would let us assert the add→card→persist flow that
  is currently only verified by hand (would start with an ADR).
- Still worth a `.gitattributes` (`* text=auto eol=lf`) to silence CRLF warnings
  (carried from retros 001–009).
