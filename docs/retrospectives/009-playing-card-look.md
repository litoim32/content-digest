# Retrospective 009 — Playing-card look

## What we did

Asked which "deck of cards" direction was wanted (fanned stack / flip-through /
playing-card styling) and the user chose **playing-card styling**. Restyled each
coin card to look like a playing card: a portrait `aspect-ratio: 5/7` shape, an
inner hairline border frame (`::before`), mirrored corner indices (market-cap
rank over the symbol, the bottom-right one rotated 180°), and a centred "face"
with the logo, name, price, and green/red change pill. The responsive grid was
left unchanged, as requested.

## What worked

- Asking first (working agreement rule 6) avoided building the wrong thing —
  "deck of cards" had three plausible, very different interpretations.
- The change was contained to one component's JSX + its CSS; logic untouched, so
  all 19 tests stayed green and lint/build were clean.
- Repurposing the existing `::before` (previously a top stripe) as the inner
  frame kept the stylesheet tidy.

## What didn't / friction points

- Removed the now-unused `.coin-card__header`, `.coin-card__symbol`, and
  `.coin-card__badge` rules when the card was restructured — easy to leave dead
  CSS behind otherwise.
- Coin symbols vary in length (e.g. `steth`), so the corner `pc-suit` needed a
  `max-width` + ellipsis to avoid overflowing the corner.
- Visual result (card proportions, corner placement) is best judged in the
  browser; verification here was build + lint + 19 tests + dev-server 200.

## Decisions to carry forward

- For ambiguous visual requests, offer 2–4 concrete options via AskUserQuestion
  before implementing — cheaper than guessing and redoing.

## Changes made to CLAUDE.md / constraints / working agreement

- `CLAUDE.md`: updated "Current state", added the Feature 009 doc link and this
  retro to the self-improvement log. No constraint/working-agreement changes.

## Open questions for next session

- A card-back / flip-to-reveal interaction could build on this look (would start
  with a requirements doc).
- Still worth a `.gitattributes` (`* text=auto eol=lf`) to silence CRLF warnings
  (carried from retros 001–008).
