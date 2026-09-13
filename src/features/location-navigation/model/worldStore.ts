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
  }), {
    name: 'tourist-world-v1',
    version: 1,
    migrate: (persistedState) => {
      const state = persistedState as {
        scene: { locationId: string; pan: number }
        history: { locationId: string; pan: number }[]
      }
      return {
        ...state,
        scene: state.scene.locationId === 'arcades'
          ? { locationId: 'shop', pan: 0.5 }
          : state.scene,
        history: state.history.filter((scene) => scene.locationId !== 'arcades'),
      } as Pick<WorldState, 'scene' | 'history'>
    },
  }),
)
