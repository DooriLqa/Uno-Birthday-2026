import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type InventoryRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'

export type InventoryItem = {
  id: string
  name: string
  icon: string
  quantity?: number
  rarity?: InventoryRarity
}

type InventoryState = {
  items: InventoryItem[]
  addItem: (item: InventoryItem) => number
  removeItem: (itemId: string, amount?: number) => void
}

export const useInventoryStore = create<InventoryState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const current = get().items.find((entry) => entry.id === item.id)
        const nextQuantity = (current?.quantity ?? 0) + (item.quantity ?? 1)
        set((state) => ({
          items: current
            ? state.items.map((entry) =>
                entry.id === item.id ? { ...entry, quantity: nextQuantity } : entry,
              )
            : [...state.items, { ...item, quantity: item.quantity ?? 1 }],
        }))
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
    }),
    { name: 'beach-party-inventory' },
  ),
)
