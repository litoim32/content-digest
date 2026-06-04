# Feature 002 — Crypto Dashboard

## User story

As an internal user, I want to see the top cryptocurrencies as a grid of cards so
I can glance at current prices and 24h movement at a time.

## Data source

- `app/src/api/crypto.ts` exposes `getCoins()`, which fetches the top coins by
  market cap from the public CoinGecko markets API (`/coins/markets`,
  `vs_currency=usd`). No backend of our own — this is a client-side fetch to a
  public API (consistent with the frontend-only constraint).
- Each coin carries: `id`, `symbol`, `name`, `image` (logo URL),
  `current_price` (USD), `market_cap_rank`, `price_change_percentage_24h`.

## Acceptance criteria

- GIVEN a list of coins from the API
  WHEN the dashboard renders
  THEN coins appear as a **responsive grid of cards**, one card per coin,
  **sorted ascending by `market_cap_rank`**.
- GIVEN a single coin
  WHEN its card renders
  THEN the card shows: the coin **logo**, **name**, **symbol** (uppercased),
  **current price in USD** (currency-formatted), the **24h change percentage**,
  and a small **rank badge**.
- GIVEN the 24h change percentage
  WHEN it is positive THEN it renders in **green**; when negative, in **red**.
- GIVEN the page loads
  WHEN the request is in flight THEN a loading state shows; on failure, an error
  message shows instead of a broken grid.
- The dashboard is mounted as the **app's main view**.

## Pure logic (unit-tested, no DOM)

In `app/src/crypto/cryptoView.ts`:
- `sortByRank(coins)` — ascending by `market_cap_rank`.
- `formatUsd(price)` — USD currency string.
- `formatChange(pct)` — signed percentage string (e.g. `+2.34%` / `-1.20%`).
- `isPositiveChange(pct)` — true when `pct >= 0`.

The component is presentational only and consumes these helpers (working
agreement rule 5 — no DOM-testing layer added, so no ADR needed).

## Out of scope

- Search, filtering, pagination, auto-refresh.
- Per-coin detail view or charts.
- Caching / persistence.

## Open questions

- None.
