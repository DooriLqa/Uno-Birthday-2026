import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type QuizProgressState = {
  seenQuestionIds: string[]
  correctQuestionIds: string[]
  markSeen: (id: string) => void
  markCorrect: (id: string) => void
}

export const useQuizProgressStore = create<QuizProgressState>()(
  persist(
    (set) => ({
      seenQuestionIds: [],
      correctQuestionIds: [],
      markSeen: (id) =>
        set((state) =>
          state.seenQuestionIds.includes(id)
            ? state
            : { seenQuestionIds: [...state.seenQuestionIds, id] },
        ),
      markCorrect: (id) =>
        set((state) =>
          state.correctQuestionIds.includes(id)
            ? state
            : { correctQuestionIds: [...state.correctQuestionIds, id] },
        ),
    }),
    { name: 'beach-party-quiz-progress' },
  ),
)
