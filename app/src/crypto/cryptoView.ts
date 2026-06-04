import type { Coin } from '@/api/crypto'

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
