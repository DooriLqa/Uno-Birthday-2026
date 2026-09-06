import type { GameDefinition } from '@/entities/game/model/types'
import tropicalIslandMap from '@/shared/assets/island-map/tropical-island-map-expanded.png'
import './GameIslandMap.css'

type Props = { games: GameDefinition[]; completedIds: string[]; onPlay: (gameId: string) => void }

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
          return (
            <button
              key={game.id}
              type="button"
              className={`game-island-map__marker ${completedIds.includes(game.id) ? 'is-completed' : ''}`}
              style={game.mapPosition}
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
