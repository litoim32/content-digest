import { useEffect, useState } from 'react'
import { getMarketChart, HttpError, type Coin, type PricePoint } from '@/api/crypto'
import { priceRange, buildLinePath, formatUsd } from '@/crypto/cryptoView'
import './CoinChartModal.css'

type ChartState =
  | { status: 'loading' }
  | { status: 'error'; rateLimited: boolean }
  | { status: 'ready'; points: PricePoint[] }

const POSITIVE = '#16a34a'
const NEGATIVE = '#dc2626'

// SVG drawing box (rendered responsively via viewBox + width: 100%).
const W = 560
const H = 240
const PAD = 12

function Chart({ points }: { points: PricePoint[] }) {
  if (points.length === 0) {
    return <p className="coin-modal__message">No price data for the last 30 days.</p>
  }

  const { high, low } = priceRange(points)
  const path = buildLinePath(points, W, H, PAD)
  const first = points.at(0)
  const last = points.at(-1)
  const up = first && last ? last[1] >= first[1] : true
  const stroke = up ? POSITIVE : NEGATIVE

  return (
    <>
      <svg
        className="coin-modal__chart"
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="30-day price line chart"
        preserveAspectRatio="none"
      >
        <polyline points={path} fill="none" stroke={stroke} strokeWidth={2} />
      </svg>
      <dl className="coin-modal__stats">
        <div>
          <dt>30d high</dt>
          <dd>{formatUsd(high)}</dd>
        </div>
        <div>
          <dt>30d low</dt>
          <dd>{formatUsd(low)}</dd>
        </div>
      </dl>
    </>
  )
}

export default function CoinChartModal({
  coin,
  onClose,
}: {
  coin: Coin
  onClose: () => void
}) {
  const [state, setState] = useState<ChartState>({ status: 'loading' })

  useEffect(() => {
    const controller = new AbortController()
    getMarketChart(coin.id, controller.signal)
      .then((points) => setState({ status: 'ready', points }))
      .catch((err: unknown) => {
        if (controller.signal.aborted) return
        const rateLimited = err instanceof HttpError && err.status === 429
        setState({ status: 'error', rateLimited })
      })
    return () => controller.abort()
  }, [coin.id])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="coin-modal__backdrop" onClick={onClose}>
      <div
        className="coin-modal"
        role="dialog"
        aria-modal="true"
        aria-label={`${coin.name} 30-day price chart`}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="coin-modal__header">
          <img className="coin-modal__logo" src={coin.image} alt="" />
          <h2 className="coin-modal__title">{coin.name}</h2>
          <button
            type="button"
            className="coin-modal__close"
            onClick={onClose}
            aria-label="Close"
            autoFocus
          >
            ×
          </button>
        </header>

        {state.status === 'loading' && (
          <p className="coin-modal__message">Loading 30-day chart…</p>
        )}
        {state.status === 'error' && (
          <p className="coin-modal__message">
            {state.rateLimited
              ? 'CoinGecko’s free tier is rate-limiting chart requests right now. ' +
                'Please try again in a minute.'
              : `Couldn’t load the chart for ${coin.name}. Please try again in a moment.`}
          </p>
        )}
        {state.status === 'ready' && <Chart points={state.points} />}
      </div>
    </div>
  )
}
