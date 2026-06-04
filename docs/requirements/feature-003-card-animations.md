# Feature 003 — Card & logo animations

## User story

As an internal user, I want the dashboard to feel lively, so the coin cards and
their logos animate subtly rather than appearing flat and static.

## Acceptance criteria

- GIVEN the dashboard loads
  WHEN the grid renders
  THEN each card **fades in and rises** into place, with a small **staggered
  delay** so cards appear in sequence rather than all at once.
- GIVEN a card is on screen
  WHEN the user hovers it
  THEN the card **lifts** (subtle upward translate + stronger shadow) smoothly.
- GIVEN a coin logo
  WHEN the page is idle THEN the logo has a gentle continuous **float**;
  WHEN the user hovers the card THEN the logo **scales up** slightly.
- GIVEN the user has `prefers-reduced-motion: reduce` set
  WHEN the dashboard renders
  THEN all non-essential animation is disabled (no float, no entrance motion).

## Out of scope

- Animating price/percentage value changes or live updates.
- Animation libraries — plain CSS keyframes/transitions only (no new deps).

## Notes

Animation is presentational only: it lives in CSS (`CryptoDashboard.css`) and
class names on the component. No pure logic, so no new unit tests (working
agreement rule 5).

## Open questions

- None.
