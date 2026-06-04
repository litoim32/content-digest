# Retrospective 002 — Crypto Dashboard

## What we did

Built Feature 002 spec-first: a `CryptoDashboard` component that loads the top
coins from the public CoinGecko markets API via a thin adapter
(`app/src/api/crypto.ts`) and renders them as a responsive grid of cards (logo,
name, symbol, USD price, 24h change colored green/red, market-cap rank badge),
sorted by rank, with loading and error states. Sorting/formatting/colour logic
lives in a pure, unit-tested module (`app/src/crypto/cryptoView.ts`); the
component is presentational. Mounted as the app's main view under the greeting
header.

## What worked

- Splitting pure logic (`cryptoView.ts`, 9 tests) from rendering kept the spec
  meaningful without a DOM-testing layer — no RTL/ADR needed (working agreement
  rule 5 held).
- `noUncheckedIndexedAccess` and strict mode caught nothing here because array
  access was confined to `.map()` — the discipline paid off in clean code.
- The build (`tsc -b && vite build`) caught issues unit tests and the dev server
  did not.

## What didn't / friction points

- **`baseUrl` is deprecated in TypeScript 6** (TS5101) and broke `npm run build`,
  even though the bootstrap boilerplate told us to add it. Fix: removed
  `baseUrl`; TS 5+ resolves `paths` relative to the tsconfig file, so the `@/`
  alias still works. The dev server / Vitest never surfaced this because Vite's
  esbuild transform ignores it — only `tsc` flagged it.
- **`react-hooks/set-state-in-effect`** (ESLint 10) flagged a synchronous
  `setState({status:'loading'})` in the effect body. It was redundant (initial
  state was already `loading`), so removing it fixed the lint and was correct.
- A live screenshot via the Claude Preview tool wasn't possible: it looks for
  `.claude/launch.json` at the session root, not the project root, and Node is
  only on PATH per-command this session. Verified instead via build + lint +
  unit tests + `curl` 200 on both the dev server and the CoinGecko endpoint.

## Decisions to carry forward

- No new ADR. The `baseUrl` removal is a TS6 toolchain fix recorded as a
  constraint, not an architectural decision.
- Constraint amended: a fluid/responsive grid is now allowed (see
  `docs/constraints.md`), per the user's explicit request that overrode the
  earlier "no responsive layout" scope item.

## Changes made to CLAUDE.md / constraints / working agreement

- `CLAUDE.md`: updated "Current state", added the Feature 002 doc link and this
  retro to the self-improvement log.
- `docs/constraints.md`: struck the "no responsive layout" item (amended) and
  added a TypeScript-6 note that `baseUrl` must not be reintroduced.

## Open questions for next session

- CoinGecko's free tier is rate-limited; if the grid is opened frequently we may
  need caching or a refresh control (would start with a requirements doc).
- Still worth adding `.gitattributes` (`* text=auto eol=lf`) to silence the CRLF
  warnings (carried over from retro 001).
