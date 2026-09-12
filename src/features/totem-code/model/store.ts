import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type TotemDrum = 'moon' | 'concept' | 'letter'
export type TotemValue = Record<TotemDrum, number>

const createInitialValues = (): TotemValue[] =>
  Array.from({ length: 4 }, () => ({ moon: 0, concept: 0, letter: 0 }))

type TotemCodeState = {
  values: TotemValue[]
  setValues: (values: TotemValue[]) => void
  reset: () => void
}

export const useTotemCodeStore = create<TotemCodeState>()(
  persist(
    (set) => ({
      values: createInitialValues(),
      setValues: (values) => set({ values }),
      reset: () => set({ values: createInitialValues() }),
    }),
    {
      name: 'beach-party-totem-code',
      partialize: ({ values }) => ({ values }),
    },
  ),
)
