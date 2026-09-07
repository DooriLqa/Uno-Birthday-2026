import { audioController } from '@/shared/lib/audio/audioController'

export function playSegmentTurnSound() {
  audioController.playOneShot('/audio/sfx/totem-segment-turn.ogg', {
    volume: 0.45,
    key: 'totem-turn',
  })
}
