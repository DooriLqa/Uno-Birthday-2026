import { useEffect, useState } from 'react'
import { getGame } from '@/app/gameRegistry'
import { GamePage } from '@/pages/game'
import { GameIslandMap } from '@/widgets/game-island-map'
import { DevCoinControls } from '@/widgets/dev-coin-controls/DevCoinControls'
import { GameHud } from '@/widgets/game-hud/GameHud'
import { RadioModal } from '@/features/beach-radio'
import { LocationNavigator } from '@/features/location-navigation'
import { locations } from '@/features/location-navigation/model/locations'
import {
  hasIslandMap,
  openMapWarning,
  talkToMerchant,
  tryEnterJungleCave,
} from '@/features/location-navigation/model/merchantDialogues'
import { useWorldStore } from '@/features/location-navigation/model/worldStore'
import { useBeachAmbience } from '@/features/location-navigation/model/useBeachAmbience'
import {
  openFishermanIntroduction,
  openPirateIntroduction,
} from '@/features/location-navigation/model/wildBeachDialogues'
import { playOneShotSound } from '@/shared/lib/audio/playOneShotSound'
import { useDialogueStore } from '@/features/dialogues'

export function GameFlow() {
  const [activeGameId, setActiveGameId] = useState<string | null>(null)
  const [mapOpen, setMapOpen] = useState(false)
  const [radioOpen, setRadioOpen] = useState(false)
  const { scene, setScene, setHistory } = useWorldStore()
  const activeGame = getGame(activeGameId)
  const ambienceVolume = locations[scene.locationId]?.ambienceVolume ?? 0
  useBeachAmbience(mapOpen ? 0 : activeGame ? ambienceVolume * 0.15 : ambienceVolume)

  useEffect(() => {
    if (mapOpen || activeGame || radioOpen) return
    if (scene.locationId === 'fisher-hut') openFishermanIntroduction()
    if (scene.locationId === 'pirate-shore') openPirateIntroduction()
  }, [activeGame, mapOpen, radioOpen, scene.locationId])

  const openGame = (gameId: string) => {
    playOneShotSound(getGame(gameId)?.transitionSound)
    setActiveGameId(gameId)
  }
  const openMap = () => {
    if (useDialogueStore.getState().activeDialogueId) return
    if (mapOpen) {
      setMapOpen(false)
      return
    }
    if (!hasIslandMap()) { openMapWarning(); return }
    playOneShotSound(locations.pier.transitionSound)
    setActiveGameId(null)
    setMapOpen(true)
  }
  return (
    <main className="island-map-page">
      {mapOpen && <GameIslandMap
        onOpenRegion={(entry) => {
          playOneShotSound(locations[entry].transitionSound)
          setScene({ locationId: entry, pan: 0.5 })
          setHistory([])
          setMapOpen(false)
        }}
      />}
      <GameHud mapOpen={mapOpen} onOpenRadio={() => setRadioOpen(true)} onOpenMap={openMap} />
      <LocationNavigator
        active={!mapOpen && !activeGame && !radioOpen}
        visible={!activeGame && !radioOpen}
        onOpenMap={openMap} onOpenGame={openGame}
        onMerchant={() => talkToMerchant(() => openGame('beach-radio'))}
        onEnterJungleCave={() => tryEnterJungleCave(() => openGame('japonsk'))} />
      {activeGame && <GamePage game={activeGame}
        onBack={() => {
          playOneShotSound(activeGame.transitionSound)
          setActiveGameId(null)
        }} onOpenRadio={() => setRadioOpen(true)} />}
      <RadioModal open={radioOpen} onClose={() => setRadioOpen(false)} />
      <DevCoinControls />
    </main>
  )
}
