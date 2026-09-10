import { audioController } from '@/shared/lib/audio/audioController'
import segmentTurnSound from '@/shared/assets/games/totem-code/audio/totem-segment-turn.ogg'

export function playSegmentTurnSound() {
  audioController.playOneShot(segmentTurnSound, {
    volume: 0.45,
    key: 'totem-turn',
  })
}
