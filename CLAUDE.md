# webapp

A general-purpose internal web tool for the team — a browser-based dashboard for quick notes and useful links. Built with Vite + React + TypeScript, following agentic-engineering practices: spec-first, decisions recorded as ADRs, constraints explicit, and the workflow improves itself via a retrospective after every feature. The governance layer (this file, `README.md`, `docs/`) is physically separated from the application code, which lives entirely under `app/`.

## Repository layout

```
webapp/                  ← repo root (git lives here)
  CLAUDE.md              ← this file — entry point for Claude
  README.md              ← entry point for humans
  package.json           ← root pass-through scripts (npm run dev, etc.)
  .gitignore .editorconfig .nvmrc .env.example
  docs/                  ← requirements / decisions / retrospectives / constraints
  app/                   ← all Vite + React + TS code lives here
```

Governance files live at the root and **never** inside `app/`. App code lives under `app/` and **never** at the root. See [ADR 001](docs/decisions/001-agent-structure.md).

## How to work in this repo

> **Working agreement**
>
> 1. No code without a spec. Every feature begins as a file under `docs/requirements/` (at repo root) and a failing test under `app/src/**/*.spec.ts(x)`.
> 2. No architectural choice without an ADR under `docs/decisions/`.
> 3. Read `docs/constraints.md` before proposing anything new. Surface conflicts, don't silently comply.
> 4. The loop is: spec → failing test → minimal code → green test → commit. One concern per commit.
> 5. Logic in pure modules, rendering in components. Specs target the logic. Add a DOM-testing layer (e.g. React Testing Library) only via an ADR when a real need appears.
> 6. When in doubt, ask. Use AskUserQuestion rather than guessing requirements.
> 7. Keep `CLAUDE.md`'s "Current state" section updated after every merged change.
> 8. Dev server lives at `http://127.0.0.1:<DEV_PORT>/` where `DEV_PORT` is recorded in `.dev-port` (defaults to 5173, probed for a free port at bootstrap time; see Step 6). Always read the current port from `.dev-port` instead of hardcoding 5173. `strictPort: true` is set so Vite never silently drifts.
> 9. **Retrospective after every feature.** Once a feature is green and committed, write `docs/retrospectives/NNN-<slug>.md` capturing what worked, what didn't, and concrete workflow changes. If the retro proposes a change, **edit `CLAUDE.md` (working agreement, constraints, or links) in the same session** — don't defer. Add a new ADR if the change is architectural. Then update the "Self-improvement log" section of `CLAUDE.md` to link the new retro. Commit as `chore(retro): NNN-<slug>`.
> 10. **Layout discipline.** Governance files (`CLAUDE.md`, `README.md`, `docs/**`) live at the repo root and never inside `app/`. App code lives inside `app/` and never at the repo root. Root-level config (CI, dotfiles) is allowed; app code at root is not.
> 11. **Conventional Commits.** Format: `<type>(<scope>): <subject>`. Types: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `perf`, `build`, `ci`, `style`. Retros are committed as `chore(retro): NNN-<slug>`. ADR additions as `docs(adr): NNN-<slug>`.
> 12. **CLAUDE.md ≤ ~200 lines.** It is a router, not an encyclopedia. If a retro update would push it past ~200 lines, move detail into a linked file under `docs/` and link from `CLAUDE.md` instead. Same applies to constraints.md — split into topical files once over ~150 lines.

## Documentation

- [docs/requirements/overview.md](docs/requirements/overview.md) — project goal, user, success criteria
- [docs/requirements/feature-001-hello-world.md](docs/requirements/feature-001-hello-world.md) — Feature 001 spec
- [docs/requirements/feature-002-crypto-dashboard.md](docs/requirements/feature-002-crypto-dashboard.md) — Feature 002 spec
- [docs/requirements/feature-003-card-animations.md](docs/requirements/feature-003-card-animations.md) — Feature 003 spec
- [docs/requirements/feature-004-coin-chart-modal.md](docs/requirements/feature-004-coin-chart-modal.md) — Feature 004 spec
- [docs/requirements/feature-005-auto-refresh.md](docs/requirements/feature-005-auto-refresh.md) — Feature 005 spec
- [docs/requirements/feature-006-pause-on-hidden.md](docs/requirements/feature-006-pause-on-hidden.md) — Feature 006 spec
- [docs/requirements/feature-007-resilient-chart-loading.md](docs/requirements/feature-007-resilient-chart-loading.md) — Feature 007 spec
- [docs/decisions/001-agent-structure.md](docs/decisions/001-agent-structure.md) — ADR: root-vs-`app/` split
- [docs/constraints.md](docs/constraints.md) — what NOT to do
- [docs/retrospectives/](docs/retrospectives/) — one retro per feature

## Current state

