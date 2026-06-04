import { describe, it, expect } from 'vitest'
import type { Coin, PricePoint } from '@/api/crypto'
import {
  sortByRank,
  formatUsd,
  formatChange,
  isPositiveChange,
  priceRange,
  buildLinePath,
  formatClock,
} from '@/crypto/cryptoView'

const coin = (over: Partial<Coin>): Coin => ({
  id: 'x',
  symbol: 'x',
  name: 'X',
  image: '',
  current_price: 0,
  market_cap_rank: 0,
  price_change_percentage_24h: 0,
  ...over,
})

describe('sortByRank', () => {
  it('orders coins ascending by market_cap_rank', () => {
    const input = [
      coin({ id: 'c', market_cap_rank: 3 }),
      coin({ id: 'a', market_cap_rank: 1 }),
      coin({ id: 'b', market_cap_rank: 2 }),
    ]
    expect(sortByRank(input).map((c) => c.id)).toEqual(['a', 'b', 'c'])
  })

  it('does not mutate the input array', () => {
    const input = [
      coin({ id: 'b', market_cap_rank: 2 }),
      coin({ id: 'a', market_cap_rank: 1 }),
    ]
    sortByRank(input)
    expect(input.map((c) => c.id)).toEqual(['b', 'a'])
  })
})

describe('formatUsd', () => {
  it('formats a number as a USD currency string', () => {
    expect(formatUsd(1234.5)).toBe('$1,234.50')
  })

  it('keeps small fractional prices readable', () => {
    expect(formatUsd(0.5)).toContain('$0.5')
  })
})

describe('formatChange', () => {
  it('prefixes a plus sign and percent for gains', () => {
    expect(formatChange(2.345)).toBe('+2.35%')
  })

  it('keeps the minus sign for losses', () => {
    expect(formatChange(-1.2)).toBe('-1.20%')
  })
})

describe('isPositiveChange', () => {
  it('is true for zero and positive values', () => {
    expect(isPositiveChange(0)).toBe(true)
    expect(isPositiveChange(3.1)).toBe(true)
  })

  it('is false for negative values', () => {
    expect(isPositiveChange(-0.01)).toBe(false)
  })
})

const pts = (...p: PricePoint[]): PricePoint[] => p

describe('priceRange', () => {
  it('returns the max and min price across points', () => {
    expect(priceRange(pts([0, 10], [1, 30], [2, 20]))).toEqual({ high: 30, low: 10 })
  })

  it('handles a single point (high === low)', () => {
    expect(priceRange(pts([0, 42]))).toEqual({ high: 42, low: 42 })
  })
})

describe('buildLinePath', () => {
  it('maps timestamps to x and prices to inverted y within the box', () => {
    // low=10 -> y=height; high=20 -> y=0; rising price goes up the screen.
    expect(buildLinePath(pts([0, 10], [10, 20]), 100, 100, 0)).toBe('0,100 100,0')
  })

  it('draws a flat line through the vertical middle when all prices are equal', () => {
    expect(buildLinePath(pts([0, 5], [10, 5]), 100, 100, 0)).toBe('0,50 100,50')
  })

  it('places a single point at the left edge, vertically centered', () => {
    expect(buildLinePath(pts([0, 5]), 100, 100, 0)).toBe('0,50')
  })

  it('returns an empty string for no points', () => {
    expect(buildLinePath(pts(), 100, 100, 0)).toBe('')
  })

  it('respects padding', () => {
    // pad=10 -> x in [10,90], y in [10,90]; rising price: first y=90, last y=10.
    expect(buildLinePath(pts([0, 1], [10, 2]), 100, 100, 10)).toBe('10,90 90,10')
  })
})

describe('formatClock', () => {
  it('formats local time as zero-padded HH:MM:SS', () => {
    expect(formatClock(new Date(2020, 0, 1, 9, 5, 3))).toBe('09:05:03')
  })

  it('handles end-of-day and midnight', () => {
    expect(formatClock(new Date(2020, 0, 1, 23, 59, 9))).toBe('23:59:09')
    expect(formatClock(new Date(2020, 0, 1, 0, 0, 0))).toBe('00:00:00')
  })
})
