# Retrospective 001 — Hello World Bootstrap

## What we did

Scaffolded a Vite + React + TypeScript app into `app/`, set up a root
pass-through `package.json` plus dotfiles (`.gitignore`, `.editorconfig`,
`.nvmrc`, `.env.example`), wrote the agentic-engineering governance layer at the
repo root (`CLAUDE.md`, `README.md`, `docs/` with requirements, ADR 001,
constraints, and a retrospectives folder), and built Feature 001 — hello world —
spec-first: requirements doc → failing `greeting.spec.ts` (red) → minimal
`greeting.ts` (green) → `App.tsx` rendering the greeting. Probed ports, brought
the dev server up on `http://127.0.0.1:5173/`, and confirmed HTTP 200 with the
React mount point present.

## What worked

- Spec-first loop ran cleanly: the red→green transition was visible and the `@/`
  path alias resolved in specs via `vitest.config.ts` merging the Vite config.
- The root-vs-`app/` split kept governance and app code cleanly separated.
- All four planned commits landed in order; tests and lint were green before the
  feat commit.

## What didn't / friction points

- **No Node.js on the machine.** Had to install it before anything else. The MSI
  installer required admin (UAC) elevation, which could not be granted in this
  environment (exit code 1602, twice). Worked around it by installing a
  **portable Node 22 zip** into `%LOCALAPPDATA%\nodejs-portable` and adding it to
  the user PATH — no admin needed. New terminals need a session restart to see
  Node on PATH; within this session it was prepended per-command.
- **Bash-centric bootstrap on Windows.** The boilerplate is written in bash
  (`heredoc`, `nc`, `nohup`/`kill`, `sed`). Adapted to the platform: files
  created with the editor tool instead of heredocs; port probing done with
  `Get-NetTCPConnection` instead of `nc`; dev server launched with
  `Start-Process` instead of `nohup`, PID tracked via `.dev-server.pid`.
- **Newer template than the boilerplate assumed.** The Vite template ships
  ESLint 10, TypeScript 6, React 19, Vite 8. `tsconfig.app.json` did **not**
  preset `"strict": true`, so the strict-safety flags were added explicitly. The
  `--ext` ESLint flag the boilerplate suggested is rejected by flat config, so
  the lint script stays `eslint .`. Both recorded in `docs/constraints.md`.
- **CRLF warnings** on every `git add` (Windows line endings vs LF in files).
  Harmless, but noisy.

## Decisions to carry forward

- No new ADR beyond ADR 001 (repo structure). The toolchain realities
  (portable Node, ESLint 10 / no `--ext`, strict flags added) are documented as
  constraints rather than architectural decisions.

## Changes made to CLAUDE.md / constraints / working agreement

- Added a Windows/toolchain section to `docs/constraints.md` (portable Node
  location, `eslint .` only, do-not-loosen-strict). Working agreement in
  `CLAUDE.md` held up unchanged.

## Open questions for next session

- Consider a `.gitattributes` with `* text=auto eol=lf` to silence the CRLF
  warnings and keep line endings consistent (would be a small `chore`).
- When the first real feature needs DOM assertions, add React Testing Library
  via an ADR (per working-agreement rule 5).
