import { useEffect, useRef } from 'react'
import { audioController, type Sound } from '@/shared/lib/audio/audioController'

// One pair of loops for the whole region; scene changes adjust gain, never restart them.
export function useBeachAmbience(multiplier: number) {
  const sounds = useRef<Sound[]>([])
  const latest = useRef(multiplier)
  useEffect(() => {
    latest.current = multiplier
    sounds.current.forEach((sound, index) => sound.setVolume(multiplier * (index === 0 ? 0.16 : 0.035)))
  }, [multiplier])
  useEffect(() => {
    const start = () => {
      if (!sounds.current.length) {
        try {
          sounds.current = [
            audioController.createSound('/audio/ambience/sea.flac', { loop: true, volume: 0.16 * latest.current }),
            audioController.createSound('/audio/ambience/gulls.mp3', { loop: true, volume: 0.035 * latest.current }),
          ]
        } catch { return }
      }
      sounds.current.forEach((sound) => { if (sound.element.paused) void sound.play() })
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
