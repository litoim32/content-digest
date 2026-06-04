import { describe, it, expect } from 'vitest'
import type { Coin } from '@/api/crypto'
import {
  sortByRank,
  formatUsd,
  formatChange,
  isPositiveChange,
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
