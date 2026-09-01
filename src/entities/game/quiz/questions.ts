import type { QuizQuestion } from './types'

export const quizQuestions: QuizQuestion[] = [
  {
    id: 'fallout-3-1',
    gameId: 'fallout-3',
    gameTitle: 'Fallout 3',
    question: 'Как называется виртуальный мир, в который попадает главный герой в Fallout 3?',
    answer: 'Транквилити-Лейн',
    hint: 'Это симуляция идеального американского городка 1950-х годов',
    puzzleType: 'hacking',
    emoji: '☢️',
  },
  // Здесь будут другие вопросы
]

export const getQuizQuestion = (id: string) => quizQuestions.find((q) => q.id === id)

export const getNextQuestion = (currentId: string) => {
  const currentIndex = quizQuestions.findIndex((q) => q.id === currentId)
  return currentIndex < quizQuestions.length - 1 ? quizQuestions[currentIndex + 1] : null
}
