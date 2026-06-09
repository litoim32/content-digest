import { useState } from 'react'
import AddDigestForm, { type DigestInput } from '@/components/AddDigestForm'
import DigestBoard from '@/components/DigestBoard'
import './App.css'

export default function App() {
  // Interim: hold raw captured inputs so the form's callback is observable.
  // Issue #5 turns each into a real digest; issue #3 groups them into a board.
  const [entries, setEntries] = useState<DigestInput[]>([])

  const addEntry = (input: DigestInput) => setEntries((prev) => [input, ...prev])

  return (
    <main className="app">
      <header className="app__header">
        <h1 className="app__title">
          <span className="app__icon">📰</span> Content Digest
        </h1>
        <p className="app__tagline">Paste an article → get a tidy digest card ✨</p>
      </header>
      <AddDigestForm onSubmit={addEntry} />
      <DigestBoard entries={entries} />
    </main>
  )
}
