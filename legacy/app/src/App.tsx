import { useState } from 'react'
import { greeting } from '@/greeting'
import ContentDigest from '@/components/ContentDigest'
import CryptoDashboard from '@/components/CryptoDashboard'
import './App.css'

type View = 'digest' | 'crypto'

export default function App() {
  const [view, setView] = useState<View>('digest')

  return (
    <main className="app">
      <header className="app__header">
        <h1 className="app__title">
          <span className="app__rocket">🚀</span> {greeting('webapp')}
        </h1>
        <p className="app__tagline">
          {view === 'digest'
            ? 'Paste an article → get a tidy digest card ✨'
            : 'Top cryptocurrencies by market cap ✨'}
        </p>
        <nav className="app__nav" aria-label="Views">
          <button
            type="button"
            className={`app__tab ${view === 'digest' ? 'is-active' : ''}`}
            onClick={() => setView('digest')}
            aria-pressed={view === 'digest'}
          >
            📰 Digest
          </button>
          <button
            type="button"
            className={`app__tab ${view === 'crypto' ? 'is-active' : ''}`}
            onClick={() => setView('crypto')}
            aria-pressed={view === 'crypto'}
          >
            🪙 Crypto
          </button>
        </nav>
      </header>
      {view === 'digest' ? <ContentDigest /> : <CryptoDashboard />}
    </main>
  )
}
