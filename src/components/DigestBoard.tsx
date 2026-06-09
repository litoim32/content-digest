import type { DigestInput } from '@/components/AddDigestForm'
import './DigestBoard.css'

/** First non-empty line of the text, else the URL host, else "Untitled". */
function previewTitle(input: DigestInput): string {
  const firstLine = (input.text.split('\n').find((l) => l.trim().length > 0) ?? '').trim()
  if (firstLine.length > 0) return firstLine.length > 80 ? `${firstLine.slice(0, 79)}…` : firstLine
  try {
    return new URL(input.url).hostname.replace(/^www\./, '')
  } catch {
    return 'Untitled'
  }
}

/**
 * Topic board. Interim (issues #1/#12): lists the raw captured inputs so the
 * capture flow is observable. Issue #3 replaces this with real digest cards
 * (summary/points/tags) grouped into category sections.
 */
export default function DigestBoard({ entries }: { entries: DigestInput[] }) {
  if (entries.length === 0) {
    return (
      <section className="digest-board">
        <p className="digest-empty">
          No digests yet — paste an article above and press <strong>Digest it</strong>. ✨
        </p>
      </section>
    )
  }

  return (
    <section className="digest-board">
      <h2 className="digest-board__heading">
        Captured
        <span className="digest-board__count">{entries.length}</span>
      </h2>
      <div className="digest-board__grid">
        {entries.map((entry, i) => (
          <article key={i} className="digest-card">
            {entry.url ? (
              <a className="digest-card__title" href={entry.url} target="_blank" rel="noreferrer">
                {previewTitle(entry)}
              </a>
            ) : (
              <span className="digest-card__title">{previewTitle(entry)}</span>
            )}
            <p className="digest-card__snippet">
              {entry.text.length > 200 ? `${entry.text.slice(0, 200)}…` : entry.text}
            </p>
          </article>
        ))}
      </div>
    </section>
  )
}
