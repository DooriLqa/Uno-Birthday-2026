import { useState } from 'react'
import { MiniGameCanvas } from '@/widgets/mini-game/MiniGameCanvas'
import './WaveRiderGame.css'

type Props = { onComplete: () => void }

export function WaveRiderGame({ onComplete }: Props) {
  const [balance, setBalance] = useState(0)
  const keepBalance = () =>
    setBalance((value) => {
      const next = value + 1
      if (next === 5) onComplete()
      return Math.min(next, 5)
    })

  return (
    <div className="wave-rider-game">
      <div className="wave-rider-game__scene">
        <MiniGameCanvas emoji="🏄" onWin={onComplete} />
      </div>
      <p>Баланс: {balance}/5</p>
      <button type="button" onClick={keepBalance} disabled={balance === 5}>
        Удержать равновесие
      </button>
      <small>Нажми пять раз. Клик по серферу на сцене тоже засчитывает победу.</small>
    </div>
  )
}
