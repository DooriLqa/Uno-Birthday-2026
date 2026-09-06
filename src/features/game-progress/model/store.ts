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
    {
      name: 'beach-party-progress',
      version: 1,
      migrate: (persistedState) => {
        const state = persistedState as Pick<ProgressState, 'completedGameIds' | 'foundItemsByGame'>
        const legacyId = 'shell-hunt'
        const currentId = 'totem-code'
        const completedGameIds = state.completedGameIds?.map((id) => (id === legacyId ? currentId : id)) ?? []
        const legacyItems = state.foundItemsByGame?.[legacyId]
        const foundItemsByGame = { ...(state.foundItemsByGame ?? {}) }
        delete foundItemsByGame[legacyId]

        return {
          ...state,
          completedGameIds: [...new Set(completedGameIds)],
          foundItemsByGame: legacyItems
            ? { ...foundItemsByGame, [currentId]: [...(foundItemsByGame[currentId] ?? []), ...legacyItems] }
            : foundItemsByGame,
        }
      },
    },
  ),
)
