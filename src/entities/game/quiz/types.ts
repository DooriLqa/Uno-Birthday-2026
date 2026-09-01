export type PuzzleType =
  | 'hacking'
  | 'dialogue'
  | 'maze'
  | 'lockpick'
  | 'tasks'
  | 'skillcheck'
  | 'wordpuzzle'
  | 'chessmate'
  | 'defuse'

export interface QuizQuestion {
  id: string
  gameId: string
  gameTitle: string
  question: string
  answer: string
  hint?: string
  puzzleType: PuzzleType
  emoji: string
}

export interface QuizProgress {
  completedQuestions: string[]
  currentQuestionIndex: number
}
