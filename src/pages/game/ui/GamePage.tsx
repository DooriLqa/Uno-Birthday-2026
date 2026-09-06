import { useState, type ComponentType } from 'react'
import { ArrowLeft } from 'lucide-react'
import { getGame } from '@/entities/game/model/games'
import { useProgressStore } from '@/features/game-progress/model/store'
import { BeachRadioGame, RadioModal } from '@/features/beach-radio'
import { TotemCodeGame } from '@/features/totem-code'
import { CoconutCatchGame } from '@/features/coconut-catch'
import { FruitBasketGame } from '@/features/fruit-basket'
import { WaveRiderGame } from '@/features/wave-rider'
import { IceCreamGame } from '@/features/ice-cream'
import { TreasureMapGame } from '@/features/treasure-map'
import { BeachSearchGame } from '@/features/beach-search'
import { BookShelfGame } from '@/features/book-shelf'
import { FlappyBirdGame } from '@/features/flappy-bird'
import { FishingGame } from '@/features/fishing'
import islandMapImage from '@/shared/assets/island-map/tropical-island-map-expanded.png'
import totemBeachScene from '@/shared/assets/totem-code/totem-beach-scene-no-fire.png'
import { Button } from '@/shared/ui/Button'
import { GameHud } from '@/widgets/game-hud/GameHud'
import { BlackJack } from '@/features/black-jack'
import { FindAPair } from '@/features/find-a-pair'
import { SeaBattle } from '@/features/sea-battle'
import { ShellGamePage } from '@/pages/games/ui/ShellGame/ShellGamePage'
import { WackAMole } from '@/features/wack-a-mole'
import { Arkanoid } from '@/features/arkanoid'
import { LockPickingGame } from '@/features/lock-picking'
import { Japonsk } from '@/features/cropp/Japonsk'
import { RobotMazeGame } from '@/features/cropp/RobotMazeGame'

type GameScreenProps = {
  onComplete: () => void
  onOpenRadio?: () => void
  onClose?: () => void
}

type Props = { gameId: string; onBack: () => void }

const gameScreens: Record<string, ComponentType<GameScreenProps>> = {
  'book-shelf': BookShelfGame,
  'flappy-bird': FlappyBirdGame,
  'totem-code': TotemCodeGame,
  'coconut-catch': CoconutCatchGame,
  'fruit-basket': FruitBasketGame,
  'wave-rider': WaveRiderGame,
  'ice-cream': IceCreamGame,
  'treasure-map': TreasureMapGame,
  'beach-search': BeachSearchGame,
  'beach-radio': BeachRadioGame,
  'black-jack': BlackJack,
  'find-a-pair': FindAPair,
  'sea-battle': SeaBattle,
  'shell-game': ShellGamePage,
  'wack-a-mole': WackAMole,
  arkanoid: Arkanoid,
  'lock-picking': LockPickingGame,
  fishing: FishingGame,
  'japonsk': Japonsk,
  'robot-maze': RobotMazeGame,
}

const specialSceneImages: Record<string, string> = {
  'totem-code': totemBeachScene,
}

export function GamePage({ gameId, onBack }: Props) {
  const [radioOpen, setRadioOpen] = useState(false)
  const game = getGame(gameId)
  const completeGame = useProgressStore((state) => state.completeGame)
  const isComplete = useProgressStore((state) => state.completedGameIds.includes(gameId))

  if (!game) return null

  const GameScreen = gameScreens[game.id]
  const isBeachSearch = game.id === 'beach-search'
  const isBookShelf = game.id === 'book-shelf'
  const isFlappyBird = game.id === 'flappy-bird'
  const isTotemCode = game.id === 'totem-code'
  const isBeachRadio = game.id === 'beach-radio'
  const isFruitBasket = game.id === 'fruit-basket'
  const isImmersiveGame =
    isBeachSearch || isTotemCode || isBeachRadio || isBookShelf || isFlappyBird || isFruitBasket
  const isFishing = game.id === 'fishing'
  const sceneImage = specialSceneImages[game.id] ?? islandMapImage
  const openRadio = () => setRadioOpen(true)

  return (
    <main
      className={`beach-shell game-overlay ${isBeachSearch ? 'beach-search-page' : ''} ${
        isTotemCode ? 'totem-code-page' : ''
      } ${isBookShelf ? 'book-shelf-page' : ''} ${isTotemCode ? 'totem-code-page' : ''} ${
        isFlappyBird ? 'flappy-bird-page' : ''
      } ${isBeachRadio ? 'beach-radio-page' : ''} ${
        isFishing ? 'fishing-page' : ''
      } ${isFruitBasket ? 'fruit-basket-page' : ''}`}
      style={
        isFishing
          ? { backgroundImage: `url(${islandMapImage})` }
          : isBeachRadio || isFruitBasket
            ? undefined
            : { backgroundImage: `url(${sceneImage})` }
      }
    >
      <div className="page-top">
        <button type="button" className="back" onClick={onBack}>
          <ArrowLeft size={18} /> Все игры
        </button>
        <span>{game.emoji}</span>
      </div>
      <section
        className={`game-layout ${isBeachSearch ? 'beach-search-layout' : ''} ${isBookShelf ? 'book-shelf-layout' : ''} ${isFlappyBird ? 'flappy-bird-layout' : ''}`}
      >
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
            onClose={isFishing ? onBack : undefined}
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
