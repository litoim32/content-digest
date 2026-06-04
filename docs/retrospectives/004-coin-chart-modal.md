# Retrospective 004 — Coin chart modal

## What we did

Made coin cards clickable (mouse + keyboard, `role="button"`, Enter/Space) and
added `CoinChartModal`, which fetches 30 days of USD prices from CoinGecko's
`market_chart` endpoint and draws a **line chart as inline SVG** — no charting
library. The modal shows the coin name, the 30-day high and low, a close button,
a loading state, and a friendly error message; it closes on the button, the
backdrop, or Escape. The chart math — `priceRange` (high/low) and
`buildLinePath` (timestamp→x, inverted price→y, scaled into the SVG box) — was
extracted to the pure `cryptoView.ts` module and unit-tested (16 tests total,
+7).

## What worked

- Spec-first paid off on the chart geometry: writing `buildLinePath` tests first
  (rising line, flat range, single point, empty, padding) pinned the coordinate
  math before any SVG existed, so the visual layer was trivial — just feed the
  string to `<polyline points>`.
- Keeping all geometry pure meant the "no charting library" requirement cost
  nothing: a `<polyline>` plus ~40 lines of pure math.
- Reused existing helpers (`formatUsd`, `priceRange`) across grid and modal.

## What didn't / friction points

- **CoinGecko free tier returned HTTP 429** (rate limit) during verification,
  because the bootstrap + repeated test calls hit it often. This is exactly the
  modal's error path, so it surfaced the friendly message rather than breaking —
  but it means the chart may intermittently fail to load on the free tier. Noted
  as an open question.
- `points.at(0)/.at(-1)` return `T | undefined` under strict mode, so the trend
  (green/red line) needed a guard — handled with a default of "up".
- Live screenshot verification still unavailable (launch.json/PATH, per retros
  002–003); relied on green build + lint + 16 unit tests + endpoint reachability
  checks.

## Decisions to carry forward

- No new ADR or constraint change. "No charting library" was a per-feature
  requirement, already satisfied; if a future feature needs richer charts, that
  decision (library vs. hand-rolled SVG) would warrant an ADR.

## Changes made to CLAUDE.md / constraints / working agreement

- `CLAUDE.md`: updated "Current state", added the Feature 004 doc link and this
  retro to the self-improvement log. No constraint/working-agreement changes.

## Open questions for next session

- CoinGecko free-tier rate limits (429) affect both the grid and the chart. If
  this becomes painful, options (each starting with a requirements doc): a short
  client-side cache, a retry/backoff, or a demo API key. 
- Still worth a `.gitattributes` (`* text=auto eol=lf`) to silence CRLF warnings
  (carried from retros 001–003).
