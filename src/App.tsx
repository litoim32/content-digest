import DigestBoard from '@/components/DigestBoard'
import './App.css'

export default function App() {
  return (
    <main className="app">
      <header className="app__header">
        <h1 className="app__title">
          <span className="app__icon">📰</span> Content Digest
        </h1>
        <p className="app__tagline">Paste an article → get a tidy digest card ✨</p>
      </header>
      {/* The add-article form (issue #12) and the live topic board (issues #2/#3)
          land here. For now the board renders its empty state. */}
      <DigestBoard />
    </main>
  )
}
