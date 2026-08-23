import { useState } from 'react'
import './ShellHuntGame.css'

type Props = { onComplete: () => void }

export function ShellHuntGame({ onComplete }: Props) {
  const [found, setFound] = useState(0)
  const findShell = () =>
    setFound((value) => {
      const next = value + 1
      if (next === 3) onComplete()
      return Math.min(next, 3)
    })

  return (
    <div className="shell-hunt-game">
      <p>Ракушки: {found}/3</p>
      <div className="shell-hunt-game__shore">
        <span>🌊</span>
        <div className="shell-hunt-game__shells">
          {[0, 1, 2].map((shell) => (
            <button key={shell} type="button" onClick={findShell} disabled={shell < found}>
              {shell < found ? '✨' : '🐚'}
            </button>
          ))}
        </div>
      </div>
      <small>Нажми на все ракушки на берегу.</small>
    </div>
  )
}
