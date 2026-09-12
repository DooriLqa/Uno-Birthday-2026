import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useInventoryStore } from '@/features/inventory/model/store'
import {
  BOOKS,
  completedCabinets,
  isBookCorrect,
  LETTER_PAGE,
  NOTE_PAGE,
  pageId,
  placeBook,
} from './config'

function award(id: string, name: string, icon = '📄') {
  const inventory = useInventoryStore.getState()
  if (!inventory.items.some((item) => item.id === id)) inventory.addItem({ id, name, icon })
}
function syncRewards(state: State) {
  // Remove obsolete rewards from the previous puzzle, preserving other inventory items.
  const valid = new Set(state.rewarded.map(pageId))
  if (state.finished) {
    valid.add(LETTER_PAGE)
    valid.add(NOTE_PAGE)
  }
  const inventory = useInventoryStore.getState()
  inventory.items
    .filter((item) => item.id.startsWith('beach-library-') && !valid.has(item.id))
    .forEach((item) => inventory.removeItem(item.id, item.quantity ?? 1))
  state.rewarded.forEach((page) => award(pageId(page), 'Страница из книги'))
  if (state.finished) {
    award(LETTER_PAGE, 'Лист с текстом', '🔤')
    award(NOTE_PAGE, 'Письмо из библиотеки', '📜')
  }
}
type State = {
  slots: (number | null)[]
  rewarded: number[]
  discovered: number[]
  finished: boolean
  librarianIntroduced: boolean
  introduceLibrarian: () => void
  enter: () => void
  place: (book: number, slot: number) => string[] | null
}
export const useLibraryStore = create<State>()(
  persist(
    (set, get) => ({
      slots: Array(45).fill(null),
      rewarded: [],
      discovered: [],
      finished: false,
      librarianIntroduced: false,
      introduceLibrarian: () => set({ librarianIntroduced: true }),
      enter: () => {
        if (completedCabinets(get().slots).length === 3) {
          set({ rewarded: [0, 1, 2, 3], finished: true })
        }
        syncRewards(get())
      },
      place: (book, slot) => {
        const state = get()
        const slots = placeBook(state.slots, book, slot)
        if (!slots) return null
        const discovered = [...state.discovered]
        const rewarded = [...state.rewarded]
        const rewards: string[] = []
        if (isBookCorrect(book, slot) && !discovered.includes(book)) {
          // Sampling without replacement: all four drops happen within 44 first discoveries.
          const remaining = [0, 1, 2, 3].filter((page) => !rewarded.includes(page))
          if (
            remaining.length &&
            Math.random() < remaining.length / Math.max(1, BOOKS.length - 1 - discovered.length)
          ) {
            const page = remaining[Math.floor(Math.random() * remaining.length)]
            rewarded.push(page)
            rewards.push(pageId(page))
          }
          discovered.push(book)
        }
        const finished = state.finished || completedCabinets(slots).length === 3
        if (finished && !state.finished) {
          // Also handles a partially solved save from the previous puzzle.
          for (const page of [0, 1, 2, 3]) {
            if (!rewarded.includes(page)) {
              rewarded.push(page)
              rewards.push(pageId(page))
            }
          }
          rewards.push(LETTER_PAGE, NOTE_PAGE)
        }
        set({ slots, discovered, rewarded, finished })
        syncRewards(get())
        return rewards
      },
    }),
    {
      name: 'beach-library-v1',
      version: 2,
      migrate: (saved) => ({
        slots: (saved as State).slots,
        rewarded: [],
        discovered: [],
        finished: false,
      }),
    },
  ),
)
