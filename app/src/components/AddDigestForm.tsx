import { useState } from 'react'
import type { FormEvent } from 'react'
import type { DigestCard } from '@/digest/types'
import { summarize, deriveTitle } from '@/digest/digest'
import './AddDigestForm.css'

function newId(): string {
  const c: Crypto | undefined = globalThis.crypto
  if (c && typeof c.randomUUID === 'function') return c.randomUUID()
  return `c_${Date.now().toString(36)}_${Math.floor(Math.random() * 1e9).toString(36)}`
}

type FetchState = 'idle' | 'loading' | 'unavailable'

export default function AddDigestForm({ onAdd }: { onAdd: (card: DigestCard) => void }) {
  const [url, setUrl] = useState('')
  const [text, setText] = useState('')
  const [fetchState, setFetchState] = useState<FetchState>('idle')

  // Optional convenience: ask the dev-only /api/extract middleware to fetch and
  // clean the article text. Absent in production build / preview — degrades to
  // manual paste with a hint (see ADR 004).
  const fetchFromUrl = async () => {
    const target = url.trim()
    if (target.length === 0) return
    setFetchState('loading')
    try {
      const res = await fetch(`/api/extract?url=${encodeURIComponent(target)}`)
      if (!res.ok) throw new Error(`status ${res.status}`)
      const data: unknown = await res.json()
      const fetched =
        typeof data === 'object' && data !== null && typeof (data as { text?: unknown }).text === 'string'
          ? (data as { text: string }).text
          : ''
      if (fetched.trim().length === 0) throw new Error('empty')
      setText(fetched)
      setFetchState('idle')
    } catch {
      setFetchState('unavailable')
    }
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const clean = text.trim()
    if (clean.length === 0) return
    const result = summarize(clean)
    onAdd({
      ...result,
      id: newId(),
      url: url.trim(),
      title: deriveTitle(url, clean),
      createdAt: Date.now(),
    })
    setUrl('')
    setText('')
    setFetchState('idle')
  }

  return (
    <form className="digest-form" onSubmit={handleSubmit}>
      <div className="digest-form__url-row">
        <input
          className="digest-form__url"
          type="url"
          placeholder="Article URL (optional — saved as the card's source link)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button
          type="button"
          className="digest-form__fetch"
          onClick={() => void fetchFromUrl()}
          disabled={url.trim().length === 0 || fetchState === 'loading'}
        >
          {fetchState === 'loading' ? 'Fetching…' : 'Fetch text'}
        </button>
      </div>

      {fetchState === 'unavailable' && (
        <p className="digest-form__hint">
          Couldn’t auto-fetch (works only while the dev server is running). Paste the article text
          below instead.
        </p>
      )}

      <textarea
        className="digest-form__text"
        placeholder="Paste the article text here…"
        rows={6}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <button type="submit" className="digest-form__submit" disabled={text.trim().length === 0}>
        ✨ Digest it
      </button>
    </form>
  )
}
