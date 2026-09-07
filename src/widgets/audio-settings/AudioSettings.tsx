import { useEffect } from 'react'
import { Volume2, VolumeX } from 'lucide-react'
import { audioController } from '@/shared/lib/audio/audioController'
import { useAudioSettingsStore } from '@/shared/lib/audio/audioSettingsStore'
import './AudioSettings.css'

export function AudioSettings() {
  const volume = useAudioSettingsStore((state) => state.masterVolume)
  const setVolume = useAudioSettingsStore((state) => state.setMasterVolume)

  useEffect(() => {
    const unlock = () => {
      void audioController.unlock()
    }
    document.addEventListener('pointerdown', unlock, true)
    document.addEventListener('keydown', unlock, true)
    return () => {
      document.removeEventListener('pointerdown', unlock, true)
      document.removeEventListener('keydown', unlock, true)
    }
  }, [])

  return (
    <label
      className="audio-settings"
      onPointerDown={(event) => event.stopPropagation()}
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
      onKeyUp={(event) => event.stopPropagation()}
    >
      {volume === 0 ? <VolumeX size={18} aria-hidden /> : <Volume2 size={18} aria-hidden />}
      <span>Общий звук</span>
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={volume}
        onChange={(event) => setVolume(Number(event.target.value))}
        aria-label="Общая громкость приложения"
        aria-valuetext={`${Math.round(volume * 100)}%`}
      />
      <output>{Math.round(volume * 100)}%</output>
    </label>
  )
}
