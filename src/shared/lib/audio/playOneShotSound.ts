import { audioController } from './audioController'

export function playOneShotSound(source?: string) {
  if (!source) return

  audioController.playOneShot(source, { volume: 0.4, key: 'location-transition' })
}
