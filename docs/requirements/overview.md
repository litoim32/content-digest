# Overview

## Goal

`webapp` is a general-purpose internal web tool for the team: a browser-based
dashboard for jotting and viewing shared quick notes and useful links. It starts
as a minimal Vite + React + TypeScript shell and grows feature by feature under a
spec-first workflow.

## Primary user / context

Internal team members, using a desktop browser. Not related to Business Central
or any specific line-of-business system — it is a standalone internal utility.

## Success criteria

- The app builds, the dev server runs, and a greeting renders end to end
  (Feature 001 — hello world) confirming the component + build + test pipeline.
- Every subsequent capability is captured as a `docs/requirements/feature-*.md`
  spec with explicit acceptance criteria before any code is written.
- Business logic stays in pure, unit-tested modules under `app/src/`;
  components only render.

## Out of scope

- Mobile / responsive layout — desktop browser only.
- Backend or database — frontend-only for now (persistence, if needed later,
  starts with a requirements doc and an ADR).
- Authentication / login.
- Internationalization and theming.
