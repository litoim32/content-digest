/** Fixed topic taxonomy shared across the app (mirrors the API's categories). */
export type Category =
  | 'Technology'
  | 'Business'
  | 'Science'
  | 'Health'
  | 'Politics'
  | 'Sports'
  | 'Culture'
  | 'Other'

/** The digest the AI produces for one article (POST /api/digest). */
export interface DigestResult {
  summary: string
  keyPoints: string[]
  tags: string[]
  category: Category
}

/** A stored digest card as returned by the API. */
export interface DigestCard extends DigestResult {
  id: string
  url: string
  title: string
  /** Creation time as epoch ms. */
  createdAt: number
}

/** Payload to create a card (server assigns id + createdAt). */
export type NewCard = Omit<DigestCard, 'id' | 'createdAt'>
