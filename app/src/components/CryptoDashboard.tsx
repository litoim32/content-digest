import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { getCoins, type Coin } from '@/api/crypto'
import {
  sortByRank,
  formatUsd,
  formatChange,
  isPositiveChange,
} from '@/crypto/cryptoView'
import './CryptoDashboard.css'

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; coins: Coin[] }

const POSITIVE = '#16a34a'
const NEGATIVE = '#dc2626'

// Cap the cascade so later cards don't wait too long to appear.
const STAGGER_STEP_MS = 40
const STAGGER_MAX_STEPS = 12

function CoinCard({ coin, index }: { coin: Coin; index: number }) {
  const up = isPositiveChange(coin.price_change_percentage_24h)
  const delayMs = Math.min(index, STAGGER_MAX_STEPS) * STAGGER_STEP_MS
  // Custom property consumed by .coin-card's animation-delay.
  const enterDelay = { '--enter-delay': `${delayMs}ms` } as CSSProperties
  return (
    <article className="coin-card" style={enterDelay}>
      <div className="coin-card__header">
        <img className="coin-logo" src={coin.image} alt={`${coin.name} logo`} />
        <div>
          <div className="coin-card__name">{coin.name}</div>
          <div className="coin-card__symbol">{coin.symbol}</div>
        </div>
        <span className="coin-card__badge">#{coin.market_cap_rank}</span>
      </div>
      <div className="coin-card__price">{formatUsd(coin.current_price)}</div>
      <div className="coin-card__change" style={{ color: up ? POSITIVE : NEGATIVE }}>
        {formatChange(coin.price_change_percentage_24h)}
      </div>
    </article>
  )
}

export default function CryptoDashboard() {
  const [state, setState] = useState<LoadState>({ status: 'loading' })

  useEffect(() => {
    const controller = new AbortController()
    getCoins(controller.signal)
      .then((coins) => setState({ status: 'ready', coins: sortByRank(coins) }))
      .catch((err: unknown) => {
        if (controller.signal.aborted) return
        const message = err instanceof Error ? err.message : 'Failed to load coins.'
        setState({ status: 'error', message })
      })
    return () => controller.abort()
  }, [])

  if (state.status === 'loading') {
    return <p>Loading top coins…</p>
  }
  if (state.status === 'error') {
    return <p style={{ color: NEGATIVE }}>Could not load coins: {state.message}</p>
  }

  return (
    <section className="coin-grid">
      {state.coins.map((coin, index) => (
        <CoinCard key={coin.id} coin={coin} index={index} />
      ))}
    </section>
  )
}
