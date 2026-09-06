import { useState } from 'react'
import './TreasureMapGame.css'

type Props = { onComplete: () => void }

export function TreasureMapGame({ onComplete }: Props) {
  const [target] = useState(() => Math.floor(Math.random() * 9))
  const [opened, setOpened] = useState<number[]>([])
  const openTile = (tile: number) => {
    if (tile === target) onComplete()
    setOpened((tiles) => (tiles.includes(tile) ? tiles : [...tiles, tile]))
  }

  return (
    <div className="treasure-map-game">
      <p>Найди клетку с сокровищем.</p>
      <div className="treasure-map-game__grid">
        {Array.from({ length: 9 }, (_, tile) => (
          <button key={tile} type="button" onClick={() => openTile(tile)}>
            {opened.includes(tile) ? (tile === target ? '💎' : '·') : '❔'}
          </button>
        ))}
      </div>
      <small>Подсказка: сокровище спрятано только в одной клетке.</small>
    </div>
  )
}
