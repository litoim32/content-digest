# ADR 002 — Multiple views via state, not a router

## Status

Accepted (Feature 010 — Content Digest).

## Context

Until now the app was a single view (`CryptoDashboard`) mounted directly in
`App`. Feature 010 adds a second, unrelated view (`ContentDigest`). We need a way
for the user to switch between them. Options considered:

1. **A client-side router** (e.g. `react-router`) with `/` and `/digest` routes.
2. **A view value held in `App` state**, toggled by header buttons.
3. Separate HTML entry points / separate apps.

A router adds a runtime dependency (needs an ADR by itself), URL/history
handling, and structure we don't otherwise need for two flat views. The existing
codebase already swaps UI via state (e.g. the `selected` coin opening
`CoinChartModal`).

## Decision

Hold the active view in `App` state (`type View = 'digest' | 'crypto'`) and render
the matching component. A small pill nav in the header switches it; buttons carry
`aria-pressed` for accessibility. The default view is **Digest** (the feature this
release is about); the **Crypto** dashboard remains reachable and unchanged.

No router, no new dependency, no URL routing.

## Consequences

- **Positive:** Zero new dependencies; matches the existing "swap via state"
  pattern; trivial to add a third view later (extend the union + add a tab).
- **Negative:** Views are not deep-linkable or back/forward-navigable. If/when
  shareable URLs are needed, revisit with a router (new ADR).
- **Neutral:** Each view stays a self-contained component (`CryptoDashboard`,
  `ContentDigest`); `App` only owns the toggle.
