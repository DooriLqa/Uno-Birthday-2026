import { ArrowLeft } from 'lucide-react'
import type { GameDefinition } from '@/entities/game/model/types'
import { useProgressStore } from '@/features/game-progress/model/store'
type Props = { game: GameDefinition; onBack: () => void; onOpenRadio?: () => void }

export function GamePage({ game, onBack, onOpenRadio }: Props) {
  const completeGame = useProgressStore((state) => state.completeGame)
  const GameScreen = game.Screen

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
      <div className="game-overlay__content">
        <div className="page-top">
          <button type="button" className="back" onClick={onBack}>
            <ArrowLeft size={18} /> Вернуться в локацию
          </button>
          <span>{game.emoji}</span>
        </div>
        <GameScreen
          onComplete={() => completeGame(game.id)}
          onOpenRadio={onOpenRadio}
          onClose={onBack}
        />
      </div>
    </main>
  )
}
