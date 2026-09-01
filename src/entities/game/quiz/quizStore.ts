import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface QuizState {
  completedQuestions: string[]
  currentQuestionId: string | null
  completeQuestion: (questionId: string) => void
  setCurrentQuestion: (questionId: string) => void
  resetQuiz: () => void
}

export const useQuizStore = create<QuizState>()(
  persist(
    (set) => ({
      completedQuestions: [],
      currentQuestionId: null,
      completeQuestion: (questionId) =>
        set((state) => ({
          completedQuestions: [...state.completedQuestions, questionId],
        })),
      setCurrentQuestion: (questionId) => set({ currentQuestionId: questionId }),
      resetQuiz: () => set({ completedQuestions: [], currentQuestionId: null }),
    }),
    {
      name: 'quiz-progress',
    },
  ),
)
