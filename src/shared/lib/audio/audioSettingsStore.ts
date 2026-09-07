import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { audioController, clampVolume } from './audioController'

type AudioSettings = { masterVolume: number; setMasterVolume: (volume: number) => void }

export const useAudioSettingsStore = create<AudioSettings>()(
  persist(
    (set) => ({
      masterVolume: 1,
      setMasterVolume: (volume) => set({ masterVolume: clampVolume(volume) }),
    }),
    { name: 'beach-party-audio', partialize: ({ masterVolume }) => ({ masterVolume }) },
  ),
)

audioController.setMasterVolume(useAudioSettingsStore.getState().masterVolume)
const unsubscribe = useAudioSettingsStore.subscribe(({ masterVolume }) => {
  audioController.setMasterVolume(masterVolume)
})
if (import.meta.hot) import.meta.hot.dispose(unsubscribe)
