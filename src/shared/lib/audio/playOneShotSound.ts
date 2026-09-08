import { audioController } from './audioController'

export function playOneShotSound(source?: string, key?: string, volume = 0.4) {
  if (!source) return

  audioController.playOneShot(source, { volume: volume, key: key || 'default' })
}
