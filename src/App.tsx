import { useState } from 'react'
import type { DigestCard } from '@/types'
import { localDigest, deriveTitle } from '@/lib/localDigest'
import AddDigestForm, { type DigestInput } from '@/components/AddDigestForm'
import DigestBoard from '@/components/DigestBoard'
import './App.css'

function newId(): string {
  const c: Crypto | undefined = globalThis.crypto
  if (c && typeof c.randomUUID === 'function') return c.randomUUID()
  return `c_${Date.now().toString(36)}_${Math.floor(Math.random() * 1e9).toString(36)}`
}

export default function App() {
  const [cards, setCards] = useState<DigestCard[]>([])

  const addEntry = (input: DigestInput) => {
    // Interim: digest locally so the board is usable without a backend.
    // Issue #9 swaps localDigest() for the API call (lib/api.digest).
    const result = localDigest(input.text)
    const card: DigestCard = {
      ...result,
      id: newId(),
      url: input.url,
      title: deriveTitle(input.url, input.text),
      createdAt: Date.now(),
    }
    setCards((prev) => [card, ...prev])
  }

  return (
    <main className="app">
      <header className="app__header">
        <h1 className="app__title">
          <span className="app__icon">📰</span> Content Digest
        </h1>
        <p className="app__tagline">Paste an article → get a tidy digest card ✨</p>
      </header>
      <AddDigestForm onSubmit={addEntry} />
      <DigestBoard cards={cards} />
    </main>
  )
}
