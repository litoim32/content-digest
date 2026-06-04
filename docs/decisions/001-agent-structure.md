# ADR 001 — Repository structure: governance at root, app code under `app/`

## Status

Accepted (bootstrap).

## Context

This project follows agentic-engineering practices: the workflow, requirements,
decisions, and constraints that govern *how* the project is built must be
durable, easy for both humans and Claude to find, and impossible to confuse with
the application source. A conventional single-folder Vite project mixes
governance docs with app code, which makes the governance layer easy to lose in
the noise and tempts tools (and agents) to treat docs as build inputs.

We also want the application to be a self-contained, conventionally-structured
Vite app so that standard tooling (Vite, Vitest, ESLint) works with zero special
configuration.

## Decision

Split the repository into two physically separated layers:

- **Repo root** holds the governance layer: `CLAUDE.md`, `README.md`, `docs/`
  (with `requirements/`, `decisions/`, `retrospectives/`, and `constraints.md`),
  and root-level config/dotfiles. A root `package.json` exposes pass-through
  scripts (`npm run dev`, `build`, `test`, `lint`, `format`, `setup`) that
  delegate into `app/` via `npm --prefix app`.
- **`app/`** holds the entire Vite + React + TypeScript application — a normal,
  conventional Vite project with its own `package.json`, configs, and `src/`.

Governance files never live inside `app/`; app code never lives at the root.

### Subfolders under `docs/`

- `requirements/` — `overview.md` plus one `feature-NNN-*.md` per feature.
- `decisions/` — numbered ADRs (this is 001).
- `retrospectives/` — one `NNN-<slug>.md` per shipped feature.
- `constraints.md` — the standing "what NOT to do" list.

## Consequences

- **Positive:** Governance is unmissable and version-controlled alongside code;
  `app/` stays a clean, idiomatic Vite project; the root pass-through means
  contributors run everything from one place; the split is enforceable as a
  constraint and an escalation rule.
- **Negative:** Two `package.json` files and the `--prefix app` indirection add a
  small amount of ceremony. If a second package ever appears, we would revisit
  this in favor of npm workspaces (noted in the bootstrap's deferred list).
- **Neutral:** A single root-level `.gitignore` covers both layers; Vite's
  generated `app/.gitignore` was removed to avoid duplication.
