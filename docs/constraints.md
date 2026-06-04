# Constraints

The standing "what NOT to do" list for this repo. Read this before proposing
anything new. If a request conflicts with a constraint, **surface the conflict —
do not silently comply** (see Escalation rules in `CLAUDE.md`).

## Product scope (from the project interview)

- **No mobile / responsive layout.** Desktop browser only.
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

## Environment note (this machine)

- Node.js is installed **per-user, portable** at
  `%LOCALAPPDATA%\nodejs-portable\node-v22.22.3-win-x64` (no admin rights). It is
  on the user PATH; a shell/session restart may be needed for new terminals to
  see it. The bootstrap pins Node 22 via `.nvmrc`.
