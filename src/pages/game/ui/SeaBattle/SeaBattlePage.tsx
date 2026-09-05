import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useProgressStore } from '@/features/game-progress/model/store'
import { SeaBattle } from '@/features/sea-battle'

import './SeaBattlePage.css'

export function SeaBattlePage() {
  const completeGame = useProgressStore((state) => state.completeGame)

  return (
    <main className="sea-battle-page">
      <div className="sea-battle-page__top">
        <Link to="/" className="sea-battle-page__back">
          <ArrowLeft size={18} />
          Все игры
        </Link>
      </div>

      <header className="sea-battle-page__header">
        <div>
          <div className="sea-battle-page__eyebrow">🌊 Морская охота</div>
          <h1>Морской бой</h1>
          <p>Найди и потопи корабли, пока не закончились торпеды.</p>
        </div>
      </header>

      <section className="sea-battle-page__task" aria-label="Задание и управление">
        <h2>Задание</h2>
        <div className="sea-battle-page__task-grid">
          <p><strong>A / ←</strong> — переместить прицел влево.</p>
          <p><strong>D / →</strong> — переместить прицел вправо.</p>
          <p><strong>Пробел</strong> — выстрелить.</p>
          <p><strong>ЛКМ</strong> — выстрелить.</p>
          <p><strong>10 торпед</strong> — один выстрел раз в 3 секунды.</p>
          <p><strong>5 попаданий</strong> — победа.</p>
        </div>
      </section>

      <section className="sea-battle-page__game">
        <SeaBattle onComplete={() => completeGame('sea-battle')} />
      </section>
    </main>
  )
}
