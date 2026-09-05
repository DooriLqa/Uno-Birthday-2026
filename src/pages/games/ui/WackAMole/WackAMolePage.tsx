import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { WackAMole } from '@/features/wack-a-mole'
import { useProgressStore } from '@/features/game-progress/model/store'
import './WackAMolePage.css'

export function WackAMolePage() {
  const completeGame = useProgressStore((s) => s.completeGame)
  const isComplete = useProgressStore((s) => s.completedGameIds.includes('wack-a-mole'))
  const [completed, setCompleted] = useState(false)
  useEffect(() => {
    if (completed) completeGame('wack-a-mole')
  }, [completed, completeGame])
  return (
    <main className="beach-shell">
      <div className="page-top">
        <Link to="/" className="back">
          <ArrowLeft size={18} /> Все игры
        </Link>
        <span>🔨</span>
      </div>
      <section className="game-layout">
        <div className="game-panel">
          <h1>Wack a Mole</h1>
          <p>Ударь по кроту, пока он не исчез. У тебя есть 30 секунд.</p>
          <WackAMole onComplete={() => setCompleted(true)} />
        </div>
        <aside className="info-panel">
          <h2>{isComplete ? 'Игра пройдена!' : 'Задание'}</h2>
          <p>
            Попади по <strong>кроту</strong>, пока он находится за одним из кустов.
          </p>
          <p>
            На поиск цели даётся <strong>30 секунд</strong>. Для победы нужно сделать{' '}
            <strong>10 попаданий</strong>.
          </p>
          {isComplete && <p className="wack-a-mole-page__completed">Крот пойман! 🎯</p>}
        </aside>
      </section>
    </main>
  )
}
