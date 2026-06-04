import type { Coin, PricePoint } from '@/api/crypto'

/** Ascending by market-cap rank. Returns a new array (does not mutate input). */
export function sortByRank(coins: readonly Coin[]): Coin[] {
  return [...coins].sort((a, b) => a.market_cap_rank - b.market_cap_rank)
}

const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

/** Format a USD price, e.g. 1234.5 -> "$1,234.50". */
export function formatUsd(price: number): string {
  return usd.format(price)
}

/** Signed 24h change, e.g. 2.345 -> "+2.35%", -1.2 -> "-1.20%". */
export function formatChange(pct: number): string {
  const sign = pct >= 0 ? '+' : ''
  return `${sign}${pct.toFixed(2)}%`
}

/** True for zero or positive change (rendered green), false for negative (red). */
export function isPositiveChange(pct: number): boolean {
  return pct >= 0
}

/** Local wall-clock time as zero-padded `HH:MM:SS`. */
export function formatClock(date: Date): string {
  const pad = (n: number): string => String(n).padStart(2, '0')
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

/** Highest and lowest price across a series of points. */
export function priceRange(points: readonly PricePoint[]): { high: number; low: number } {
  if (points.length === 0) return { high: 0, low: 0 }
  const prices = points.map((p) => p[1])
  return { high: Math.max(...prices), low: Math.min(...prices) }
}

const round = (n: number): number => Math.round(n * 100) / 100

/**
 * Build the `points` attribute for an SVG `<polyline>` from price data.
 * Timestamp maps to x (left→right), price maps to y inverted (higher price is
 * higher on screen), scaled into a `width`×`height` box inset by `pad`.
 * Safe for a flat range (high === low) and for fewer than two points.
 */
export function buildLinePath(
  points: readonly PricePoint[],
  width: number,
  height: number,
  pad = 0,
): string {
  if (points.length === 0) return ''

  const innerW = width - 2 * pad
  const innerH = height - 2 * pad
  const { high, low } = priceRange(points)

  if (points.length === 1) {
    return `${round(pad)},${round(pad + innerH / 2)}`
  }

  const times = points.map((p) => p[0])
  const tMin = Math.min(...times)
  const tMax = Math.max(...times)
  const tSpan = tMax - tMin
  const pSpan = high - low

  return points
    .map((p) => {
      const x = pad + (tSpan === 0 ? 0 : ((p[0] - tMin) / tSpan) * innerW)
      const y = pad + (pSpan === 0 ? innerH / 2 : (1 - (p[1] - low) / pSpan) * innerH)
      return `${round(x)},${round(y)}`
    })
    .join(' ')
}
