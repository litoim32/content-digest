import type { Category, DigestResult } from '@/types'

/**
 * INTERIM local digest for development/demo only. Produces a quick extractive
 * summary, frequency tags, and a keyword-based category guess so the board is
 * usable without a backend. Replaced by the OpenRouter call (`lib/api.digest`)
 * once the form is wired to the API (#9).
 */

const STOPWORDS = new Set<string>([
  'the', 'a', 'an', 'and', 'or', 'but', 'to', 'of', 'in', 'on', 'for', 'with',
  'is', 'are', 'was', 'were', 'be', 'as', 'that', 'this', 'it', 'its', 'at',
  'by', 'from', 'has', 'have', 'had', 'not', 'will', 'can', 'which', 'their',
  'they', 'we', 'you', 'also', 'said',
  'і', 'й', 'та', 'але', 'що', 'як', 'це', 'на', 'в', 'у', 'з', 'до', 'від',
  'за', 'по', 'про', 'для', 'не', 'є', 'був', 'була', 'було', 'які', 'який',
])

interface CatDef {
  id: Category
  keywords: readonly string[]
}

const CATEGORY_KEYWORDS: readonly CatDef[] = [
  { id: 'Technology', keywords: ['technolog', 'software', 'comput', 'internet', 'digital', 'smartphone', 'cyber', 'algorithm', 'robot', 'штучн', 'технолог', 'програм', 'цифров', 'інтернет', 'смартфон'] },
  { id: 'Business', keywords: ['business', 'market', 'econom', 'company', 'financ', 'stock', 'invest', 'trade', 'bank', 'profit', 'price', 'бізнес', 'ринок', 'економ', 'компан', 'фінанс', 'акці', 'інвест', 'банк', 'ціна'] },
  { id: 'Science', keywords: ['scien', 'research', 'space', 'physic', 'climate', 'energy', 'experiment', 'genetic', 'наук', 'дослідж', 'космос', 'фізик', 'клімат', 'енерг'] },
  { id: 'Health', keywords: ['health', 'medic', 'doctor', 'disease', 'virus', 'vaccin', 'hospital', 'patient', 'здоров', 'медиц', 'лікар', 'хвороб', 'вірус', 'вакцин'] },
  { id: 'Politics', keywords: ['politic', 'government', 'election', 'president', 'minister', 'parliament', 'law', 'sanction', 'military', 'війн', 'політик', 'уряд', 'вибор', 'президент', 'парламент', 'закон', 'санкці', 'військ'] },
  { id: 'Sports', keywords: ['sport', 'football', 'match', 'tournament', 'championship', 'league', 'olympic', 'athlete', 'спорт', 'футбол', 'матч', 'турнір', 'чемпіонат', 'олімп'] },
  { id: 'Culture', keywords: ['culture', 'music', 'film', 'movie', 'book', 'novel', 'festiv', 'theat', 'album', 'artist', 'культур', 'музик', 'фільм', 'кіно', 'книг', 'театр', 'альбом'] },
]

function tokenize(text: string): string[] {
  return text.toLowerCase().match(/[\p{L}][\p{L}\p{N}'’-]*/gu) ?? []
}

/** Split text into trimmed, non-empty sentences on `.`, `!`, `?`, `…`. */
export function splitSentences(text: string): string[] {
  return text
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?…])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
}

/** Keyword-prefix category guess; `Other` when nothing matches. */
export function guessCategory(text: string): Category {
  const tokens = tokenize(text)
  if (tokens.length === 0) return 'Other'
  let best: Category = 'Other'
  let bestScore = 0
  for (const def of CATEGORY_KEYWORDS) {
    let score = 0
    for (const tok of tokens) {
      if (def.keywords.some((k) => tok.startsWith(k))) score += 1
    }
    if (score > bestScore) {
      bestScore = score
      best = def.id
    }
  }
  return best
}

function topTags(text: string): string[] {
  const freq = new Map<string, number>()
  for (const tok of tokenize(text)) {
    if (tok.length < 4 || STOPWORDS.has(tok)) continue
    freq.set(tok, (freq.get(tok) ?? 0) + 1)
  }
  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0))
    .slice(0, 5)
    .map((entry) => entry[0])
}

export function localDigest(text: string): DigestResult {
  const clean = text.trim()
  if (clean.length === 0) return { summary: '', keyPoints: [], tags: [], category: 'Other' }
  const sentences = splitSentences(clean)
  return {
    summary: sentences.slice(0, 3).join(' '),
    keyPoints: sentences.slice(3, 7),
    tags: topTags(clean),
    category: guessCategory(clean),
  }
}

/** First non-empty line of the text, else the URL host, else "Untitled". */
export function deriveTitle(url: string, text: string): string {
  const firstLine = (text.split('\n').find((l) => l.trim().length > 0) ?? '').trim()
  if (firstLine.length > 0) return firstLine.length > 80 ? `${firstLine.slice(0, 79)}…` : firstLine
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return 'Untitled'
  }
}
