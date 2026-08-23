import { useNavigate } from 'react-router-dom'
import type { CSSProperties } from 'react'
import { games } from '@/entities/game/model/games'
import { useProgressStore } from '@/features/game-progress/model/store'
import { SiteHeader } from '@/widgets/site-header/SiteHeader'

export function GamesPage() {
  const navigate = useNavigate()
  const completedIds = useProgressStore((state) => state.completedGameIds)
  return (
    <main className="beach-shell">
      <SiteHeader />
      <section className="hero">
        <h1>
          Пляжные
          <br />
          приключения
        </h1>
        <p className="subtitle">Выбери мини-игру и собери все пять солнечных побед!</p>
      </section>
      <section className="game-grid" aria-label="Мини-игры">
        {games.map((game) => (
          <button
            key={game.id}
            type="button"
            className="game-card"
            style={{ '--card-color': game.color } as CSSProperties}
            onClick={() => navigate(`/games/${game.id}`)}
          >
            <span className="game-card__status">
              {completedIds.includes(game.id) ? 'Готово ✓' : 'Играть'}
            </span>
            <h2>{game.title}</h2>
            <p>{game.description}</p>
            <span className="game-card__emoji" aria-hidden>
              {game.emoji}
            </span>
          </button>
        ))}
      </section>
    </main>
  )
}
