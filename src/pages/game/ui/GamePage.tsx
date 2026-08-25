import { ArrowLeft } from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { getGame } from '@/entities/game/model/games'
import { useProgressStore } from '@/features/game-progress/model/store'
import { ShellHuntGame } from '@/features/shell-hunt'
import { CoconutCatchGame } from '@/features/coconut-catch'
import { WaveRiderGame } from '@/features/wave-rider'
import { IceCreamGame } from '@/features/ice-cream'
import { TreasureMapGame } from '@/features/treasure-map'
import { Button } from '@/shared/ui/Button'
import { Japonsk } from '@/features/Japonsk'
const gameScreens = {
  'shell-hunt': ShellHuntGame,
  'coconut-catch': CoconutCatchGame,
  'wave-rider': WaveRiderGame,
  'ice-cream': IceCreamGame,
  'treasure-map': TreasureMapGame,
  Japonsk: Japonsk,
}

export function GamePage() {
  const { gameId } = useParams()
  const game = getGame(gameId)
  const completeGame = useProgressStore((state) => state.completeGame)
  const isComplete = useProgressStore((state) =>
    gameId ? state.completedGameIds.includes(gameId) : false,
  )
  if (!game) return <Navigate to="/" replace />
  const GameScreen = gameScreens[game.id as keyof typeof gameScreens]
  return (
    <main className="beach-shell">
      <div className="page-top">
        <Link to="/" className="back">
          <ArrowLeft size={18} /> Все игры
        </Link>
        <span>{game.emoji}</span>
      </div>
      <section className="game-layout">
        <div className="game-panel">
          <h1>{game.title}</h1>
          <p>Простой игровой плейсхолдер: выполни задание, чтобы отметить игру как пройденную.</p>
          <GameScreen onComplete={() => completeGame(game.id)} />
        </div>
        <aside className="info-panel">
          <h2>{isComplete ? 'Победа!' : 'Задание'}</h2>
          <p>
            {isComplete
              ? 'Эта игра уже в твоей коллекции. Можно сыграть ещё раз!'
              : `Поймай ${game.target} — и игра будет отмечена как пройденная.`}
          </p>
          {isComplete && <Button onClick={() => completeGame(game.id)}>Сыграть снова</Button>}
        </aside>
      </section>
    </main>
  )
}
