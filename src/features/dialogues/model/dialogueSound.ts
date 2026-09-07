import { audioController } from '@/shared/lib/audio/audioController'

export const playDialogueSound = (source: string) => {
  audioController.playOneShot(source, { volume: 0.55, key: 'dialogue' })
}
