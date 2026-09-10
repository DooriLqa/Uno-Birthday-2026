import { useEffect, useRef } from 'react'
import { audioController, type Sound } from '@/shared/lib/audio/audioController'
import seaAmbience from '@/shared/assets/locations/common/audio/sea.flac'
import gullsAmbience from '@/shared/assets/locations/common/audio/gulls.mp3'

// One pair of loops for the whole region; scene changes adjust gain, never restart them.
export function useBeachAmbience(multiplier: number) {
  const sounds = useRef<Sound[]>([])
  const latest = useRef(multiplier)
  useEffect(() => {
    latest.current = multiplier
    sounds.current.forEach((sound, index) =>
      sound.setVolume(multiplier * (index === 0 ? 0.16 : 0.035)),
    )
  }, [multiplier])
  useEffect(() => {
    const start = () => {
      if (!sounds.current.length) {
        try {
          sounds.current = [
            audioController.createSound(seaAmbience, {
              loop: true,
              volume: 0.16 * latest.current,
            }),
            audioController.createSound(gullsAmbience, {
              loop: true,
              volume: 0.035 * latest.current,
            }),
          ]
        } catch {
          return
        }
      }
      sounds.current.forEach((sound) => {
        if (sound.element.paused) void sound.play()
      })
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
  }, [])
}
