import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type InventoryItem = {
  id: string
  name: string
  icon: string
}

type InventoryState = {
  items: InventoryItem[]
  addItem: (item: InventoryItem) => void
  removeItem: (itemId: string) => void
}

export const useInventoryStore = create<InventoryState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) =>
        set((state) =>
          state.items.some((current) => current.id === item.id)
            ? state
            : { items: [...state.items, item] },
        ),
      removeItem: (itemId) =>
        set((state) => ({ items: state.items.filter((item) => item.id !== itemId) })),
    }),
    { name: 'beach-party-inventory' },
  ),
)
