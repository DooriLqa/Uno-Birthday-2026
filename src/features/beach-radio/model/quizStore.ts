import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type QuizProgressState = {
  questionWeights: Record<string, number>
  audioVolume: number
  setQuestionWeight: (id: string, weight: 1 | 2) => void
  setAudioVolume: (value: number) => void
  resetQuizMemory: () => void
}

export const useQuizProgressStore = create<QuizProgressState>()(
  persist(
    (set) => ({
      questionWeights: {},
      audioVolume: 0.7,
      setQuestionWeight: (id, weight) =>
        set((state) => ({
          questionWeights: { ...state.questionWeights, [id]: weight },
        })),
      setAudioVolume: (value) =>
        set({
          audioVolume: Math.min(1, Math.max(0, value)),
        }),
      resetQuizMemory: () => set({ questionWeights: {} }),
    }),
    {
      name: 'beach-party-quiz-progress-v2',
    },
  ),
)
