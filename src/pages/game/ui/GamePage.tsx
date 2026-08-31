import { ArrowLeft } from 'lucide-react'
import { getGame } from '@/entities/game/model/games'
import { useProgressStore } from '@/features/game-progress/model/store'
import { ShellHuntGame } from '@/features/shell-hunt'
import { CoconutCatchGame } from '@/features/coconut-catch'
import { WaveRiderGame } from '@/features/wave-rider'
import { IceCreamGame } from '@/features/ice-cream'
import { TreasureMapGame } from '@/features/treasure-map'
import { BeachSearchGame } from '@/features/beach-search'
import islandMapImage from '@/shared/assets/island-map/tropical-island-map-expanded.png'
import totemBeachScene from '@/shared/assets/totem-code/totem-beach-scene-v3.png'
import { Button } from '@/shared/ui/Button'

type Props = { gameId: string; onBack: () => void }

const gameScreens = {
  'shell-hunt': ShellHuntGame,
  'coconut-catch': CoconutCatchGame,
  'wave-rider': WaveRiderGame,
  'ice-cream': IceCreamGame,
  'treasure-map': TreasureMapGame,
  'beach-search': BeachSearchGame,
}

const specialSceneImages: Record<string, string> = {
  'shell-hunt': totemBeachScene,
}

export function GamePage({ gameId, onBack }: Props) {
  const game = getGame(gameId)
  const completeGame = useProgressStore((state) => state.completeGame)
  const isComplete = useProgressStore((state) => state.completedGameIds.includes(gameId))

  if (!game) return null

  const GameScreen = gameScreens[game.id as keyof typeof gameScreens]
  const isBeachSearch = game.id === 'beach-search'
  const isTotemCode = game.id === 'shell-hunt'
  const isImmersiveGame = isBeachSearch || isTotemCode
  const sceneImage = specialSceneImages[game.id] ?? islandMapImage

  return (
    <main
      className={`beach-shell game-overlay ${isBeachSearch ? 'beach-search-page' : ''} ${
        isTotemCode ? 'totem-code-page' : ''
      }`}
      style={{ backgroundImage: `url(${sceneImage})` }}
    >
      <div className="page-top">
        <button type="button" className="back" onClick={onBack}>
          <ArrowLeft size={18} /> Все игры
        </button>
        <span>{game.emoji}</span>
      </div>
      <section className={`game-layout ${isBeachSearch ? 'beach-search-layout' : ''}`}>
        <div className={`game-panel ${isBeachSearch ? 'beach-search-panel' : ''}`}>
          {!isImmersiveGame && (
            <>
              <h1>{game.title}</h1>
              <p>Выполни задание, чтобы отметить игру как пройденную.</p>
            </>
          )}
          <GameScreen onComplete={() => completeGame(game.id)} />
        </div>
        {!isImmersiveGame && (
          <aside className="info-panel">
            <h2>{isComplete ? 'Победа!' : 'Задание'}</h2>
            <p>
              {isComplete
                ? 'Эта игра уже в твоей коллекции. Можно сыграть ещё раз!'
                : `Поймай ${game.target} — и игра будет отмечена как пройденная.`}
            </p>
            {isComplete && <Button onClick={() => completeGame(game.id)}>Сыграть снова</Button>}
          </aside>
        )}
      </section>
    </main>
  )
}
