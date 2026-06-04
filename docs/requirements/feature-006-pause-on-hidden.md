# Feature 006 — Pause refresh on hidden tab

## User story

As an internal user who leaves the dashboard open in a background tab, I don't
want it to keep hammering the CoinGecko API while I'm not looking — but I do want
fresh data the moment I come back.

## Acceptance criteria

- GIVEN the dashboard is auto-refreshing (Feature 005)
  WHEN the tab becomes hidden (`document.hidden === true`)
  THEN the 60s refresh interval stops and any in-flight refresh is aborted.
- GIVEN the tab is hidden and refresh is paused
  WHEN the tab becomes visible again
  THEN the dashboard refreshes **immediately once** and restarts the 60s
  interval.
- GIVEN the dashboard unmounts
  WHEN it is removed
  THEN the `visibilitychange` listener is removed, the interval is cleared, and
  any in-flight request is aborted (no leaks).

## Notes

- Browser/DOM behaviour (Page Visibility API + interval lifecycle) — no
  extractable pure logic, so no new unit tests (working agreement rule 5). The
  existing 18 tests must stay green.
- Builds on Feature 005's `load()` + interval; keeps the "never goes blank"
  guarantee (previous cards remain while a refresh runs).

## Out of scope

- A visible "paused" badge in the UI.
- Throttling beyond pause/resume (e.g. slower interval in background).
- Refreshing the open chart modal on visibility change.

## Open questions

- None.
