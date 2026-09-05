import { games } from '@/entities/game/model/games'
import { useProgressStore } from '@/features/game-progress/model/store'
import { GameIslandMap } from '@/widgets/game-island-map'
import { SiteHeader } from '@/widgets/site-header/SiteHeader'

type Props = { onPlay: (gameId: string) => void }

export function GamesPage({ onPlay }: Props) {
  const completedIds = useProgressStore((state) => state.completedGameIds)
  return (
    <main className="island-map-page">
      <SiteHeader />
      <GameIslandMap games={games} completedIds={completedIds} onPlay={onPlay} />
    </main>
  )
}
