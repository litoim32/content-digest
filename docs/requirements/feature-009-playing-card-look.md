# Feature 009 — Playing-card look for coin cards

## User story

As an internal user, I want each coin card to look like a playing card from a
deck, so the dashboard feels playful — while keeping the same responsive grid
layout.

## Acceptance criteria

- GIVEN a coin card
  WHEN it renders
  THEN it looks like a playing card: a portrait card shape with an inner border
  frame, a corner "index" in the top-left showing the coin's market-cap rank
  over its symbol, and the same index mirrored (rotated 180°) in the
  bottom-right.
- GIVEN the card's centre
  WHEN it renders
  THEN it shows the coin logo as the central motif with the name, USD price, and
  the green/red 24h change pill.
- GIVEN the grid
  WHEN the page renders
  THEN the overall responsive grid layout is unchanged (cards do not stack or
  overlap) — only each card's internal styling changes.
- GIVEN a user with `prefers-reduced-motion: reduce`
  WHEN the page renders
  THEN existing motion-reduction rules still hold.

## Notes

- Presentational only (CSS + minor JSX restructure of the card); no logic, so no
  new unit tests (working agreement rule 5). Existing 19 tests stay green.
- Corner indices are decorative (`aria-hidden`); the accessible label on the card
  already names the coin.

## Out of scope

- Card-back / flip-to-reveal interaction.
- Suit symbols or face-card artwork.
- Changing the grid into a stacked/fanned deck (a different option that was not
  chosen).

## Open questions

- None.
