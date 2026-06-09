/** The fixed topic taxonomy used for board sections and category suggestions. */
export type Category =
  | 'Technology'
  | 'Business'
  | 'Science'
  | 'Health'
  | 'Politics'
  | 'Sports'
  | 'Culture'
  | 'Other'

/** Output of the (local, deterministic) summarizer for one article's text. */
export interface DigestResult {
  /** A short 2–3 sentence summary, sentences in original order. */
  summary: string
  /** Distinct salient sentences, rendered as bullets. */
  keyPoints: string[]
  /** Lowercased, deduped keyword tags. */
  tags: string[]
  /** The suggested category (caller may override on the card). */
  category: Category
}

/** A digested article as it lives on the board and in localStorage. */
export interface DigestCard extends DigestResult {
  /** Stable unique id. */
  id: string
  /** Source link (may be empty when the user pasted text without a URL). */
  url: string
  /** Display title (derived from the URL host/path or the first line of text). */
  title: string
  /** Creation time as epoch ms — supplied by the caller, kept out of pure logic. */
  createdAt: number
}

/** A non-empty group of cards sharing one category, for board rendering. */
export interface Section {
  category: Category
  cards: DigestCard[]
}
