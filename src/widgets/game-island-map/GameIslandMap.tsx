import type { Game } from '@/entities/game/model/games'
import tropicalIslandMap from '@/shared/assets/island-map/tropical-island-map-expanded.png'
import './GameIslandMap.css'

type Props = { games: Game[]; completedIds: string[]; onPlay: (gameId: string) => void }

const markerPositions: Record<string, { left: string; top: string }> = {
  'beach-radio': { left: '84%', top: '72%' },
  'shell-hunt': { left: '27%', top: '38%' },
  'coconut-catch': { left: '47%', top: '51%' },
  'wave-rider': { left: '72%', top: '37%' },
  'ice-cream': { left: '28%', top: '65%' },
  'treasure-map': { left: '70%', top: '65%' },
  'beach-search': { left: '49%', top: '75%' },
  Japonsk: { left: '51%', top: '35%' },
  'robot-maze': { left: '54%', top: '35%' },
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
