import { describe, it, expect } from 'vitest'
import { summarize, splitSentences, deriveTitle } from '@/digest/digest'

describe('deriveTitle', () => {
  it('uses the first non-empty line of the text', () => {
    expect(deriveTitle('', '\n  Breaking news headline\nbody text')).toBe('Breaking news headline')
  })

  it('falls back to the URL hostname without www', () => {
    expect(deriveTitle('https://www.example.com/a/b', '   ')).toBe('example.com')
  })

  it('falls back to Untitled with no text and no valid URL', () => {
    expect(deriveTitle('not a url', '')).toBe('Untitled')
  })

  it('truncates very long titles with an ellipsis', () => {
    const title = deriveTitle('', 'x'.repeat(200))
    expect(title.length).toBeLessThanOrEqual(80)
    expect(title.endsWith('…')).toBe(true)
  })
})

describe('splitSentences', () => {
  it('splits on . ! ? … and trims', () => {
    expect(splitSentences('One. Two! Three? Four…')).toEqual(['One.', 'Two!', 'Three?', 'Four…'])
  })

  it('collapses whitespace and drops empties', () => {
    expect(splitSentences('  A sentence.\n\n  Another one.  ')).toEqual([
      'A sentence.',
      'Another one.',
    ])
  })

  it('returns [] for empty input', () => {
    expect(splitSentences('   ')).toEqual([])
  })
})

describe('summarize', () => {
  it('returns empty result for blank text', () => {
    expect(summarize('   ')).toEqual({ summary: '', keyPoints: [], tags: [], category: 'Other' })
  })

  it('uses the single sentence as the summary with no key points', () => {
    const r = summarize('A lone sentence about gardens.')
    expect(r.summary).toBe('A lone sentence about gardens.')
    expect(r.keyPoints).toEqual([])
  })

  it('caps the summary at three sentences and key points come from the text', () => {
    const text =
      'Renewable energy adoption is accelerating worldwide. ' +
      'Solar power costs have fallen sharply over the past decade. ' +
      'Wind energy now supplies a large share of new capacity. ' +
      'Battery storage helps balance the renewable grid. ' +
      'Governments offer incentives to speed the energy transition. ' +
      'Critics warn about the cost of grid upgrades.'
    const r = summarize(text)
    expect(splitSentences(r.summary).length).toBeLessThanOrEqual(3)
    const sentences = splitSentences(text)
    for (const point of r.keyPoints) {
      expect(sentences).toContain(point)
    }
    // Summary and key points are disjoint.
    const summarySet = new Set(splitSentences(r.summary))
    for (const point of r.keyPoints) expect(summarySet.has(point)).toBe(false)
  })

  it('derives lowercase frequency tags, excluding stopwords, capped at five', () => {
    const text =
      'Coffee is great. Coffee fuels mornings. Coffee shops are everywhere. ' +
      'Espresso and latte are popular. Tea is an alternative.'
    const r = summarize(text)
    expect(r.tags.length).toBeLessThanOrEqual(5)
    expect(r.tags[0]).toBe('coffee')
    expect(r.tags).not.toContain('is')
    expect(r.tags.every((t) => t === t.toLowerCase())).toBe(true)
  })

  it('suggests a category from the content', () => {
    expect(summarize('The football team won the championship match.').category).toBe('Sports')
  })

  it('is deterministic', () => {
    const text = 'Markets rose today. Investors bought stock. The economy grew.'
    expect(summarize(text)).toEqual(summarize(text))
  })
})
