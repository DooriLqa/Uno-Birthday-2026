import { useState } from 'react'
import './IceCreamGame.css'

type Props = { onComplete: () => void }
const flavours = ['🍓', '🍋', '🫐']

export function IceCreamGame({ onComplete }: Props) {
  const [scoops, setScoops] = useState<string[]>([])
  const addScoop = (flavour: string) => {
    if (scoops.length === 3) return
    const next = [...scoops, flavour]
    setScoops(next)
    if (next.length === 3) onComplete()
  }

  return (
    <div className="ice-cream-game">
      <div className="ice-cream-game__sun">☀️</div>
      <div className="ice-cream-game__result">
        <span>{scoops.join(' ') || '○ ○ ○'}</span>
        <b>🍦</b>
      </div>
      <p>Выбери 3 шарика: {scoops.length}/3</p>
      <div className="ice-cream-game__flavours">
        {flavours.map((flavour) => (
          <button key={flavour} type="button" onClick={() => addScoop(flavour)}>
            {flavour}
          </button>
        ))}
      </div>
    </div>
  )
}
