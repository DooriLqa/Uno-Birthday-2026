export type QuizQuestion = {
  id: string
  text?: string
  audioSrc?: string
  answers: string[]
  correctIndex: number
}

export type RadioStation = {
  id: string
  frequency: number
  trackSrcs: string[]
}
