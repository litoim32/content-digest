# Feature 007 — Resilient chart loading

## Problem

The 30-day chart (Feature 004) frequently fails to display because CoinGecko's
free public API rate-limits the `market_chart` endpoint (HTTP 429), especially
now that the grid auto-refreshes every 60s (Feature 005). The grid (`markets`)
returns 200, but charts intermittently 429. The cause is external (rate limit),
not a rendering bug.

## User story

As an internal user, I want coin charts to load reliably despite the free-tier
rate limit, and to be told clearly when I'm being rate-limited rather than seeing
a generic failure.

## Acceptance criteria

- GIVEN a coin chart was loaded once this session
  WHEN I open that coin again
  THEN it shows instantly from an in-memory cache without a new request.
- GIVEN `market_chart` returns HTTP 429
  WHEN the modal fetches
  THEN it retries a few times with exponential backoff before giving up.
- GIVEN all retries still hit 429
  WHEN the modal gives up
  THEN it shows a **rate-limit-specific** message (mentioning the free-tier
  limit), not a generic error.
- GIVEN a `VITE_COINGECKO_API_KEY` is set in the environment
  WHEN any CoinGecko request is made
  THEN it is sent with the `x-cg-demo-api-key` header (higher limits). With no
  key set, behaviour is unchanged (keyless public API).

## Pure logic (unit-tested, no DOM)

In `app/src/crypto/cryptoView.ts`:
- `backoffMs(attempt)` → exponential delay (1000 · 2^attempt ms).

## Out of scope

- A server-side proxy or persistent cache.
- Caching the grid (`markets`) data.
- Retrying non-429 errors (those fail fast).

## Open questions

- None. A free CoinGecko demo key is the definitive fix for sustained limits;
  this feature makes the keyless path as robust as practical and makes the key
  opt-in via env.
