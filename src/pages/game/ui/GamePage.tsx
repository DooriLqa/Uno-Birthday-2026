import { useState, type ComponentType } from 'react'
import { ArrowLeft } from 'lucide-react'
import { getGame } from '@/entities/game/model/games'
import { useProgressStore } from '@/features/game-progress/model/store'
import { BeachRadioGame, RadioModal } from '@/features/beach-radio'
import { TotemCodeGame } from '@/features/totem-code'
import { CoconutCatchGame } from '@/features/coconut-catch'
import { WaveRiderGame } from '@/features/wave-rider'
import { IceCreamGame } from '@/features/ice-cream'
import { TreasureMapGame } from '@/features/treasure-map'
import { BeachSearchGame } from '@/features/beach-search'
import { BookShelfGame } from '@/features/book-shelf'
import { FlappyBirdGame } from '@/features/flappy-bird'
import islandMapImage from '@/shared/assets/island-map/tropical-island-map-expanded.png'
import totemBeachScene from '@/shared/assets/totem-code/totem-beach-scene-no-fire.png'
import { Button } from '@/shared/ui/Button'
import { GameHud } from '@/widgets/game-hud/GameHud'

type GameScreenProps = {
  onComplete: () => void
  onOpenRadio?: () => void
}

type Props = { gameId: string; onBack: () => void }

const gameScreens: Record<string, ComponentType<GameScreenProps>> = {
  'shell-hunt': TotemCodeGame,
  'book-shelf': BookShelfGame,
  'flappy-bird': FlappyBirdGame,
  'coconut-catch': CoconutCatchGame,
  'wave-rider': WaveRiderGame,
  'ice-cream': IceCreamGame,
  'treasure-map': TreasureMapGame,
  'beach-search': BeachSearchGame,
  'beach-radio': BeachRadioGame,
}

const specialSceneImages: Record<string, string> = {
  'shell-hunt': totemBeachScene,
}

export function GamePage({ gameId, onBack }: Props) {
  const [radioOpen, setRadioOpen] = useState(false)
  const game = getGame(gameId)
  const completeGame = useProgressStore((state) => state.completeGame)
  const isComplete = useProgressStore((state) => state.completedGameIds.includes(gameId))

  if (!game) return null

  const GameScreen = gameScreens[game.id]
  const isBeachSearch = game.id === 'beach-search'
  const isTotemCode = game.id === 'shell-hunt'
  const isBookShelf = game.id === 'book-shelf'
  const isFlappyBird = game.id === 'flappy-bird'
  const isBeachRadio = game.id === 'beach-radio'
  const isImmersiveGame = isBeachSearch || isTotemCode || isBeachRadio || isBookShelf || isFlappyBird
  const sceneImage = specialSceneImages[game.id] ?? islandMapImage
  const openRadio = () => setRadioOpen(true)

  return (
    <main
      className={`beach-shell game-overlay ${isBeachSearch ? 'beach-search-page' : ''} ${
        isTotemCode ? 'totem-code-page' : ''
      } ${isBookShelf ? 'book-shelf-page' : ''
      } ${isFlappyBird ? 'flappy-bird-page' : ''
      } ${isBeachRadio ? 'beach-radio-page' : ''}`}
      style={isBeachRadio ? undefined : { backgroundImage: `url(${sceneImage})` }}
    >
      <div className="page-top">
        <button type="button" className="back" onClick={onBack}>
          <ArrowLeft size={18} /> Все игры
        </button>
        <span>{game.emoji}</span>
      </div>
      <section className={`game-layout ${isBeachSearch ? 'beach-search-layout' : ''} ${isBookShelf ? 'book-shelf-layout' : ''} ${isFlappyBird ? 'flappy-bird-layout' : ''}`}>

      <GameHud onOpenRadio={openRadio} />

        <div className={`game-panel ${isBeachSearch ? 'beach-search-panel' : ''}`}>
          {!isImmersiveGame && (
            <>
              <h1>{game.title}</h1>
              <p>Выполни задание, чтобы отметить игру как пройденную.</p>
            </>
          )}
          <GameScreen
            onComplete={() => completeGame(game.id)}
            onOpenRadio={isBeachRadio ? openRadio : undefined}
          />
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

      <RadioModal open={radioOpen} onClose={() => setRadioOpen(false)} />
    </main>
  )
}
