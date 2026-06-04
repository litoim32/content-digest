# Retrospective 005 — Auto-refresh

## What we did

Made the dashboard refresh itself every 60 seconds. The data model changed from
a single tagged-union `LoadState` to separate fields: `coins` (null until the
first success, then kept across refreshes), `lastUpdated`, `refreshing`, and
`refreshFailed`. A single effect runs an in-effect `load()` on mount and on a
`setInterval`, aborting the prior request each time and cleaning up (abort +
clear interval) on unmount. The UI gained a "Last updated HH:MM:SS" label, a
small CSS spinner shown only while refreshing, and a non-blocking
"refresh failed — showing last data" note. Time formatting (`formatClock`) was
added as a pure, unit-tested helper (18 tests total, +2).

## What worked

- Keeping previous `coins` in state and only replacing them on success means a
  refresh (or a failed refresh / 429) never blanks the screen — exactly the
  requirement.
- Because cards keep `key={coin.id}`, React reuses their DOM on refresh, so the
  Feature 003 entrance animation fires once on mount and the grid updates in
  place — no flicker, no re-animation.
- The earlier `set-state-in-effect` lint rule (hit in Feature 002) did **not**
  fire this time: `setRefreshing(true)` lives inside the nested `load()`
  function, not directly in the effect body.

## What didn't / friction points

- Had to be deliberate about the initial `refreshing` value (`true`) so the
  first paint shows the loading state without a synchronous setState in the
  effect body.
- Still cannot screenshot to confirm the spinner/label visually (launch.json /
  PATH limits from prior retros); verified via build + lint + 18 unit tests +
  dev-server 200. The 60s timing wasn't wall-clock tested — the interval value
  is a constant and the load path is the same one already exercised.

## Decisions to carry forward

- Prefer separate state fields over one union when "keep showing old data while
  loading new" is required — a union forces you to drop the old data to enter a
  loading state.

## Changes made to CLAUDE.md / constraints / working agreement

- `CLAUDE.md`: updated "Current state", added the Feature 005 doc link and this
  retro to the self-improvement log. No constraint/working-agreement changes.

## Open questions for next session

- Pause refresh when the tab is hidden (Page Visibility API) to be kind to the
  CoinGecko rate limit — would start with a requirements doc.
- The open chart modal does not refresh on the 60s timer (intentionally out of
  scope); revisit if users expect it to.
- Still worth a `.gitattributes` (`* text=auto eol=lf`) to silence CRLF warnings
  (carried from retros 001–004).
