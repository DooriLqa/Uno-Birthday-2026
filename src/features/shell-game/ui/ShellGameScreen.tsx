import { useEffect, useState } from 'react'
import { ShellGame } from './ShellGame'

type Difficulty = 1 | 2 | 3

type LevelConfig = {
  level: Difficulty
  shuffleIterations: number
  shuffleDuration: number
  shufflePause: number
}

const INITIAL_SHUFFLE_DURATION = 1100
const INITIAL_SHUFFLE_PAUSE = 350
const levels: LevelConfig[] = [
  { level: 1, shuffleIterations: 5, shuffleDuration: INITIAL_SHUFFLE_DURATION / 2, shufflePause: INITIAL_SHUFFLE_PAUSE / 2 },
  { level: 2, shuffleIterations: 10, shuffleDuration: INITIAL_SHUFFLE_DURATION / 3, shufflePause: INITIAL_SHUFFLE_PAUSE / 3 },
  { level: 3, shuffleIterations: 10, shuffleDuration: INITIAL_SHUFFLE_DURATION / 4, shufflePause: INITIAL_SHUFFLE_PAUSE / 4 },
]

type Props = { onComplete: () => void }

export function ShellGameScreen({ onComplete }: Props) {
  const [currentLevel, setCurrentLevel] = useState<Difficulty>(1)
  const [correctAnswers, setCorrectAnswers] = useState<Record<Difficulty, number>>({ 1: 0, 2: 0, 3: 0 })
  const levelConfig = levels.find((level) => level.level === currentLevel)!

  useEffect(() => {
    if (correctAnswers[1] >= 3 && correctAnswers[2] >= 3 && correctAnswers[3] >= 3) onComplete()
  }, [correctAnswers, onComplete])

  const handleResult = (correct: boolean) => {
    if (!correct) return
    setCorrectAnswers((current) =>
      current[currentLevel] >= 3 ? current : { ...current, [currentLevel]: current[currentLevel] + 1 },
    )
  }

  return (
    <section className="shell-game-screen" aria-label="Игра с ракушками">
      <header className="shell-game-screen__header">
        <h1>Кручу-верчу</h1>
        <p>Запомни, под каким стаканом жемчужина, и найди её после перемешивания.</p>
      </header>
      <div className="shell-game-screen__levels">
        {levels.map((level) => {
          const score = correctAnswers[level.level]
          const completed = score >= 3
          return (
            <button
              key={level.level}
              type="button"
              onClick={() => setCurrentLevel(level.level)}
              className={`shell-game-screen__level ${currentLevel === level.level ? 'is-active' : ''} ${
                completed ? 'is-completed' : ''
              }`}
            >
              <span>Уровень {level.level}</span>
              <strong>{score}/3 верно</strong>
            </button>
          )
        })}
      </div>
      <ShellGame
        key={currentLevel}
        shuffleIterations={levelConfig.shuffleIterations}
        shuffleDuration={levelConfig.shuffleDuration}
        shufflePause={levelConfig.shufflePause}
        onResult={handleResult}
      />
    </section>
  )
}
