import { useEffect, useState } from 'react'
import './LockPickingGame.css'

type Props = { onComplete: () => void }
type ArrowKey = 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight'

const attemptsLimit = 15
const arrowKeys: ArrowKey[] = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']
const arrowSymbols: Record<ArrowKey, string> = {
  ArrowUp: '↑',
  ArrowDown: '↓',
  ArrowLeft: '←',
  ArrowRight: '→',
}

const createSequence = () =>
  Array.from({ length: 3 }, () => arrowKeys[Math.floor(Math.random() * arrowKeys.length)])

export function LockPickingGame({ onComplete }: Props) {
  const [sequence, setSequence] = useState(createSequence)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isComplete || !arrowKeys.includes(event.key as ArrowKey)) return
      event.preventDefault()

      if (event.key === sequence[currentIndex]) {
        const nextIndex = currentIndex + 1
        if (nextIndex === sequence.length) {
          setCurrentIndex(nextIndex)
          setIsComplete(true)
          onComplete()
        } else {
          setCurrentIndex(nextIndex)
        }
      } else {
        setCurrentIndex(0)
        setAttempts((value) => {
          const nextAttempts = value + 1
          if (nextAttempts === attemptsLimit) {
            setSequence(createSequence())
            setCurrentIndex(0)
            return 0
          }
          return nextAttempts
        })
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentIndex, isComplete, onComplete, sequence])

  return (
    <div className="lock-picking-game">
      <div className="lock-picking-game__header">
        <p>Комбинация: {currentIndex}/{sequence.length}</p>
        <span>Попытки: {attempts}/{attemptsLimit}</span>
      </div>
      <div className="lock-picking-game__lock" aria-hidden="true">
        <div className="lock-picking-game__shackle" />
        <div className="lock-picking-game__plate">✦</div>
        <div className="lock-picking-game__keyhole" />
      </div>
      <div className="lock-picking-game__sequence" aria-label="Последовательность стрелок">
        {sequence.map((key, index) => (
          <span
            key={`${key}-${index}`}
            className={index < currentIndex ? 'is-done' : index === currentIndex ? 'is-current' : ''}
          >
            {index < currentIndex ? arrowSymbols[key] : '?'}
          </span>
        ))}
      </div>
      <p className="lock-picking-game__message">
        {
          isComplete
            ? 'Замок открыт!'
            : attempts === 0 && currentIndex === 0
              ? 'Введи комбинацию стрелками на клавиатуре.'
              : currentIndex === 0 && attempts > 0
                ? 'Неверная комбинация! Начни заново.'
                : 'Продолжай вводить комбинацию...'
        }
      </p>
    </div>
  )
}
