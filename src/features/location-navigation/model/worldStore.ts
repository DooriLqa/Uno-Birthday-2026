import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { LocationId } from './locations'

export type SceneSnapshot = { locationId: LocationId; pan: number }
type WorldState = {
  scene: SceneSnapshot
  history: SceneSnapshot[]
  setScene: (scene: SceneSnapshot) => void
  setHistory: (history: SceneSnapshot[]) => void
}

export const useWorldStore = create<WorldState>()(
  persist((set) => ({
    scene: { locationId: 'pier', pan: 0.5 },
    history: [],
    setScene: (scene) => set({ scene }),
    setHistory: (history) => set({ history }),
  }), { name: 'tourist-world-v1' }),
)
