import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import inventoryPickupSound from '@/shared/assets/common/audio/camping-tent-straightening.mp3'
import { audioController } from '@/shared/lib/audio/audioController'
import { BOOK_ITEMS } from './items'

export type InventoryRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
export type InventoryItemKind = 'item' | 'book'

export type InventoryItem = {
  id: string
  name: string
  icon: string
  kind?: InventoryItemKind
  quantity?: number
  rarity?: InventoryRarity
  inspectable?: boolean
  description?: string
  pages?: readonly string[]
}

type InventoryState = {
  items: InventoryItem[]
  previewItemId: string | null
  addItem: (item: InventoryItem) => number
  removeItem: (itemId: string, amount?: number) => void
  openItemPreview: (itemId: string) => void
  closeItemPreview: () => void
}

const LEGACY_TRAVEL_BOOK_ID = 'dog-island-travel-book'

const withDefaultBooks = (items: InventoryItem[]) => {
  const currentItems = items.filter((item) => item.id !== LEGACY_TRAVEL_BOOK_ID)
  const currentIds = new Set(currentItems.map((item) => item.id))
  return [...currentItems, ...BOOK_ITEMS.filter((book) => !currentIds.has(book.id))]
}

export const useInventoryStore = create<InventoryState>()(
  persist(
    (set, get) => ({
      items: withDefaultBooks([]),
      previewItemId: null,
      addItem: (item) => {
        const current = get().items.find((entry) => entry.id === item.id)
        const nextQuantity = (current?.quantity ?? (current ? 1 : 0)) + (item.quantity ?? 1)
        const shouldInspect = item.inspectable ?? current?.inspectable ?? false
        set((state) => ({
          items: current
            ? state.items.map((entry) =>
                entry.id === item.id ? { ...entry, ...item, quantity: nextQuantity } : entry,
              )
            : [...state.items, { ...item, quantity: item.quantity ?? 1 }],
          previewItemId: shouldInspect ? item.id : state.previewItemId,
        }))
        audioController.playOneShot(inventoryPickupSound)
        return nextQuantity
      },
      removeItem: (itemId, amount = 1) =>
        set((state) => ({
          items: state.items
            .map((item) =>
              item.id === itemId
                ? { ...item, quantity: Math.max(0, (item.quantity ?? 1) - amount) }
                : item,
            )
            .filter((item) => (item.quantity ?? 1) > 0),
        })),
      openItemPreview: (itemId) => set({ previewItemId: itemId }),
      closeItemPreview: () => set({ previewItemId: null }),
    }),
    {
      name: 'beach-party-inventory',
      version: 1,
      partialize: (state) => ({ items: state.items }),
      migrate: (persistedState) => {
        const state = persistedState as Partial<InventoryState>
        return { ...state, items: withDefaultBooks(state.items ?? []) }
      },
    },
  ),
)
