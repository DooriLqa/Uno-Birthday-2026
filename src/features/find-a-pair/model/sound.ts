import { audioController } from '@/shared/lib/audio/audioController'

export function playCardSound() {
    audioController.playOneShot('/audio/sfx/card-sound.mp3', {
        volume: 0.45,
        key: 'find-a-pair-card',
    })
}