# Retrospective 003 — Card & logo animations

## What we did

Added subtle CSS animations to the crypto dashboard: cards fade in and rise with
a staggered, per-card delay; cards lift on hover; coin logos float gently and
scale up on card hover. Moved the dashboard's static styling from inline objects
into a dedicated `CryptoDashboard.css` using class names, keeping only the
data-driven 24h-change colour inline. All motion is disabled under
`prefers-reduced-motion: reduce`.

## What worked

- Plain CSS keyframes + transitions covered everything — no animation library,
  so no new dependency or ADR.
- The per-card stagger uses a CSS custom property (`--enter-delay`) set inline
  from the map index, capped so later cards still appear promptly.
- Pure logic was untouched, so the 9 existing tests still pass; build and lint
  stayed green.

## What didn't / friction points

- TypeScript strict mode rejects a CSS custom property on `CSSProperties`, so the
  inline `{ '--enter-delay': ... }` object needed an explicit
  `as CSSProperties` cast. Minor, expected.
- Animations can't be meaningfully unit-tested and the Claude Preview screenshot
  path is still unavailable this session (launch.json/PATH constraints from retro
  002), so visual confirmation relies on the user's already-open browser plus a
  green build. Acceptable for a presentational change.

## Decisions to carry forward

- Keep static styling in CSS files with class names; reserve inline styles for
  data-driven values only (e.g. green/red change colour).

## Changes made to CLAUDE.md / constraints / working agreement

- `CLAUDE.md`: updated "Current state" and added the Feature 003 doc link +
  this retro to the self-improvement log. No constraint or working-agreement
  changes.

## Open questions for next session

- Still worth a `.gitattributes` (`* text=auto eol=lf`) to silence CRLF warnings
  (carried from retros 001 and 002).
