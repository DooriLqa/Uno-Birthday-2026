import { RotateCcw, Sun } from 'lucide-react'
import { useProgressStore } from '@/features/game-progress/model/store'

type Props = { totalGames: number }

export function SiteHeader({ totalGames }: Props) {
  const completed = useProgressStore((state) => state.completedGameIds.length)
  const resetProgress = useProgressStore((state) => state.resetProgress)
  const handleReset = () => {
    if (window.confirm('Сбросить прогресс всех игр?')) resetProgress()
  }
  return (
    <header className="site-header">
      <div className="brand">
        <span className="brand__sun">
          <Sun size={25} />
        </span>{' '}
        Beach Day
      </div>
      <div className="site-header__actions">
        <div className="progress">
          Пройдено: {completed}/{totalGames}
        </div>
        <button
          type="button"
          className="reset-button"
          onClick={handleReset}
          aria-label="Сбросить прогресс игр"
        >
          <RotateCcw size={17} />
          Сбросить
        </button>
      </div>
    </header>
  )
}
