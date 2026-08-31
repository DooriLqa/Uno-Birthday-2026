import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type ProgressState = {
  completedGameIds: string[]
  foundItemsByGame: Record<string, string[]>
  completeGame: (gameId: string) => void
  findItem: (gameId: string, itemId: string) => void
  resetProgress: () => void
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set) => ({
      completedGameIds: [],
      foundItemsByGame: {},
      completeGame: (gameId) =>
        set((state) =>
          state.completedGameIds.includes(gameId)
            ? state
            : { completedGameIds: [...state.completedGameIds, gameId] },
        ),
      findItem: (gameId, itemId) =>
        set((state) => {
          const foundItems = state.foundItemsByGame[gameId] ?? []
          if (foundItems.includes(itemId)) return state
          return {
            foundItemsByGame: {
              ...state.foundItemsByGame,
              [gameId]: [...foundItems, itemId],
            },
          }
        }),
      resetProgress: () => set({ completedGameIds: [], foundItemsByGame: {} }),
    }),
    { name: 'beach-party-progress' },
  ),
)
