// Thin client-side adapter over the public CoinGecko API.
// No backend of our own; no third-party SDK — just native fetch.

import { backoffMs } from '@/crypto/cryptoView'

export interface Coin {
  id: string
  symbol: string
  name: string
  image: string
  current_price: number
  market_cap_rank: number
  price_change_percentage_24h: number
}

/** Error carrying the HTTP status so callers can react to 429 specifically. */
export class HttpError extends Error {
  readonly status: number
  constructor(status: number, statusText: string) {
    super(`CoinGecko request failed: ${status} ${statusText}`)
    this.name = 'HttpError'
    this.status = status
  }
}

const API_BASE = 'https://api.coingecko.com/api/v3'

// Optional free "demo" key. With no key the keyless public API is used as before.
const API_KEY = import.meta.env.VITE_COINGECKO_API_KEY

function apiHeaders(): Record<string, string> {
  const headers: Record<string, string> = { accept: 'application/json' }
  if (API_KEY) headers['x-cg-demo-api-key'] = API_KEY
  return headers
}

const MARKETS_URL =
  `${API_BASE}/coins/markets` +
  '?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&price_change_percentage=24h'

/**
 * Fetch the top coins by market cap. Returns the raw coin list;
 * shaping/sorting/formatting live in the pure module `@/crypto/cryptoView`.
 */
export async function getCoins(signal?: AbortSignal): Promise<Coin[]> {
  const res = await fetch(MARKETS_URL, { signal, headers: apiHeaders() })
  if (!res.ok) throw new HttpError(res.status, res.statusText)
  return (await res.json()) as Coin[]
}

/** A single point on a price chart: [timestamp in ms, price in USD]. */
export type PricePoint = [number, number]

interface MarketChartResponse {
  prices: PricePoint[]
}

/** Resolve after `ms`, or reject early if the signal aborts. */
function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Aborted', 'AbortError'))
      return
    }
    const timer = setTimeout(resolve, ms)
    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(timer)
        reject(new DOMException('Aborted', 'AbortError'))
      },
      { once: true },
    )
  })
}

// 30-day series rarely changes within a session; cache per coin to cut requests.
const chartCache = new Map<string, PricePoint[]>()
const MAX_ATTEMPTS = 4

/**
 * Fetch the last 30 days of USD prices for a coin, with a session cache and
 * exponential-backoff retries on 429 (the free tier rate-limits this endpoint).
 * Throws `HttpError` on a non-retriable failure or after exhausting retries.
 */
export async function getMarketChart(
  id: string,
  signal?: AbortSignal,
): Promise<PricePoint[]> {
  const cached = chartCache.get(id)
  if (cached) return cached

  const url = `${API_BASE}/coins/${encodeURIComponent(id)}/market_chart?vs_currency=usd&days=30`

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const res = await fetch(url, { signal, headers: apiHeaders() })
    if (res.ok) {
      const data = (await res.json()) as MarketChartResponse
      chartCache.set(id, data.prices)
      return data.prices
    }
    // Retry only rate-limit responses, and only if attempts remain.
    if (res.status === 429 && attempt < MAX_ATTEMPTS - 1) {
      await sleep(backoffMs(attempt), signal)
      continue
    }
    throw new HttpError(res.status, res.statusText)
  }
  // Unreachable: the loop returns or throws on its last attempt.
  throw new HttpError(429, 'Too Many Requests')
}
