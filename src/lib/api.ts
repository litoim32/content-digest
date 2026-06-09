import type { Category, DigestCard, DigestResult, NewCard } from '@/types'

/**
 * Single place for talking to the backend (`/api/*`): base URL, JSON encoding,
 * and uniform error handling. Same-origin by default; override with
 * `VITE_API_BASE` if the API is hosted elsewhere.
 */
const BASE = import.meta.env.VITE_API_BASE ?? ''

/** Thrown for any non-2xx response or network failure. `status` is 0 for the latter. */
export class ApiError extends Error {
  readonly status: number
  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function errorMessage(res: Response): Promise<string> {
  try {
    const body: unknown = await res.json()
    if (body && typeof body === 'object' && 'detail' in body) {
      const detail = (body as { detail: unknown }).detail
      if (typeof detail === 'string') return detail
    }
  } catch {
    // Non-JSON or empty error body — fall through to a generic message.
  }
  return `Request failed (${res.status})`
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${BASE}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...init,
    })
  } catch {
    throw new ApiError(0, 'Network error — is the API reachable?')
  }
  if (!res.ok) throw new ApiError(res.status, await errorMessage(res))
  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}

/** POST /api/digest — summarize article text into a digest. */
export function digest(text: string, url = ''): Promise<DigestResult> {
  return request<DigestResult>('/api/digest', {
    method: 'POST',
    body: JSON.stringify({ text, url }),
  })
}

/** GET /api/cards — all stored cards (newest-first per the server). */
export function listCards(): Promise<DigestCard[]> {
  return request<DigestCard[]>('/api/cards')
}

/** POST /api/cards — persist a new card; server returns it with id + createdAt. */
export function createCard(card: NewCard): Promise<DigestCard> {
  return request<DigestCard>('/api/cards', {
    method: 'POST',
    body: JSON.stringify(card),
  })
}

/** DELETE /api/cards/{id} — remove a card. */
export function deleteCard(id: string): Promise<void> {
  return request<void>(`/api/cards/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

/** PATCH /api/cards/{id} — change a card's category; returns the updated card. */
export function updateCategory(id: string, category: Category): Promise<DigestCard> {
  return request<DigestCard>(`/api/cards/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify({ category }),
  })
}
