import { useEffect, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

import { ShellGame } from '@/features/shell-game'
import './ShellGamePage.css'

type Difficulty = 1 | 2 | 3

type LevelConfig = {
  level: Difficulty
  shuffleIterations: number
  shuffleDuration: number
  shufflePause: number
}

const INITIAL_SHUFFLE_DURATION = 1100
const INITIAL_SHUFFLE_PAUSE = 350

const LEVELS: LevelConfig[] = [
  {
    level: 1,
    shuffleIterations: 5,
    shuffleDuration: INITIAL_SHUFFLE_DURATION / 2,
    shufflePause: INITIAL_SHUFFLE_PAUSE / 2,
  },
  {
    level: 2,
    shuffleIterations: 10,
    shuffleDuration: INITIAL_SHUFFLE_DURATION / 3,
    shufflePause: INITIAL_SHUFFLE_PAUSE / 3,
  },
  {
    level: 3,
    shuffleIterations: 10,
    shuffleDuration: INITIAL_SHUFFLE_DURATION / 4,
    shufflePause: INITIAL_SHUFFLE_PAUSE / 4,
  },
]

type ShellGamePageProps = {
  onComplete: () => void
}

export function ShellGamePage({ onComplete }: ShellGamePageProps) {

  const [currentLevel, setCurrentLevel] = useState<Difficulty>(1)

  const [correctAnswers, setCorrectAnswers] = useState<Record<Difficulty, number>>({
    1: 0,
    2: 0,
    3: 0,
  })

  const levelConfig = LEVELS.find((level) => level.level === currentLevel)!

  useEffect(() => {
    const allLevelsCompleted =
      correctAnswers[1] >= 3 &&
      correctAnswers[2] >= 3 &&
      correctAnswers[3] >= 3

    if (allLevelsCompleted) {
      onComplete()
    }
  }, [correctAnswers, onComplete])

  const handleResult = (correct: boolean) => {
    if (!correct) return

    setCorrectAnswers((current) => {
      const currentScore = current[currentLevel]

      if (currentScore >= 3) {
        return current
      }

      return {
        ...current,
        [currentLevel]: currentScore + 1,
      }
    })
  }

  const completedLevels =
    (correctAnswers[1] >= 3 ? 1 : 0) +
    (correctAnswers[2] >= 3 ? 1 : 0) +
    (correctAnswers[3] >= 3 ? 1 : 0)

  return (
    <main className="beach-shell">
      <div className="page-top">
        <Link to="/" className="back">
          <ArrowLeft size={18} />
          Все игры
        </Link>

        <span>🥤</span>
      </div>

      <section className="game-layout">
        <div className="game-panel">
          <h1>Кручу-верчу</h1>

          <p>
            Запомни, под каким стаканом находится жемчужина, а затем найди её после перемешивания.
          </p>

          <div className="shell-game-page__levels">
            {LEVELS.map((level) => {
              const score = correctAnswers[level.level]
              const completed = score >= 3

              return (
                <button
                  key={level.level}
                  type="button"
                  onClick={() => setCurrentLevel(level.level)}
                  className={`shell-game-page__level ${currentLevel === level.level ? 'shell-game-page__level--active' : ''
                    } ${completed ? 'shell-game-page__level--completed' : ''}`}
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
        </div>
      </section>
    </main>
  )
}
