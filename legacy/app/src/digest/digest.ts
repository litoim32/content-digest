import type { DigestResult } from '@/digest/types'
import { tokenize, STOPWORDS } from '@/digest/text'
import { suggestCategory } from '@/digest/board'

const MIN_WORD_LEN = 3
const SUMMARY_MAX = 3
const KEYPOINTS_MAX = 5
const TAGS_MAX = 5

const TITLE_MAX = 80

function truncate(text: string, max: number): string {
  return text.length <= max ? text : `${text.slice(0, max - 1).trimEnd()}…`
}

/** A display title for a card: the first non-empty line of the pasted text,
 *  else the URL's hostname (without `www.`), else `Untitled`. Pure. */
export function deriveTitle(url: string, text: string): string {
  const firstLine = (text.split('\n').find((line) => line.trim().length > 0) ?? '').trim()
  if (firstLine.length > 0) return truncate(firstLine, TITLE_MAX)
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return 'Untitled'
  }
}

/** Split text into trimmed, non-empty sentences on `.`, `!`, `?`, `…`. */
export function splitSentences(text: string): string[] {
  return text
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?…])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
}

/** Content tokens of a piece of text: long enough and not a stopword. */
function contentTokens(text: string): string[] {
  return tokenize(text).filter((t) => t.length >= MIN_WORD_LEN && !STOPWORDS.has(t))
}

/** Frequency of each content word across the whole text. */
function wordFrequencies(text: string): Map<string, number> {
  const freq = new Map<string, number>()
  for (const token of contentTokens(text)) {
    freq.set(token, (freq.get(token) ?? 0) + 1)
  }
  return freq
}

/** Average content-word frequency of a sentence (longer filler doesn't win). */
function scoreSentence(sentence: string, freq: Map<string, number>): number {
  const tokens = contentTokens(sentence)
  if (tokens.length === 0) return 0
  let sum = 0
  for (const token of tokens) sum += freq.get(token) ?? 0
  return sum / tokens.length
}

/** Small lead bias: the opening sentences often carry the gist. */
function positionBoost(index: number): number {
  if (index === 0) return 0.15
  if (index === 1) return 0.05
  return 0
}

/** Top content words by frequency, ties broken by code-point order. */
function topTags(freq: Map<string, number>): string[] {
  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0))
    .slice(0, TAGS_MAX)
    .map((entry) => entry[0])
}

/**
 * Local, deterministic extractive summarizer. Picks the highest-scoring
 * sentences for a short summary, the next-best ones as key points, derives
 * frequency tags, and suggests a category. No network, no clock, no randomness.
 */
export function summarize(text: string): DigestResult {
  const clean = text.trim()
  if (clean.length === 0) {
    return { summary: '', keyPoints: [], tags: [], category: 'Other' }
  }

  const sentences = splitSentences(clean)
  const freq = wordFrequencies(clean)

  const ranked = sentences
    .map((sentence, index) => ({
      sentence,
      index,
      score: scoreSentence(sentence, freq) + positionBoost(index),
    }))
    .sort((a, b) => b.score - a.score || a.index - b.index)

  const summaryCount = Math.min(SUMMARY_MAX, sentences.length)
  const summarySentences = ranked.slice(0, summaryCount)
  // Restore original reading order for the summary.
  const summary = [...summarySentences]
    .sort((a, b) => a.index - b.index)
    .map((r) => r.sentence)
    .join(' ')

  const keyPointCount = Math.min(KEYPOINTS_MAX, Math.max(0, sentences.length - summaryCount))
  const keyPoints = ranked.slice(summaryCount, summaryCount + keyPointCount).map((r) => r.sentence)

  return {
    summary,
    keyPoints,
    tags: topTags(freq),
    category: suggestCategory(clean),
  }
}
