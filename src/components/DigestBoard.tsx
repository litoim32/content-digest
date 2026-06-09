import type { DigestCard } from '@/types'
import { groupByCategory } from '@/lib/board'
import './DigestBoard.css'

function DigestCardView({ card }: { card: DigestCard }) {
  return (
    <article className="digest-card">
      <header className="digest-card__head">
        {card.url ? (
          <a className="digest-card__title" href={card.url} target="_blank" rel="noreferrer">
            {card.title}
          </a>
        ) : (
          <span className="digest-card__title">{card.title}</span>
        )}
        <span className="digest-card__badge">{card.category}</span>
      </header>

      {card.summary && <p className="digest-card__summary">{card.summary}</p>}

      {card.keyPoints.length > 0 && (
        <ul className="digest-card__points">
          {card.keyPoints.map((point, i) => (
            <li key={i}>{point}</li>
          ))}
        </ul>
      )}

      {card.tags.length > 0 && (
        <div className="digest-card__tags">
          {card.tags.map((tag) => (
            <span key={tag} className="digest-tag">
              #{tag}
            </span>
          ))}
        </div>
      )}
    </article>
  )
}

export default function DigestBoard({ cards }: { cards: DigestCard[] }) {
  if (cards.length === 0) {
    return (
      <section className="digest-board">
        <p className="digest-empty">
          No digests yet — paste an article above and press <strong>Digest it</strong>. ✨
        </p>
      </section>
    )
  }

  const sections = groupByCategory(cards)

  return (
    <div className="digest-board">
      {sections.map((section) => (
        <section key={section.category} className="digest-section">
          <h2 className="digest-section__title">
            {section.category}
            <span className="digest-section__count">{section.cards.length}</span>
          </h2>
          <div className="digest-section__grid">
            {section.cards.map((card) => (
              <DigestCardView key={card.id} card={card} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
