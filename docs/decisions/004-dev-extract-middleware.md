# ADR 004 — Dev-only article extraction middleware

## Status

Accepted (Feature 010 — Content Digest).

## Context

The Content Digest pitch is "paste a **link** → the app gets the text". Fetching an
arbitrary article URL from the **browser** is blocked by CORS, so a purely
client-side auto-fetch is impossible. The frontend-only constraint
(`docs/constraints.md`) rules out a standing production backend.

We still want the convenient "paste a link, get the text" experience during local
development, without a separate server process or a new runtime dependency.

## Decision

Add a **dev-only Vite middleware** as a plugin in `app/vite.config.ts`
(`devExtractMiddleware`), registered via `configureServer`. It exposes
`GET /api/extract?url=<article>`: it fetches the page **server-side** (Node, no
CORS), runs the pure `htmlToText` from `app/src/digest/extract.ts`, and returns
`{ text }`. It validates the URL and only allows `http:`/`https:`.

Because it is registered through `configureServer`, it exists **only on the dev
server** — it is absent in `vite build` / `vite preview`. The form
(`AddDigestForm`) calls it opportunistically and **degrades gracefully** to manual
paste (with a hint) when the call fails, so production builds and tests are
unaffected. The text-extraction logic is the pure, unit-tested `htmlToText`; the
middleware is a thin transport wrapper around it.

This is **not** the "no backend" exception for production: there is still no
production server and no database. It is a developer-convenience endpoint on the
Vite dev server only.

## Consequences

- **Positive:** True "paste a link" UX while developing; no new dependency (uses
  Node's global `fetch` and Vite's built-in connect server); extraction logic stays
  pure and tested; production build is unchanged and still works via manual paste.
- **Negative:** Auto-fetch does not work in `preview` or a deployed static build —
  users paste text there. Server-side extraction is best-effort (no JS execution,
  no site-specific readability), so some pages extract poorly.
- **Neutral:** If production auto-fetch is ever required, it becomes a real backend
  feature with its own requirements doc + ADR (and likely an LLM/extraction
  service). A future Claude-API summarizer could be served through the same dev
  endpoint pattern, keeping the key server-side.
