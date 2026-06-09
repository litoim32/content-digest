import { describe, it, expect } from 'vitest'
import type { Category, DigestCard } from '@/digest/types'
import {
  CATEGORIES,
  suggestCategory,
  sortCards,
  groupByCategory,
  serializeCards,
  parseCards,
} from '@/digest/board'

const card = (over: Partial<DigestCard>): DigestCard => ({
  id: 'id',
  url: '',
  title: 'Title',
  summary: 'Summary.',
  keyPoints: [],
  tags: [],
  category: 'Other',
  createdAt: 0,
  ...over,
})

describe('CATEGORIES', () => {
  it('lists the expected taxonomy ids', () => {
    expect(CATEGORIES.map((c) => c.id)).toEqual([
      'Technology',
      'Business',
      'Science',
      'Health',
      'Politics',
      'Sports',
      'Culture',
    ])
  })
})

describe('suggestCategory', () => {
  const cases: ReadonlyArray<[string, Category]> = [
    ['The football team won the championship match in the league', 'Sports'],
    ['The president and parliament passed a new law after the election', 'Politics'],
    ['New research from scientists studying climate, space and energy', 'Science'],
    ['The doctor at the hospital treated the virus with a new vaccine', 'Health'],
    ['The company reported strong market profit and stock investment', 'Business'],
    ['A new smartphone uses powerful software and digital technology', 'Technology'],
    ['The music festival featured a film and a new album by the artist', 'Culture'],
    ['Президент і парламент ухвалили новий закон після виборів', 'Politics'],
    ['Футбольна збірна виграла матч чемпіонату', 'Sports'],
  ]
  it.each(cases)('routes %j to %s', (text, expected) => {
    expect(suggestCategory(text)).toBe(expected)
  })

  it('returns Other for empty or keyword-free text', () => {
    expect(suggestCategory('')).toBe('Other')
    expect(suggestCategory('lorem ipsum dolor sit amet consectetur')).toBe('Other')
  })
})

describe('sortCards', () => {
  it('orders newest-first by createdAt without mutating input', () => {
    const input = [card({ id: 'old', createdAt: 1 }), card({ id: 'new', createdAt: 9 })]
    expect(sortCards(input).map((c) => c.id)).toEqual(['new', 'old'])
    expect(input.map((c) => c.id)).toEqual(['old', 'new'])
  })
})

describe('groupByCategory', () => {
  it('groups into non-empty sections in taxonomy order with Other last', () => {
    const cards = [
      card({ id: 'a', category: 'Sports', createdAt: 1 }),
      card({ id: 'b', category: 'Technology', createdAt: 2 }),
      card({ id: 'c', category: 'Other', createdAt: 3 }),
    ]
    expect(groupByCategory(cards).map((s) => s.category)).toEqual([
      'Technology',
      'Sports',
      'Other',
    ])
  })

  it('sorts cards newest-first within a section', () => {
    const cards = [
      card({ id: 'old', category: 'Sports', createdAt: 1 }),
      card({ id: 'new', category: 'Sports', createdAt: 5 }),
    ]
    const [section] = groupByCategory(cards)
    expect(section?.cards.map((c) => c.id)).toEqual(['new', 'old'])
  })

  it('omits categories with no cards', () => {
    expect(groupByCategory([card({ category: 'Health' })]).map((s) => s.category)).toEqual([
      'Health',
    ])
  })
})

describe('serializeCards / parseCards', () => {
  it('round-trips a list of cards', () => {
    const cards = [card({ id: '1', category: 'Science', tags: ['x'], keyPoints: ['p'] })]
    expect(parseCards(serializeCards(cards))).toEqual(cards)
  })

  it('returns [] for null, invalid JSON, or a non-array', () => {
    expect(parseCards(null)).toEqual([])
    expect(parseCards('{not json')).toEqual([])
    expect(parseCards('{"a":1}')).toEqual([])
  })

  it('drops malformed entries but keeps valid ones', () => {
    const valid = card({ id: 'ok', category: 'Business' })
    const raw = JSON.stringify([valid, { id: 'bad' }, { ...valid, category: 'Nope' }])
    expect(parseCards(raw)).toEqual([valid])
  })
})
