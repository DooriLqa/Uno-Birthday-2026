import { useEffect, useState } from 'react'
import { useProgressStore } from '@/features/game-progress/model/store'
import { searchItems } from '../model/items'
import { BeachSearchChecklist } from './BeachSearchChecklist'
import { BeachSearchField } from './BeachSearchField'
import './BeachSearchGame.css'

type Props = { onComplete: () => void }

const gameId = 'beach-search'
const emptyFoundIds: string[] = []

export function BeachSearchGame({ onComplete }: Props) {
  const savedFoundIds = useProgressStore((state) => state.foundItemsByGame[gameId] ?? emptyFoundIds)
  const findItem = useProgressStore((state) => state.findItem)
  const [foundIds, setFoundIds] = useState(savedFoundIds)

  useEffect(() => {
    document.body.classList.add('has-beach-search')
    return () => document.body.classList.remove('has-beach-search')
  }, [])

  const handleFind = (itemId: string) => {
    if (foundIds.includes(itemId)) return
    const nextFoundIds = [...foundIds, itemId]
    setFoundIds(nextFoundIds)
    findItem(gameId, itemId)
    if (nextFoundIds.length === searchItems.length) onComplete()
  }

  return (
    <section className="beach-search-game" aria-label="Игра поиска предметов">
      <BeachSearchField items={searchItems} foundIds={foundIds} onFind={handleFind} />
      <BeachSearchChecklist items={searchItems} foundIds={foundIds} />
    </section>
  )
}
