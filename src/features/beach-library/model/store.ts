import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useInventoryStore } from '@/features/inventory/model/store'
import { completedCabinets, LETTER_PAGE, NOTE_PAGE, pageId, placeBook } from './config'

function award(id: string, name: string, icon = '📄') {
  const inventory = useInventoryStore.getState()
  if (!inventory.items.some((item) => item.id === id)) inventory.addItem({ id, name, icon })
}
type State = {
  slots: (number | null)[]
  rewarded: number[]
  enter: () => void
  place: (book: number, slot: number) => string[] | null
}
export const useLibraryStore = create<State>()(
  persist(
    (set, get) => ({
      slots: Array(45).fill(null),
      rewarded: [],
      enter: () => award(LETTER_PAGE, 'Лист с буквами', '🔤'),
      place: (book, slot) => {
        const state = get()
        const slots = placeBook(state.slots, book, slot)
        if (!slots) return null
        const fresh = completedCabinets(slots).filter(
          (cabinet) => !state.rewarded.includes(cabinet),
        )
        const rewards: string[] = []
        fresh.forEach((_, index) => {
          const order = state.rewarded.length + index
          for (let page = order * 3; page < Math.min(8, order * 3 + 3); page++) {
            const id = pageId(page)
            award(id, `Страница с отверстием ${page + 1}`)
            rewards.push(id)
          }
          if (order === 2) {
            award(NOTE_PAGE, 'Записка библиотекаря', '📜')
            rewards.push(NOTE_PAGE)
          }
        })
        set({ slots, rewarded: [...state.rewarded, ...fresh] })
        return rewards
      },
    }),
    { name: 'beach-library-v1' },
  ),
)
