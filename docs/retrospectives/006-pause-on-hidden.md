# Retrospective 006 — Pause refresh on hidden tab

## What we did

Extended the Feature 005 refresh effect with the Page Visibility API: a
`visibilitychange` listener stops the 60s interval and aborts any in-flight
request when `document.hidden` is true, and on return to visible it refreshes
once immediately and restarts the interval. Interval lifecycle was factored into
local `startInterval`/`stopInterval` helpers so the listener and cleanup share
one source of truth. Cleanup now also removes the listener.

## What worked

- Small, contained change — reused the existing `load()` and abort plumbing; no
  new state, no new dependency, no UI change.
- The "never goes blank" guarantee held automatically: pausing/aborting never
  clears `coins`, so a backgrounded tab still shows the last data on return
  until the immediate refresh lands.
- 18 unit tests stayed green; lint and build clean.

## What didn't / friction points

- This is inherently DOM/browser behaviour with no pure core to unit-test, so
  verification leaned on build + lint + manual reasoning about the effect
  lifecycle. The visibility transitions weren't exercised by an automated test
  (would need a DOM test layer + an ADR, per rule 5 — not warranted yet).

## Decisions to carry forward

- Centralize interval start/stop in helpers inside the effect when multiple
  triggers (mount, visibility, cleanup) touch the same timer — avoids dangling
  intervals.

## Changes made to CLAUDE.md / constraints / working agreement

- `CLAUDE.md`: updated "Current state", added the Feature 006 doc link and this
  retro to the self-improvement log. No constraint/working-agreement changes.

## Open questions for next session

- If automated coverage of the refresh/visibility lifecycle becomes valuable,
  that's the trigger to add React Testing Library via an ADR.
- Still worth a `.gitattributes` (`* text=auto eol=lf`) to silence CRLF warnings
  (carried from retros 001–005).
