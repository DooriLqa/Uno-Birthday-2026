import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type QuizProgressState = {
  questionWeights: Record<string, number>
  setQuestionWeight: (id: string, weight: 1 | 2) => void
  resetQuizMemory: () => void
}

export const useQuizProgressStore = create<QuizProgressState>()(
  persist(
    (set) => ({
      questionWeights: {},
      setQuestionWeight: (id, weight) =>
        set((state) => ({
          questionWeights: { ...state.questionWeights, [id]: weight },
        })),
      resetQuizMemory: () => set({ questionWeights: {} }),
    }),
    {
      name: 'beach-party-quiz-progress-v2',
    },
  ),
)
