import type { Game } from '@/entities/game/model/games'
import tropicalIslandMap from '@/shared/assets/island-map/tropical-island-map-expanded.png'
import './GameIslandMap.css'

type Props = { games: Game[]; completedIds: string[]; onPlay: (gameId: string) => void }

const markerPositions: Record<string, { left: string; top: string }> = {
  'beach-radio': { left: '84%', top: '72%' },
  'book-shelf': { left: '42%', top: '32%' },
  'flappy-bird': { left: '60%', top: '23%' },
  'totem-code': { left: '27%', top: '38%' },
  'coconut-catch': { left: '47%', top: '51%' },
  'fruit-basket': { left: '83%', top: '45%' },
  'wave-rider': { left: '72%', top: '37%' },
  'ice-cream': { left: '28%', top: '65%' },
  'treasure-map': { left: '70%', top: '65%' },
  'beach-search': { left: '49%', top: '75%' },
  'black-jack': { left: '40%', top: '35%' },
  'find-a-pair': { left: '42%', top: '30%' },
  'sea-battle': { left: '44%', top: '39%' },
  'shell-game': { left: '46%', top: '30%' },
  'wack-a-mole': { left: '48%', top: '38%' },
  arkanoid: { left: '50%', top: '30%' },
  'lock-picking': { left: '54%', top: '47%' },
  fishing: { left: '58%', top: '22%' },
}

export function GameIslandMap({ games, completedIds, onPlay }: Props) {
  return (
    <section className="game-island-map" aria-label="Карта острова с мини-играми">
      <img className="game-island-map__backdrop" src={tropicalIslandMap} alt="" />
      <div className="game-island-map__active-area">
        <img
          className="game-island-map__image"
          src={tropicalIslandMap}
          alt="Карта тропического острова"
        />
        {games.map((game) => {
          const position = markerPositions[game.id]
          return (
            <button
              key={game.id}
              type="button"
              className={`game-island-map__marker ${completedIds.includes(game.id) ? 'is-completed' : ''}`}
              style={position}
              onClick={() => onPlay(game.id)}
              aria-label={`Открыть игру: ${game.title}`}
            >
              <span className="game-island-map__tooltip" role="tooltip">
                {game.title}
              </span>
              <span className="game-island-map__icon" aria-hidden>
                {game.emoji}
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
