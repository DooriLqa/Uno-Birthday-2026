import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type ProgressState = {
  completedGameIds: string[]
  completeGame: (gameId: string) => void
  resetProgress: () => void
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set) => ({
      completedGameIds: [],
      completeGame: (gameId) =>
        set((state) =>
          state.completedGameIds.includes(gameId)
            ? state
            : { completedGameIds: [...state.completedGameIds, gameId] },
        ),
      resetProgress: () => set({ completedGameIds: [] }),
    }),
    { name: 'beach-party-progress' },
  ),
)
