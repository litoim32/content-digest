# Feature 005 — Auto-refresh

## User story

As an internal user leaving the dashboard open, I want it to keep itself current,
so prices stay fresh without me reloading the page — and without the screen
flashing blank while it updates.

## Acceptance criteria

- GIVEN the dashboard is open
  WHEN 60 seconds pass
  THEN it re-fetches the coin list automatically, and keeps doing so on a 60s
  interval.
- GIVEN a refresh is in flight
  WHEN data is being fetched
  THEN a **small loading indicator** is shown, AND the **previously loaded cards
  remain visible** — the screen never goes blank during a refresh.
- GIVEN data has loaded at least once
  WHEN it renders
  THEN a **"Last updated HH:MM:SS"** label shows the local time of the most
  recent successful fetch.
- GIVEN a refresh fails
  WHEN the previous data is still on screen
  THEN the old data stays visible and a non-blocking note indicates the refresh
  failed (only the very first load may show a full error state, since there is no
  prior data yet).
- GIVEN the dashboard unmounts
  WHEN it is removed
  THEN the interval is cleared and any in-flight request is aborted.

## Pure logic (unit-tested, no DOM)

In `app/src/crypto/cryptoView.ts`:
- `formatClock(date)` → local time as zero-padded `HH:MM:SS`.

## Out of scope

- Configurable interval / pause-on-hidden-tab.
- Refreshing the open chart modal (Feature 004) on the same timer.
- Persisting the last-updated time across reloads.

## Open questions

- None. (CoinGecko free-tier 429s, noted in retro 004, are handled by the
  non-blocking refresh-failed path.)