Feature 002 (Crypto Dashboard) is the main view: a greeting header above a
responsive grid of top-coin cards (logo, name, symbol, USD price, green/red 24h
change, rank badge), sorted by market-cap rank, loaded client-side from the
public CoinGecko API. Pure view helpers in `app/src/crypto/cryptoView.ts` are
unit-tested; the data adapter is `app/src/api/crypto.ts`. Cards and logos
animate (Feature 003): staggered fade-in, hover lift, gentle logo float —
styles in `app/src/components/CryptoDashboard.css`, disabled under
`prefers-reduced-motion`. Cards are clickable (Feature 004): clicking one opens
`CoinChartModal`, which fetches 30 days of prices and draws an inline-SVG line
chart (no charting library) with the coin name and 30-day high/low; loading and
error states included. Chart math (`priceRange`, `buildLinePath`) is pure and
unit-tested in `cryptoView.ts`. The grid auto-refreshes every 60s (Feature 005):
it keeps the previous cards on screen while re-fetching, shows a small spinner +
"Last updated HH:MM:SS" label, and degrades non-destructively if a refresh fails.
Time formatting (`formatClock`) is pure and unit-tested. Refresh pauses while the
tab is hidden and resumes with an immediate fetch when it becomes visible again
(Feature 006, Page Visibility API), to ease the CoinGecko rate limit. Chart
fetching is resilient (Feature 007): a per-session cache, exponential-backoff
retries on HTTP 429, a rate-limit-specific message, and an optional
`VITE_COINGECKO_API_KEY` (sent as `x-cg-demo-api-key`) for higher limits.

## Dev server

From the repo root: `npm run dev` → `http://127.0.0.1:5173/` (port read from `.dev-port`, defaults to 5173). `strictPort: true` — Vite never silently drifts to another port.

## Common commands

All run from the **repo root** (they pass through to `app/`):

| Command | Action |
|---------|--------|
| `npm run dev` | Start dev server (`http://127.0.0.1:5173/`) |
| `npm run build` | Type-check + production build |
| `npm run preview` | Preview the production build (`:4173`) |
| `npm run test` | Run tests in watch mode (Vitest) |
| `npm run test:run` | Run tests once |
| `npm run lint` | Lint with ESLint |
| `npm run format` | Format with Prettier |
| `npm run setup` | Install `app/` dependencies |

## Critical files

- [app/vite.config.ts](app/vite.config.ts) — dev/preview ports + `@/` path alias (single source of truth)
- [app/vitest.config.ts](app/vitest.config.ts) — test config (merges the Vite alias)
- [docs/constraints.md](docs/constraints.md) — hard constraints for this repo

## Self-improvement log

- [001-hello-world](docs/retrospectives/001-hello-world.md) — bootstrap retro; added Windows/toolchain constraints (portable Node, ESLint 10 `eslint .` only, strict flags). Working agreement held.
- [002-crypto-dashboard](docs/retrospectives/002-crypto-dashboard.md) — crypto dashboard; removed deprecated `baseUrl` (TS6), amended the responsive-layout constraint, kept pure-logic/presentational split (no RTL/ADR).
- [003-card-animations](docs/retrospectives/003-card-animations.md) — CSS animations for cards/logos; moved static styling to a CSS file, reduced-motion respected, no new deps.
- [004-coin-chart-modal](docs/retrospectives/004-coin-chart-modal.md) — clickable cards + inline-SVG 30d chart modal; pure chart math unit-tested; noted CoinGecko 429 rate limits.
- [005-auto-refresh](docs/retrospectives/005-auto-refresh.md) — 60s self-refresh keeping prior data on screen; split state fields over a union; pure `formatClock` unit-tested.
- [006-pause-on-hidden](docs/retrospectives/006-pause-on-hidden.md) — pause polling on hidden tab via Page Visibility API; resume with immediate fetch; centralized interval start/stop.

## Escalation rules

> Stop and ask via AskUserQuestion when:
> - The same test has failed 3 times with different fixes (you're guessing — get more context).
> - A request conflicts with `docs/constraints.md` or a rule in the "Rules" section of `CLAUDE.md` (surface it, don't silently comply).
> - A new runtime dependency is needed (ask + add an ADR before installing).
> - `:5173` or `:4173` is taken (fix the conflict, do not let Vite drift to another port).
> - This change would push `CLAUDE.md` past ~200 lines (route detail into a linked doc first).
> - Acceptance criteria in a `docs/requirements/feature-*.md` are ambiguous or contradict each other.

## Rules

> **TypeScript strict:** Do NOT disable `strict`, `noImplicitAny`, `strictNullChecks`, or `noUncheckedIndexedAccess` in any `tsconfig*.json`. Narrow the type or guard the value — never loosen the config.
>
> **Pure modules:** Business logic lives in pure modules under `app/src/`. React components only render — no branching/transform logic. Extract any non-trivial computation into a pure module and spec it before wiring it in.
>
> **Spec first:** Every new module starts with a failing `*.spec.ts(x)` test. Show the red output, then write the minimum code to turn it green, then commit.
