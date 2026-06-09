import type { Category, DigestCard, Section } from '@/types'

/** Every category, in display order: taxonomy order, then `Other` last. */
export const ALL_CATEGORIES: readonly Category[] = [
  'Technology',
  'Business',
  'Science',
  'Health',
  'Politics',
  'Sports',
  'Culture',
  'Other',
]

/** Newest-first by `createdAt`. Returns a new array (does not mutate input). */
export function sortCards(cards: readonly DigestCard[]): DigestCard[] {
  return [...cards].sort((a, b) => b.createdAt - a.createdAt)
}

/** Group cards into ordered, non-empty sections; cards within a section are
 *  newest-first. Empty categories are omitted. */
export function groupByCategory(cards: readonly DigestCard[]): Section[] {
  const sections: Section[] = []
  for (const category of ALL_CATEGORIES) {
    const inCategory = cards.filter((c) => c.category === category)
    if (inCategory.length > 0) {
      sections.push({ category, cards: sortCards(inCategory) })
    }
  }
  return sections
}
