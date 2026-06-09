import type { Category, DigestCard, Section } from '@/digest/types'
import { tokenize } from '@/digest/text'

interface CategoryDef {
  id: Category
  /** Lowercased stems; a token matches by prefix (covers EN suffixes + UA cases). */
  keywords: readonly string[]
}

/** Topic taxonomy. `Other` is the implicit fallback and has no keywords. */
export const CATEGORIES: readonly CategoryDef[] = [
  {
    id: 'Technology',
    keywords: [
      'technolog', 'software', 'comput', 'internet', 'digital', 'startup',
      'smartphone', 'gadget', 'cyber', 'algorithm', 'robot', 'app ',
      'технолог', 'програм', 'цифров', 'інтернет', 'смартфон', 'гаджет',
      'штучн', 'алгоритм', 'робот',
    ],
  },
  {
    id: 'Business',
    keywords: [
      'business', 'market', 'econom', 'company', 'financ', 'stock', 'invest',
      'trade', 'bank', 'profit', 'revenue', 'price',
      'бізнес', 'ринок', 'економ', 'компан', 'фінанс', 'акці', 'інвест',
      'торгів', 'банк', 'прибут', 'дохід', 'ціна', 'гривн', 'долар', 'підприєм',
    ],
  },
  {
    id: 'Science',
    keywords: [
      'scien', 'research', 'space', 'physic', 'chemis', 'biolog', 'climate',
      'energy', 'experiment', 'astro', 'genetic', 'planet',
      'наук', 'дослідж', 'космос', 'фізик', 'хімі', 'біолог', 'клімат',
      'енерг', 'експеримент', 'генет', 'планет',
    ],
  },
  {
    id: 'Health',
    keywords: [
      'health', 'medic', 'doctor', 'disease', 'virus', 'covid', 'vaccin',
      'hospital', 'patient', 'cancer', 'clinic', 'surgery', 'symptom',
      'здоров', 'медиц', 'лікар', 'хвороб', 'вірус', 'вакцин', 'пацієнт',
      'онколог', 'клінік', 'симптом',
    ],
  },
  {
    id: 'Politics',
    keywords: [
      'politic', 'government', 'election', 'president', 'minister', 'parliament',
      'senate', 'policy', 'diplomat', 'sanction', 'military', 'troops',
      'conflict', 'law',
      'політик', 'уряд', 'вибор', 'президент', 'міністр', 'парламент', 'закон',
      'голосуван', 'санкці', 'військ', 'війн', 'депутат', 'посол',
    ],
  },
  {
    id: 'Sports',
    keywords: [
      'sport', 'football', 'soccer', 'basketball', 'tennis', 'match',
      'tournament', 'championship', 'olympic', 'league', 'athlete', 'coach',
      'спорт', 'футбол', 'баскетбол', 'теніс', 'матч', 'турнір', 'чемпіонат',
      'олімп', 'гравец', 'тренер', 'збірн',
    ],
  },
  {
    id: 'Culture',
    keywords: [
      'culture', 'cultural', 'music', 'film', 'movie', 'cinema', 'book',
      'novel', 'author', 'festiv', 'theat', 'album', 'paint', 'gallery',
      'artist', 'concert',
      'культур', 'мистецтв', 'музик', 'фільм', 'кіно', 'книг', 'роман',
      'письменник', 'фестивал', 'театр', 'альбом', 'актор', 'концерт', 'виставк',
    ],
  },
]

/** Every category, in display order: taxonomy order, then `Other` last.
 *  Used for section ordering and the card's category dropdown. */
export const ALL_CATEGORIES: readonly Category[] = [...CATEGORIES.map((c) => c.id), 'Other']

/** Suggest a category by counting tokens whose prefix matches a category's
 *  keyword stems. Ties go to the earliest category in `CATEGORIES`; no matches
 *  (or empty text) yields `Other`. */
export function suggestCategory(text: string): Category {
  const tokens = tokenize(text)
  if (tokens.length === 0) return 'Other'

  let best: Category = 'Other'
  let bestScore = 0
  for (const def of CATEGORIES) {
    let score = 0
    for (const tok of tokens) {
      if (def.keywords.some((k) => tok.startsWith(k.trim()))) score += 1
    }
    if (score > bestScore) {
      bestScore = score
      best = def.id
    }
  }
  return best
}

/** Newest-first by `createdAt`. Returns a new array (does not mutate input). */
export function sortCards(cards: readonly DigestCard[]): DigestCard[] {
  return [...cards].sort((a, b) => b.createdAt - a.createdAt)
}

/** Group cards into ordered, non-empty sections; cards within a section are
 *  newest-first. */
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

function isCategory(value: unknown): value is Category {
  return typeof value === 'string' && (ALL_CATEGORIES as readonly string[]).includes(value)
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((v) => typeof v === 'string')
}

function isCard(value: unknown): value is DigestCard {
  if (typeof value !== 'object' || value === null) return false
  const c = value as Record<string, unknown>
  return (
    typeof c.id === 'string' &&
    typeof c.url === 'string' &&
    typeof c.title === 'string' &&
    typeof c.summary === 'string' &&
    isStringArray(c.keyPoints) &&
    isStringArray(c.tags) &&
    isCategory(c.category) &&
    typeof c.createdAt === 'number'
  )
}

/** Serialize cards for localStorage. */
export function serializeCards(cards: readonly DigestCard[]): string {
  return JSON.stringify(cards)
}

/** Parse cards from a localStorage string, dropping any malformed entries.
 *  Never throws — returns `[]` on null/invalid input. */
export function parseCards(raw: string | null): DigestCard[] {
  if (!raw) return []
  try {
    const data: unknown = JSON.parse(raw)
    if (!Array.isArray(data)) return []
    return data.filter(isCard)
  } catch {
    return []
  }
}
