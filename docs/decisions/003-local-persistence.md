# ADR 003 — Client-side persistence via `localStorage`

## Status

Accepted (Feature 010 — Content Digest). Amends the "no persistence" constraint.

## Context

`docs/constraints.md` states: *"No backend or database. Frontend-only. Any future
persistence starts with a requirements doc and an ADR."* Feature 010's board is
only useful if digested cards **survive a page reload** — a digest you lose on
refresh is pointless. This is the "requirements doc + ADR" that constraint asks
for (the requirements doc is `feature-010-content-digest.md`).

We need persistence that requires **no backend, no database, and no new
dependency**, consistent with the frontend-only constraint and this machine's
no-admin environment.

## Decision

Persist the digest board in the browser's **`localStorage`** under a single
versioned key (`content-digest.cards.v1`):

- `ContentDigest` loads cards once via a lazy `useState` initializer and writes the
  full list on every change in a `useEffect`.
- Serialization lives in pure, unit-tested helpers in `app/src/digest/board.ts`:
  `serializeCards` (JSON) and `parseCards` (guarded — validates each entry, drops
  malformed ones, never throws, returns `[]` on bad/empty input).
- All `localStorage` access is wrapped in `try/catch`: if storage is unavailable
  or full (private mode, quota), the board still works for the session; it just
  isn't persisted.

This is **client-side only** — there is still no server, no database, and no
network storage. The frontend-only constraint stands; only the blanket
"no persistence" is relaxed to "localStorage is allowed".

## Consequences

- **Positive:** Cards survive reloads with zero infrastructure and zero deps;
  parsing is defensive and unit-tested; the versioned key allows a future schema
  migration.
- **Negative:** Data is per-browser/per-origin and not shared across devices or
  users; clearing site data wipes it. Acceptable for an internal single-user tool.
- **Neutral:** If cross-device sync is ever needed, that is a backend feature and
  starts with its own requirements doc + ADR.
