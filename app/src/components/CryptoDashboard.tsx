import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { getCoins, type Coin } from '@/api/crypto'
import {
  sortByRank,
  formatUsd,
  formatChange,
  isPositiveChange,
  formatClock,
} from '@/crypto/cryptoView'
import CoinChartModal from '@/components/CoinChartModal'
import './CryptoDashboard.css'

const POSITIVE = '#16a34a'
const NEGATIVE = '#dc2626'

// Auto-refresh cadence.
const REFRESH_MS = 60_000

// Cap the cascade so later cards don't wait too long to appear.
const STAGGER_STEP_MS = 40
const STAGGER_MAX_STEPS = 12

function CoinCard({
  coin,
  index,
  onSelect,
}: {
  coin: Coin
  index: number
  onSelect: (coin: Coin) => void
}) {
  const up = isPositiveChange(coin.price_change_percentage_24h)
  const delayMs = Math.min(index, STAGGER_MAX_STEPS) * STAGGER_STEP_MS
  // Custom property consumed by .coin-card's animation-delay.
  const enterDelay = { '--enter-delay': `${delayMs}ms` } as CSSProperties
  return (
    <article
      className="coin-card"
      style={enterDelay}
      role="button"
      tabIndex={0}
      aria-label={`Show 30-day price chart for ${coin.name}`}
      onClick={() => onSelect(coin)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect(coin)
        }
      }}
    >
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
  // `coins === null` means we have never loaded successfully yet. Once we have
  // data we keep showing it across refreshes, so the screen never goes blank.
  const [coins, setCoins] = useState<Coin[] | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [refreshing, setRefreshing] = useState(true)
  const [refreshFailed, setRefreshFailed] = useState(false)
  const [selected, setSelected] = useState<Coin | null>(null)

  useEffect(() => {
    let cancelled = false
    let controller: AbortController | null = null

    const load = () => {
      controller?.abort()
      const ctrl = new AbortController()
      controller = ctrl
      setRefreshing(true)
      getCoins(ctrl.signal)
        .then((data) => {
          if (cancelled) return
          setCoins(sortByRank(data))
          setLastUpdated(new Date())
          setRefreshFailed(false)
        })
        .catch((err: unknown) => {
          if (cancelled || ctrl.signal.aborted) return
          setRefreshFailed(true)
          void err
        })
        .finally(() => {
          if (!cancelled) setRefreshing(false)
        })
    }

    let intervalId: ReturnType<typeof setInterval> | null = null
    const startInterval = () => {
      if (intervalId === null) intervalId = setInterval(load, REFRESH_MS)
    }
    const stopInterval = () => {
      if (intervalId !== null) {
        clearInterval(intervalId)
        intervalId = null
      }
    }

    // Pause polling while the tab is hidden; resume with an immediate refresh.
    const onVisibilityChange = () => {
      if (document.hidden) {
        stopInterval()
        controller?.abort()
      } else {
        load()
        startInterval()
      }
    }

    load()
    startInterval()
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      cancelled = true
      controller?.abort()
      stopInterval()
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [])

  // Very first load only — no prior data to keep on screen.
  if (coins === null) {
    return refreshFailed ? (
      <p style={{ color: NEGATIVE }}>Could not load coins. Retrying every 60s…</p>
    ) : (
      <p>Loading top coins…</p>
    )
  }

  return (
    <>
      <div className="coin-status" aria-live="polite">
        <span className="coin-status__time">
          Last updated {lastUpdated ? formatClock(lastUpdated) : '—'}
        </span>
        {refreshing && (
          <span className="coin-status__refresh">
            <span className="coin-spinner" aria-hidden="true" />
            Refreshing…
          </span>
        )}
        {refreshFailed && !refreshing && (
          <span className="coin-status__error">Refresh failed — showing last data</span>
        )}
      </div>
      <section className="coin-grid">
        {coins.map((coin, index) => (
          <CoinCard key={coin.id} coin={coin} index={index} onSelect={setSelected} />
        ))}
      </section>
      {selected && <CoinChartModal coin={selected} onClose={() => setSelected(null)} />}
    </>
  )
}
