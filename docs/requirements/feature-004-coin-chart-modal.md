# Feature 004 — Coin chart modal

## User story

As an internal user, I want to click a coin card and see its recent price trend,
so I can understand how the coin moved over the last month without leaving the
dashboard.

## Data source

- `app/src/api/crypto.ts` gains `getMarketChart(id)`, which fetches
  `/coins/{id}/market_chart?vs_currency=usd&days=30` (no API key) and returns the
  `prices` array as `PricePoint[]` (each point is `[timestampMs, priceUsd]`).

## Acceptance criteria

- GIVEN the dashboard
  WHEN the user clicks (or presses Enter/Space on) a coin card
  THEN a modal opens for that coin.
- GIVEN the modal is open
  WHEN the 30-day data is loading THEN a loading state shows; on failure, a
  friendly error message shows (not a broken chart).
- GIVEN the 30-day price data
  WHEN it has loaded
  THEN the modal draws a **simple line chart as inline SVG** (no charting
  library), and shows the **coin name**, the **30-day high** and **low** prices.
- GIVEN the modal is open
  WHEN the user clicks the **close button**, clicks the backdrop, or presses
  **Escape** THEN the modal closes and focus returns to the page.

## Pure logic (unit-tested, no DOM)

In `app/src/crypto/cryptoView.ts`:
- `priceRange(points)` → `{ high, low }` (max/min of the price values).
- `buildLinePath(points, width, height, pad?)` → the SVG polyline `points`
  string, mapping timestamp→x and price→y (y inverted so higher price is higher
  on screen), scaled to the given box and padding. Handles a flat range
  (high === low) and fewer than two points without dividing by zero.

The modal and cards are presentational; only these helpers are unit-tested
(working agreement rule 5).

## Out of scope

- Charting libraries (explicitly forbidden for this feature).
- Axis labels, tooltips, zoom, timeframe switching.
- Caching the chart data between opens.

## Open questions

- None.
