import type { Category, DigestCard } from '@/digest/types'
import { ALL_CATEGORIES, groupByCategory } from '@/digest/board'
import './DigestBoard.css'

function DigestCardView({
  card,
  onChangeCategory,
  onRemove,
}: {
  card: DigestCard
  onChangeCategory: (id: string, category: Category) => void
  onRemove: (id: string) => void
}) {
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
        <button
          type="button"
          className="digest-card__remove"
          aria-label={`Remove “${card.title}”`}
          onClick={() => onRemove(card.id)}
        >
          ×
        </button>
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

      <footer className="digest-card__foot">
        <label className="digest-card__category">
          <span className="digest-card__category-label">Category</span>
          <select
            value={card.category}
            onChange={(e) => onChangeCategory(card.id, e.target.value as Category)}
          >
            {ALL_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
      </footer>
    </article>
  )
}

export default function DigestBoard({
  cards,
  onChangeCategory,
  onRemove,
}: {
  cards: DigestCard[]
  onChangeCategory: (id: string, category: Category) => void
  onRemove: (id: string) => void
}) {
  if (cards.length === 0) {
    return (
      <p className="digest-empty">
        No digests yet — paste an article above and press <strong>Digest it</strong>. ✨
      </p>
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
              <DigestCardView
                key={card.id}
                card={card}
                onChangeCategory={onChangeCategory}
                onRemove={onRemove}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
