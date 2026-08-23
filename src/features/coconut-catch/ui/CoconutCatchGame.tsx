import { useState } from 'react'
import './CoconutCatchGame.css'

type Props = { onComplete: () => void }

export function CoconutCatchGame({ onComplete }: Props) {
  const [score, setScore] = useState(0)
  const [position, setPosition] = useState(48)
  const catchCoconut = () =>
    setScore((value) => {
      const next = value + 1
      setPosition(8 + Math.round(Math.random() * 76))
      if (next === 5) onComplete()
      return Math.min(next, 5)
    })

  return (
    <div className="coconut-catch-game">
      <p>Поймано: {score}/5</p>
      <span className="coconut-catch-game__palm">🌴</span>
      <button
        type="button"
        className="coconut-catch-game__coconut"
        style={{ left: `${position}%` }}
        onClick={catchCoconut}
        aria-label="Поймать кокос"
      >
        🥥
      </button>
      <div className="coconut-catch-game__basket">🧺</div>
      <small>Поймай пять кокосов.</small>
    </div>
  )
}
