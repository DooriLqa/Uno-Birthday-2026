import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'

import { FindAPair } from '@/features/find-a-pair'
import { useProgressStore } from '@/features/game-progress/model/store'
import './FindAPairPage.css'

const REQUIRED_TIME = 30

export function FindAPairPage() {
  const completeGame = useProgressStore((state) => state.completeGame)

  const isComplete = useProgressStore((state) => state.completedGameIds.includes('find-a-pair'))

  const [completed, setCompleted] = useState(false)

  useEffect(() => {
    if (completed) {
      completeGame('find-a-pair')
    }
  }, [completed, completeGame])

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
          <h1>Find a Pair</h1>

          <p>Найди все пары карт с одинаковым значением. Масть значения не имеет.</p>

          <FindAPair onComplete={() => setCompleted(true)} />
        </div>

        <aside className="info-panel">
          <h2>{isComplete ? 'Игра пройдена!' : 'Задание'}</h2>

          <p>
            Найди все <strong>12 пар</strong> на поле 6×4 карт.
          </p>

          <p>
            На всё прохождение даётся <strong>{REQUIRED_TIME} секунд</strong>.
          </p>

          {isComplete && <p className="find-a-pair-page__completed">Все пары найдены! 🎉</p>}
        </aside>
      </section>
    </main>
  )
}
