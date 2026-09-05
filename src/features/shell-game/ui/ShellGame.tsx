import { useEffect, useState, type CSSProperties } from 'react'
import './ShellGame.css'

import cupImage from '@/assets/ShellGame/cup.png'
import pearlImage from '@/assets/ShellGame/pearl.png'

export type ShellGameProps = {
  shuffleIterations: number
  shuffleDuration: number
  shufflePause: number
  onResult: (correct: boolean) => void
}

type Cup = {
  id: number
  position: number
}

type GamePhase =
  | 'idle'
  | 'showing'
  | 'shuffling'
  | 'choosing'
  | 'result'

type Swap = {
  firstId: number
  secondId: number
  firstPosition: number
  secondPosition: number
}

const INITIAL_CUPS: Cup[] = [
  { id: 0, position: 0 },
  { id: 1, position: 1 },
  { id: 2, position: 2 },
]

const SHOW_DURATION = 1000

export const ShellGame = ({
  shuffleIterations,
  shuffleDuration,
  shufflePause,
  onResult,
}: ShellGameProps) => {
  const [cups, setCups] = useState<Cup[]>(INITIAL_CUPS)
  const [phase, setPhase] = useState<GamePhase>('idle')
  const [pearlCupId, setPearlCupId] = useState<number | null>(null)
  const [liftedCupId, setLiftedCupId] = useState<number | null>(null)
  const [shuffleStep, setShuffleStep] = useState(0)
  const [result, setResult] = useState<'win' | 'lose' | null>(null)
  const [swap, setSwap] = useState<Swap | null>(null)

  const startGame = () => {
    setCups(INITIAL_CUPS)
    setPearlCupId(1)
    setLiftedCupId(1)
    setShuffleStep(0)
    setResult(null)
    setSwap(null)
    setPhase('showing')
  }

  useEffect(() => {
    if (phase !== 'showing') return

    const timer = window.setTimeout(() => {
      setLiftedCupId(null)
      setPhase('shuffling')
    }, SHOW_DURATION)

    return () => window.clearTimeout(timer)
  }, [phase])

  useEffect(() => {
    if (phase !== 'shuffling') return

    if (shuffleStep >= shuffleIterations) {
      setSwap(null)
      setPhase('choosing')
      return
    }

    if (swap !== null) return

    const timer = window.setTimeout(() => {
      setCups((currentCups) => {
        const firstPosition = Math.floor(Math.random() * 3)
        let secondPosition = Math.floor(Math.random() * 3)

        while (secondPosition === firstPosition) {
          secondPosition = Math.floor(Math.random() * 3)
        }

        const firstCup = currentCups.find(
          (cup) => cup.position === firstPosition,
        )
        const secondCup = currentCups.find(
          (cup) => cup.position === secondPosition,
        )

        if (!firstCup || !secondCup) return currentCups

        setSwap({
          firstId: firstCup.id,
          secondId: secondCup.id,
          firstPosition,
          secondPosition,
        })

        return currentCups
      })
    }, shufflePause)

    return () => window.clearTimeout(timer)
  }, [
    phase,
    shuffleStep,
    shuffleIterations,
    shufflePause,
    swap,
  ])

  useEffect(() => {
    if (!swap) return

    const timer = window.setTimeout(() => {
      setCups((currentCups) =>
        currentCups.map((cup) => {
          if (cup.id === swap.firstId) {
            return { ...cup, position: swap.secondPosition }
          }

          if (cup.id === swap.secondId) {
            return { ...cup, position: swap.firstPosition }
          }

          return cup
        }),
      )

      setSwap(null)
      setShuffleStep((current) => current + 1)
    }, shuffleDuration)

    return () => window.clearTimeout(timer)
  }, [swap, shuffleDuration])

  const handleCupClick = (cupId: number) => {
    if (phase !== 'choosing') return

    const correct = cupId === pearlCupId

    setLiftedCupId(cupId)
    setResult(correct ? 'win' : 'lose')
    setPhase('result')
    onResult(correct)
  }

  const visibleCups = [...cups].sort(
    (a, b) => a.position - b.position,
  )

  const shouldShowPearl =
    phase === 'showing' ||
    (phase === 'result' && result === 'win')

  return (
    <div className="shell-game">
      <div className="shell-game__header">
        {phase === 'idle' && (
          <p className="shell-game__hint">
            Найди, под каким стаканом находится жемчужина
          </p>
        )}

        {phase === 'showing' && (
          <p className="shell-game__hint">
            Запомни, где находится жемчужина!
          </p>
        )}

        {phase === 'shuffling' && (
          <p className="shell-game__hint">
            Перемешивание {shuffleStep + 1} из {shuffleIterations}
          </p>
        )}

        {phase === 'choosing' && (
          <p className="shell-game__hint">Выбери стакан</p>
        )}

        {phase === 'result' && (
          <p
            className={`shell-game__result ${
              result === 'win'
                ? 'shell-game__result--win'
                : 'shell-game__result--lose'
            }`}
          >
            {result === 'win' ? 'Угадал!' : 'Увы!'}
          </p>
        )}
      </div>

      <div className="shell-game__board">
        <div className="shell-game__cups">
          {visibleCups.map((cup) => {
            const isLifted = liftedCupId === cup.id
            const isFirst = swap?.firstId === cup.id
            const isSecond = swap?.secondId === cup.id
            const isSwapping = isFirst || isSecond

            let moveX = 0
            let arcHeight = 0

            if (swap && isSwapping) {
              const targetPosition = isFirst
                ? swap.secondPosition
                : swap.firstPosition

              const distance = targetPosition - cup.position

              moveX = distance * (150 + 30)
              arcHeight = isFirst ? 105 : 75
            }

            const style = isSwapping
              ? ({
                  '--move-x': `${moveX}px`,
                  '--arc-height': `${arcHeight}px`,
                  '--shuffle-duration': `${shuffleDuration}ms`,
                } as CSSProperties)
              : undefined

            const showPearl =
              shouldShowPearl && pearlCupId === cup.id

            return (
              <div
                key={cup.id}
                className={`shell-game__cup-wrapper shell-game__cup-wrapper--position-${cup.position} ${
                  isSwapping
                    ? 'shell-game__cup-wrapper--swapping'
                    : ''
                }`}
                style={style}
              >
                <button
                  type="button"
                  className={`shell-game__cup ${
                    isLifted ? 'shell-game__cup--lifted' : ''
                  } ${
                    isSwapping
                      ? 'shell-game__cup--animating'
                      : ''
                  } ${
                    phase === 'choosing'
                      ? 'shell-game__cup--selectable'
                      : ''
                  }`}
                  onClick={() => handleCupClick(cup.id)}
                  disabled={phase !== 'choosing'}
                  aria-label={`Стакан ${cup.position + 1}`}
                >
                  {showPearl && (
                    <img
                      className="shell-game__pearl"
                      src={pearlImage}
                      alt="Жемчужина"
                    />
                  )}

                  <img
                    className="shell-game__cup-image"
                    src={cupImage}
                    alt="Стакан"
                  />
                </button>
              </div>
            )
          })}
        </div>
      </div>

      <div className="shell-game__controls">
        {phase === 'idle' && (
          <button
            type="button"
            className="shell-game__play-button"
            onClick={startGame}
          >
            Играть
          </button>
        )}

        {phase === 'result' && (
          <button
            type="button"
            className="shell-game__play-button"
            onClick={startGame}
          >
            Играть снова
          </button>
        )}
      </div>
    </div>
  )
}
