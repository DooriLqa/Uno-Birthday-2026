import { Sun } from 'lucide-react'
import { useProgressStore } from '@/features/game-progress/model/store'
import { games } from '@/entities/game/model/games'

export function SiteHeader() {
  const completed = useProgressStore((state) => state.completedGameIds.length)
  return (
    <header className="site-header">
      <div className="brand">
        <span className="brand__sun">
          <Sun size={25} />
        </span>{' '}
        Beach Day
      </div>
      <div className="progress">
        Пройдено: {completed}/{games.length}
      </div>
    </header>
  )
}
