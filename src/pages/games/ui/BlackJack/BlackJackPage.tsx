import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'

import { BlackJack } from '@/features/black-jack'
import { useProgressStore } from '@/features/game-progress/model/store'
import './BlackJackPage.css'

const REQUIRED_WINS = 5

export function BlackJackPage() {
  const completeGame = useProgressStore((state) => state.completeGame)

  const isComplete = useProgressStore((state) => state.completedGameIds.includes('black-jack'))

  const [winStreak, setWinStreak] = useState(0)

  useEffect(() => {
    if (winStreak >= REQUIRED_WINS) {
      completeGame('black-jack')
    }
  }, [winStreak, completeGame])

  const handleWin = () => {
    setWinStreak((current) => Math.min(current + 1, REQUIRED_WINS))
  }

  const handleLoss = () => {
    setWinStreak(0)
  }

  return (
    <main className="beach-shell">
      <div className="page-top">
        <Link to="/" className="back">
          <ArrowLeft size={18} /> Все игры
        </Link>
        <span>🃏</span>
      </div>

      <section className="game-layout">
        <div className="game-panel">
          <h1>Black Jack</h1>

          <p>Набери как можно ближе к 21 очку и опереди раздающего, не превысив 21.</p>

          <div className="black-jack-page__progress">
            <span>Победы подряд</span>
            <strong>
              {winStreak}/{REQUIRED_WINS} верно
            </strong>
          </div>

          <BlackJack onWin={handleWin} onLoss={handleLoss} />
        </div>

        <aside className="info-panel">
          <h2>{isComplete ? 'Игра пройдена!' : 'Задание'}</h2>

          <p>
            Победи раздающего <strong>5 раз подряд</strong>, чтобы пройти игру.
          </p>

          <p>Если проиграешь раунд, серия побед начинается заново с 0/5.</p>

          <p className="black-jack-page__score">
            Серия: {winStreak}/{REQUIRED_WINS}
          </p>

          {isComplete && <p className="black-jack-page__completed">Победа засчитана! 🎉</p>}
        </aside>
      </section>
    </main>
  )
}
