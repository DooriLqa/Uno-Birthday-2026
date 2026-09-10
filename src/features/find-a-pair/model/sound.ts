import { audioController } from '@/shared/lib/audio/audioController'
import cardSound from '@/shared/assets/games/find-a-pair/audio/card-sound.mp3'

export function playCardSound() {
  audioController.playOneShot(cardSound, {
    volume: 0.45,
    key: 'find-a-pair-card',
  })
}
