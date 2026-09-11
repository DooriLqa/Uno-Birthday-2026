import { useEffect, useRef } from 'react'
import { audioController, type Sound } from '@/shared/lib/audio/audioController'
import seaAmbience from '@/shared/assets/locations/common/audio/sea.flac'
import gullsAmbience from '@/shared/assets/locations/common/audio/gulls.mp3'

type AmbienceKind = 'beach' | 'niche-stream'
type AmbienceHandle = Pick<Sound, 'setVolume' | 'dispose'> & { play?: () => Promise<boolean> }

const levels = (kind: AmbienceKind, multiplier: number) =>
  kind === 'niche-stream'
    ? [multiplier * 0.105, multiplier * 0.024, multiplier * 0.013]
    : [multiplier * 0.16, multiplier * 0.035]

// One set of loops per environment; scene changes adjust gain through the master controller.
export function useBeachAmbience(multiplier: number, kind: AmbienceKind = 'beach') {
  const sounds = useRef<AmbienceHandle[]>([])
  const latest = useRef(multiplier)
  useEffect(() => {
    latest.current = multiplier
    const nextLevels = levels(kind, multiplier)
    sounds.current.forEach((sound, index) => sound.setVolume(nextLevels[index] ?? 0))
  }, [kind, multiplier])
  useEffect(() => {
    const start = () => {
      if (!sounds.current.length) {
        try {
          const nextLevels = levels(kind, latest.current)
          sounds.current =
            kind === 'niche-stream'
              ? [
                  audioController.createSound(seaAmbience, {
                    loop: true,
                    volume: nextLevels[0],
                  }),
                  audioController.createFilteredNoiseLoop({
                    volume: nextLevels[1],
                    type: 'bandpass',
                    frequency: 360,
                    q: 0.64,
                  }),
                  audioController.createFilteredNoiseLoop({
                    duration: 7,
                    volume: nextLevels[2],
                    type: 'bandpass',
                    frequency: 780,
                    q: 0.82,
                  }),
                ]
              : [
                  audioController.createSound(seaAmbience, {
                    loop: true,
                    volume: nextLevels[0],
                  }),
                  audioController.createSound(gullsAmbience, {
                    loop: true,
                    volume: nextLevels[1],
                  }),
                ]
        } catch {
          return
        }
      }
      sounds.current.forEach((sound) => void sound.play?.())
    }
    // Browsers require the first gesture. Further gestures retry only blocked playback.
    window.addEventListener('pointerdown', start)
    window.addEventListener('keydown', start)
    return () => {
      window.removeEventListener('pointerdown', start)
      window.removeEventListener('keydown', start)
      sounds.current.forEach((sound) => sound.dispose())
      sounds.current = []
    }
  }, [kind])
}
