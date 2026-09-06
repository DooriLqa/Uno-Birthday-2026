import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import type { GameDefinition } from '@/entities/game/model/types'
import { useProgressStore } from '@/features/game-progress/model/store'
import { RadioModal } from '@/features/beach-radio'
import { GameHud } from '@/widgets/game-hud/GameHud'
type Props = { game: GameDefinition; onBack: () => void }

export function GamePage({ game, onBack }: Props) {
  const [radioOpen, setRadioOpen] = useState(false)
  const completeGame = useProgressStore((state) => state.completeGame)
  const GameScreen = game.Screen
  const openRadio = () => setRadioOpen(true)

  return (
    <main className={['beach-shell', 'game-overlay', game.pageClassName].filter(Boolean).join(' ')}>
      {game.backgroundImage && (
        <img
          className="game-overlay__background"
          src={game.backgroundImage}
          alt=""
          aria-hidden="true"
        />
      )}
      <div className="page-top">
        <button type="button" className="back" onClick={onBack}>
          <ArrowLeft size={18} /> Все игры
        </button>
        <span>{game.emoji}</span>
      </div>
      <GameHud onOpenRadio={openRadio} />
      <GameScreen onComplete={() => completeGame(game.id)} onOpenRadio={openRadio} onClose={onBack} />

      <RadioModal open={radioOpen} onClose={() => setRadioOpen(false)} />
    </main>
  )
}
