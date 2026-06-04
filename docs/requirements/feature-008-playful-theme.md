# Feature 008 — Playful visual theme

## User story

As an internal user, I want the dashboard to look cheerful and lively rather
than plain, so it's more pleasant to keep open.

## Acceptance criteria

- GIVEN any page
  WHEN it renders
  THEN the background is a soft, cheerful gradient and text uses a friendly,
  rounded font.
- GIVEN the header
  WHEN it renders
  THEN the title is large and colorful (gradient text) with a playful emoji, and
  still contains "Welcome to webapp" (Feature 001 stays satisfied).
- GIVEN a coin card
  WHEN it renders
  THEN it has rounded corners, a colorful rank badge, and the 24h change shown
  as a green/red **pill**; on hover it lifts with a colorful glow.
- GIVEN a user with `prefers-reduced-motion: reduce`
  WHEN the page renders
  THEN the existing motion-reduction rules still hold (no entrance/float/lift).

## Notes

- Presentational only — CSS + a Google Fonts `<link>` (no npm dependency, no
  pure logic), so no new unit tests (working agreement rule 5). Existing 19
  tests must stay green.
- Rewrites the leftover Vite-template styles in `index.css` (centered 1126px
  column, dark-mode vars, unused `.counter`/`#social`/`code` rules) that no
  longer match the app.

## Out of scope

- A dark-mode toggle.
- Theming controls / user-selectable palettes.

## Open questions

- None. (A Google Fonts link is an external resource; acceptable for theming and
  consistent with the existing client-side external API calls.)
