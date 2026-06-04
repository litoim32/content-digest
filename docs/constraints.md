# Constraints

The standing "what NOT to do" list for this repo. Read this before proposing
anything new. If a request conflicts with a constraint, **surface the conflict —
do not silently comply** (see Escalation rules in `CLAUDE.md`).

## Product scope (from the project interview)

- ~~**No mobile / responsive layout.** Desktop browser only.~~ **Amended in
  Feature 002** at the user's explicit request: a **fluid/responsive grid** (CSS
  `grid` with `auto-fill`/`minmax`) is now allowed so views reflow with the
  window width. Dedicated mobile-specific layouts / breakpoint work remain out of
  scope unless requested.
- **No backend or database.** Frontend-only. Any future persistence starts with a
  requirements doc and an ADR.
- **No authentication / login.**
- **No internationalization or theming.**

## Workflow constraints

- **No unscoped refactors.** Changes are scoped to the feature being worked on.
- **No new dependencies without an ADR.** Ask first, record the decision, then
  install.
- **No code without a spec.** Every module begins with a failing `*.spec.ts(x)`.
- **No skipping the retrospective.** Every shipped feature ends with a retro that
  may update `CLAUDE.md` / constraints in the same session.

## Layout constraints

- **No governance files inside `app/`.** `CLAUDE.md`, `README.md`, and `docs/**`
  live at the repo root only.
- **No app code outside `app/`.** Root-level config/dotfiles are allowed; app
  source is not.

## Toolchain constraints

- **No `eslint-plugin-react` until it supports ESLint 10.** The current Vite
  template ships ESLint 10, with which `eslint-plugin-react` is incompatible.
  `eslint-plugin-react-hooks` (already configured) covers the important rules.
- **`eslint .` only — no `--ext` flag.** ESLint 10 uses flat config; the `--ext`
  flag is rejected. File scoping lives in `app/eslint.config.js`.
- **Do not loosen TypeScript strictness.** `strict`, `noImplicitAny`,
  `strictNullChecks`, and `noUncheckedIndexedAccess` stay on in every
  `tsconfig*.json`. Narrow the type or guard the value instead.
- **Do not reintroduce `baseUrl`.** It is deprecated in TypeScript 6 (TS5101) and
  breaks `npm run build`. The `@/*` path alias works without it — TS 5+ resolves
  `paths` relative to the tsconfig file. (Found in Feature 002.)

## Environment note (this machine)

- Node.js is installed **per-user, portable** at
  `%LOCALAPPDATA%\nodejs-portable\node-v22.22.3-win-x64` (no admin rights). It is
  on the user PATH; a shell/session restart may be needed for new terminals to
  see it. The bootstrap pins Node 22 via `.nvmrc`.
