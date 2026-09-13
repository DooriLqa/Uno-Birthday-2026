import { useEffect, useState } from 'react'
import { getGame } from '@/app/gameRegistry'
import { GamePage } from '@/pages/game'
import { GameIslandMap } from '@/widgets/game-island-map'
import { DevCoinControls } from '@/widgets/dev-coin-controls/DevCoinControls'
import { CreditsOverlay } from '@/widgets/game-hud/CreditsOverlay'
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
import { talkToPierSailor } from '@/features/location-navigation/model/pierDialogues'
import { talkToNicheStreamBarista } from '@/features/location-navigation/model/nicheStreamDialogues'
import { playOneShotSound } from '@/shared/lib/audio/playOneShotSound'
import { useDialogueStore } from '@/features/dialogues'

const DEV_TOOLS_ENABLED = import.meta.env.VITE_ENABLE_DEV_TOOLS === 'true'

export function GameFlow() {
  const [activeGameId, setActiveGameId] = useState<string | null>(null)
  const [mapOpen, setMapOpen] = useState(false)
  const [radioOpen, setRadioOpen] = useState(false)
  const [creditsOpen, setCreditsOpen] = useState(false)
  const { scene, setScene, setHistory } = useWorldStore()
  const activeGame = getGame(activeGameId)
  const ambienceVolume = locations[scene.locationId]?.ambienceVolume ?? 0
  const ambience = locations[scene.locationId]?.ambience ?? 'beach'
  useBeachAmbience(mapOpen ? 0 : activeGame ? ambienceVolume * 0.15 : ambienceVolume, ambience)

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
    if (!hasIslandMap()) {
      openMapWarning()
      return
    }
    playOneShotSound(locations.pier.transitionSound)
    setActiveGameId(null)
    setMapOpen(true)
  }
  return (
    <main className="island-map-page">
      {mapOpen && (
        <GameIslandMap
          onClose={() => setMapOpen(false)}
          onOpenRegion={(entry) => {
            playOneShotSound(locations[entry].transitionSound)
            setScene({ locationId: entry, pan: 0.5 })
            setHistory([])
            setMapOpen(false)
          }}
        />
      )}
      <GameHud
        mapOpen={mapOpen}
        onOpenRadio={() => setRadioOpen(true)}
        onOpenMap={openMap}
        showCreditsButton={!DEV_TOOLS_ENABLED}
        creditsOpen={creditsOpen}
        onToggleCredits={() => setCreditsOpen((value) => !value)}
      />
      <LocationNavigator
        active={!mapOpen && !activeGame && !radioOpen}
        visible={(!activeGame || activeGame.id === 'beach-radio') && !radioOpen}
        onOpenMap={openMap}
        onOpenGame={openGame}
        onMerchant={() => talkToMerchant(() => openGame('beach-radio'))}
        onSailor={() => talkToPierSailor(() => openGame('find-a-pair'))}
        onEnterJungleCave={() => tryEnterJungleCave(() => openGame('japonsk'))}
        onBarista={talkToNicheStreamBarista}
      />
      {activeGame && (
        <GamePage
          game={activeGame}
          onBack={() => {
            playOneShotSound(activeGame.transitionSound)
            setActiveGameId(null)
          }}
          onOpenRadio={() => setRadioOpen(true)}
        />
      )}
      <RadioModal open={radioOpen} onClose={() => setRadioOpen(false)} />
      <CreditsOverlay open={creditsOpen} onClose={() => setCreditsOpen(false)} />
      {DEV_TOOLS_ENABLED && <DevCoinControls onOpenCredits={() => setCreditsOpen(true)} />}
    </main>
  )
}
