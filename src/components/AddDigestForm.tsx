import { useState } from 'react'
import type { FormEvent } from 'react'
import './AddDigestForm.css'

/** What the form hands up to its parent on submit. */
export interface DigestInput {
  /** Source link (may be empty — text is what matters). */
  url: string
  /** The pasted article text (guaranteed non-empty). */
  text: string
}

/**
 * Capture form (issue #12): optional URL + article text. Purely presentational —
 * it validates that text is present and hands the input up via `onSubmit`. The
 * AI call (#5) and the live board (#3) consume this later.
 */
export default function AddDigestForm({ onSubmit }: { onSubmit: (input: DigestInput) => void }) {
  const [url, setUrl] = useState('')
  const [text, setText] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const clean = text.trim()
    if (clean.length === 0) return
    onSubmit({ url: url.trim(), text: clean })
    setUrl('')
    setText('')
  }

  return (
    <form className="digest-form" onSubmit={handleSubmit}>
      <input
        className="digest-form__url"
        type="url"
        placeholder="Article URL (optional — saved as the card's source link)"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
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
