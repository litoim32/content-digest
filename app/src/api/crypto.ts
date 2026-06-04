// Thin client-side adapter over the public CoinGecko markets API.
// No backend of our own; no third-party SDK — just native fetch.

export interface Coin {
  id: string
  symbol: string
  name: string
  image: string
  current_price: number
  market_cap_rank: number
  price_change_percentage_24h: number
}

const MARKETS_URL =
  'https://api.coingecko.com/api/v3/coins/markets' +
  '?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&price_change_percentage=24h'

/**
 * Fetch the top coins by market cap. Returns the raw coin list;
 * shaping/sorting/formatting live in the pure module `@/crypto/cryptoView`.
 */
export async function getCoins(signal?: AbortSignal): Promise<Coin[]> {
  const res = await fetch(MARKETS_URL, {
    signal,
    headers: { accept: 'application/json' },
  })
  if (!res.ok) {
    throw new Error(`CoinGecko request failed: ${res.status} ${res.statusText}`)
  }
  return (await res.json()) as Coin[]
}

/** A single point on a price chart: [timestamp in ms, price in USD]. */
export type PricePoint = [number, number]

interface MarketChartResponse {
  prices: PricePoint[]
}

/**
 * Fetch the last 30 days of USD prices for a coin. Returns the `prices` series;
 * range/line-path math lives in the pure module `@/crypto/cryptoView`.
 */
export async function getMarketChart(
  id: string,
  signal?: AbortSignal,
): Promise<PricePoint[]> {
  const url =
    `https://api.coingecko.com/api/v3/coins/${encodeURIComponent(id)}/market_chart` +
    `?vs_currency=usd&days=30`
  const res = await fetch(url, { signal, headers: { accept: 'application/json' } })
  if (!res.ok) {
    throw new Error(`CoinGecko request failed: ${res.status} ${res.statusText}`)
  }
  const data = (await res.json()) as MarketChartResponse
  return data.prices
}
