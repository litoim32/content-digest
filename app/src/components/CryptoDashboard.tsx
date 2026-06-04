import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { getCoins, type Coin } from '@/api/crypto'
import {
  sortByRank,
  formatUsd,
  formatChange,
  isPositiveChange,
} from '@/crypto/cryptoView'

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; coins: Coin[] }

const POSITIVE = '#16a34a'
const NEGATIVE = '#dc2626'

const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '1rem',
  },
  card: {
    border: '1px solid #e5e7eb',
    borderRadius: 12,
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    background: '#fff',
    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
  },
  header: { display: 'flex', alignItems: 'center', gap: '0.5rem' },
  logo: { width: 32, height: 32, borderRadius: '50%' },
  name: { fontWeight: 600, lineHeight: 1.1 },
  symbol: { color: '#6b7280', fontSize: '0.8rem', textTransform: 'uppercase' },
  badge: {
    marginLeft: 'auto',
    fontSize: '0.7rem',
    fontWeight: 600,
    color: '#374151',
    background: '#f3f4f6',
    borderRadius: 999,
    padding: '0.1rem 0.5rem',
  },
  price: { fontSize: '1.25rem', fontWeight: 700 },
  change: { fontWeight: 600 },
} satisfies Record<string, CSSProperties>

function CoinCard({ coin }: { coin: Coin }) {
  const up = isPositiveChange(coin.price_change_percentage_24h)
  return (
    <article style={styles.card}>
      <div style={styles.header}>
        <img style={styles.logo} src={coin.image} alt={`${coin.name} logo`} />
        <div>
          <div style={styles.name}>{coin.name}</div>
          <div style={styles.symbol}>{coin.symbol}</div>
        </div>
        <span style={styles.badge}>#{coin.market_cap_rank}</span>
      </div>
      <div style={styles.price}>{formatUsd(coin.current_price)}</div>
      <div style={{ ...styles.change, color: up ? POSITIVE : NEGATIVE }}>
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
    <section style={styles.grid}>
      {state.coins.map((coin) => (
        <CoinCard key={coin.id} coin={coin} />
      ))}
    </section>
  )
}
