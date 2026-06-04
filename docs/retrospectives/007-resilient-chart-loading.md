# Retrospective 007 — Resilient chart loading

## What we did

Diagnosed the user's "charts won't display" problem: the `markets` endpoint
returned 200 but `market_chart` returned HTTP 429 — CoinGecko's free tier
rate-limits the history endpoint, made worse by the 60s grid auto-refresh. Not a
rendering bug. Made the chart path resilient: introduced an `HttpError` carrying
the status, an in-memory per-session cache keyed by coin id, exponential-backoff
retries (`backoffMs`, pure + unit-tested) on 429 only, a rate-limit-specific
modal message, and an opt-in `VITE_COINGECKO_API_KEY` sent as the
`x-cg-demo-api-key` header (declared in `vite-env.d.ts`, documented in
`.env.example`). Keyless behaviour is unchanged when no key is set.

## What worked

- Diagnosing with `curl` against both endpoints pinpointed the cause quickly
  (200 vs 429) and proved it was external, not our code.
- Keeping the retry delay pure (`backoffMs`) made it unit-testable while the
  fetch/retry loop stayed a thin, untested adapter.
- The `crypto.ts → cryptoView.ts` import for `backoffMs` is safe: the reverse
  import is type-only (erased at runtime), so there is no runtime cycle — build
  confirmed.

## What didn't / friction points

- A sustained per-minute limit can still exhaust the ~7s of retries; the genuine
  fix for heavy use is a demo API key, which is why it's now opt-in via env.
- By the time the change was verified the limit had reset (chart endpoint back to
  200), so the retry/cache paths were reasoned through + build/lint/tested rather
  than observed failing live.

## Decisions to carry forward

- Carry HTTP status on errors (`HttpError`) so the UI can distinguish 429 from
  generic failures — useful pattern for any future external call.
- Cache immutable-ish external data (30-day history) per session to cut requests.

## Changes made to CLAUDE.md / constraints / working agreement

- `CLAUDE.md`: updated "Current state", added the Feature 007 doc link and this
  retro to the self-improvement log.
- `.env.example`: documented the optional `VITE_COINGECKO_API_KEY`. No constraint
  change — calling an external API with an optional key is still frontend-only.

## Open questions for next session

- If charts must be rock-solid, set a free demo key (or add a tiny serverless
  proxy — but that crosses the frontend-only constraint and would need an ADR).
- Still worth a `.gitattributes` (`* text=auto eol=lf`) to silence CRLF warnings
  (carried from retros 001–006).
