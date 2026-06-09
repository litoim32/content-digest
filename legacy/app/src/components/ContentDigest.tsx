import { useEffect, useState } from 'react'
import type { Category, DigestCard } from '@/digest/types'
import { parseCards, serializeCards } from '@/digest/board'
import AddDigestForm from '@/components/AddDigestForm'
import DigestBoard from '@/components/DigestBoard'

const STORAGE_KEY = 'content-digest.cards.v1'

function loadCards(): DigestCard[] {
  try {
    return parseCards(localStorage.getItem(STORAGE_KEY))
  } catch {
    return []
  }
}

export default function ContentDigest() {
  const [cards, setCards] = useState<DigestCard[]>(loadCards)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, serializeCards(cards))
    } catch {
      // Storage may be unavailable or full (e.g. private mode / quota) — the
      // board still works for this session; we just can't persist it.
    }
  }, [cards])

  const addCard = (card: DigestCard) => setCards((prev) => [card, ...prev])

  const changeCategory = (id: string, category: Category) =>
    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, category } : c)))

  const removeCard = (id: string) => setCards((prev) => prev.filter((c) => c.id !== id))

  return (
    <>
      <AddDigestForm onAdd={addCard} />
      <DigestBoard cards={cards} onChangeCategory={changeCategory} onRemove={removeCard} />
    </>
  )
}
