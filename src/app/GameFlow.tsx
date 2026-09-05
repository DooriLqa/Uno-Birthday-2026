import { useState } from 'react'
import { games } from '@/entities/game/model/games'
import { useProgressStore } from '@/features/game-progress/model/store'
import { GamePage } from '@/pages/game'
import { GameIslandMap } from '@/widgets/game-island-map'
import { SiteHeader } from '@/widgets/site-header/SiteHeader'
import { DevCoinControls } from '@/widgets/dev-coin-controls/DevCoinControls'
import { GameHud } from '@/widgets/game-hud/GameHud'
import { RadioModal } from '@/features/beach-radio'

export function GameFlow() {
  const [activeGameId, setActiveGameId] = useState<string | null>(null)
  const [radioOpen, setRadioOpen] = useState(false)
  const completedIds = useProgressStore((state) => state.completedGameIds)

  return (
    <main className="island-map-page">
      <SiteHeader />
      <GameIslandMap games={games} completedIds={completedIds} onPlay={setActiveGameId} />
      {!activeGameId && <GameHud onOpenRadio={() => setRadioOpen(true)} />}
      {activeGameId && <GamePage gameId={activeGameId} onBack={() => setActiveGameId(null)} />}
      <RadioModal open={radioOpen} onClose={() => setRadioOpen(false)} />
      <DevCoinControls />
    </main>
  )
}
