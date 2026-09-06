import { useState } from 'react'
import { MessageCircle } from 'lucide-react'
import { games, getGame } from '@/app/gameRegistry'
import { dialogueTestSamples, openDialogue } from '@/features/dialogues'
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
  const activeGame = getGame(activeGameId)

  return (
    <main className="island-map-page">
      <SiteHeader totalGames={games.length} />
      <GameIslandMap games={games} completedIds={completedIds} onPlay={setActiveGameId} />
      {!activeGameId && <GameHud onOpenRadio={() => setRadioOpen(true)} />}
      {!activeGameId && (
        <button
          type="button"
          className="main-dialogue-button"
          onClick={() => openDialogue(dialogueTestSamples[0])}
        >
          <MessageCircle size={20} /> Поговорить с Пончиком
        </button>
      )}
      {activeGame && <GamePage game={activeGame} onBack={() => setActiveGameId(null)} />}
      <RadioModal open={radioOpen} onClose={() => setRadioOpen(false)} />
      <DevCoinControls />
    </main>
  )
}
