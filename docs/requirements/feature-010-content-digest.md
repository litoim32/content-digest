# Feature 010 — Content Digest

## User story

As an internal user, I want to paste a **link to an article** (and its text), have
the app produce a short **summary**, **key points**, and **tags**, and **suggest a
category**, so the result lands as a **card on a board grouped into topic sections**
that I can come back to later.

## Scope & key decisions

- This is a **second view** in the app, alongside the Crypto Dashboard. A small
  top-of-page toggle switches between **Crypto** and **Digest** (no router — view
  held in `App` state). See [ADR 002](../decisions/002-view-toggle.md).
- **"AI" is a local, offline, deterministic heuristic** (no API key, no network),
  implemented as pure logic so it is unit-tested in house style. A `Summarizer`
  seam allows a real Claude API adapter to drop in later (Phase 2, not built now).
- **Text input is pasted by the user.** Pure client-side fetching of an arbitrary
  article URL is blocked by CORS, so the **URL is stored as the card's source link**
  and the **article text is pasted** into a textarea. An *optional* dev-only
  auto-fetch (Vite middleware) is a graceful enhancement that degrades to manual
  paste when absent (production build / tests). See
  [ADR 004](../decisions/004-dev-extract-middleware.md).
- Cards **persist in `localStorage`** so the board survives reloads. This amends the
  "no persistence" constraint for **client-side localStorage only** — see
  [ADR 003](../decisions/003-local-persistence.md). No backend, no database.
- The **uk + en** stopword/keyword lists are for **content processing only** (the
  RSS source is `pravda.com.ua`); the **UI stays English** — this is not UI i18n.

## Acceptance criteria

- GIVEN the Digest view and a pasted article text (and optional URL)
  WHEN I press **"Digest it"**
  THEN a new card appears showing a **summary** (2–3 sentences), **key points**
  (bullets), **tags** (pills), and a **suggested category** badge, linking to the
  URL when provided.
- GIVEN a created card
  WHEN it renders on the board
  THEN it sits under a **topic section matching its category**; sections appear in a
  fixed order and only non-empty sections show.
- GIVEN a card's suggested category
  WHEN I change it via the card's **category dropdown**
  THEN the card moves to the matching section.
- GIVEN existing cards
  WHEN I reload the page
  THEN the cards are **still present** (loaded from `localStorage`).
- GIVEN empty input text
  WHEN I press "Digest it"
  THEN nothing is added and the form stays usable (no crash, no empty card).
- The Crypto Dashboard remains reachable and unchanged via the view toggle.

## Pure logic (unit-tested, no DOM)

In `app/src/digest/`:
- `extract.ts` — `htmlToText(html)`: strip `<script>/<style>`/tags, decode common
  entities, collapse whitespace. (Reused by the optional dev middleware.)
- `digest.ts` — `summarize(text): DigestResult` with `{ summary, keyPoints[],
  tags[], category }`. Sentence splitting + word-frequency scoring with a uk+en
  stopword set; deterministic (no `Date`/`Math.random`).
- `board.ts` — `CATEGORIES` taxonomy + per-category keywords; `suggestCategory(text)`;
  `groupByCategory(cards)` → ordered non-empty `Section[]`; `sortCards` (newest-first,
  clock-free — `createdAt` passed in by caller); `serializeCards`/`parseCards`
  (guarded `localStorage` JSON).

Components are presentational and consume these helpers (working agreement rule 5 —
no DOM-testing layer added, so no RTL/ADR for testing).

## Out of scope

- Real Claude API summaries (Phase 2: dev middleware + `ANTHROPIC_API_KEY` + SDK + ADR).
- Production-grade readability extraction for arbitrary sites.
- Editing a card's generated summary/points/tags by hand; search; export.
- Auth, multi-user, server-side storage.

## Open questions

- None blocking. Quality of extractive summaries on very short or list-heavy text is
  acceptable for MVP; a real LLM adapter is the documented upgrade path.
