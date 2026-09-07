import { useState } from 'react'
import { MessageCircle } from 'lucide-react'
import { games, getGame } from '@/app/gameRegistry'
import { dialogueTestSamples, openDialogue } from '@/features/dialogues'
import { useProgressStore } from '@/features/game-progress/model/store'
import { GamePage } from '@/pages/game'
import { GameIslandMap } from '@/widgets/game-island-map'
import { DevCoinControls } from '@/widgets/dev-coin-controls/DevCoinControls'
import { GameHud } from '@/widgets/game-hud/GameHud'
import { RadioModal } from '@/features/beach-radio'
import { LocationNavigator } from '@/features/location-navigation'
import { locations } from '@/features/location-navigation/model/locations'
import { playOneShotSound } from '@/shared/lib/audio/playOneShotSound'

export function GameFlow() {
  const [activeGameId, setActiveGameId] = useState<string | null>(null)
  const [isBeachLocationOpen, setIsBeachLocationOpen] = useState(false)
  const [radioOpen, setRadioOpen] = useState(false)
  const completedIds = useProgressStore((state) => state.completedGameIds)
  const activeGame = getGame(activeGameId)

  const moveToLocation = (gameId: string | null, transitionSound?: string) => {
    playOneShotSound(transitionSound)
    setActiveGameId(gameId)
  }

  return (
    <main className="island-map-page">
      <GameIslandMap
        games={games}
        completedIds={completedIds}
        onPlay={(gameId) => moveToLocation(gameId, getGame(gameId)?.transitionSound)}
        onOpenBeach={() => {
          playOneShotSound(locations['beach-panorama'].transitionSound)
          setIsBeachLocationOpen(true)
        }}
      />
      <GameHud
        onOpenRadio={() => setRadioOpen(true)}
        onOpenMap={() => {
          if (isBeachLocationOpen) playOneShotSound(locations['beach-panorama'].transitionSound)
          setActiveGameId(null)
          setIsBeachLocationOpen(false)
        }}
      />
      {!activeGameId && !isBeachLocationOpen && (
        <button
          type="button"
          className="main-dialogue-button"
          onClick={() => openDialogue(dialogueTestSamples[0])}
        >
          <MessageCircle size={20} /> Поговорить с Пончиком
        </button>
      )}
      {!activeGameId && !isBeachLocationOpen && (
        <button
          type="button"
          className="location-demo-entry"
          onClick={() => setIsBeachLocationOpen(true)}
        >
          🏖️ Прогуляться по пляжу
        </button>
      )}
      {isBeachLocationOpen && (
        <LocationNavigator
          initialLocationId="beach-panorama"
          onExit={(transitionSound) => {
            playOneShotSound(transitionSound)
            setIsBeachLocationOpen(false)
          }}
          onOpenGame={(gameId) => moveToLocation(gameId, getGame(gameId)?.transitionSound)}
          onOpenDialogue={() => openDialogue(dialogueTestSamples[0])}
        />
      )}
      {activeGame && (
        <GamePage
          game={activeGame}
          onBack={() => moveToLocation(null, activeGame.transitionSound)}
          onOpenRadio={() => setRadioOpen(true)}
        />
      )}
      <RadioModal open={radioOpen} onClose={() => setRadioOpen(false)} />
      <DevCoinControls />
    </main>
  )
}
