import type { ComponentType } from 'react'

export type GameScreenProps = {
  onComplete: () => void
  onOpenRadio?: () => void
  onClose?: () => void
}

export type GameDefinition = {
  id: string
  title: string
  description: string
  emoji: string
  color: string
  target: string
  mapPosition: { left: string; top: string }
  pageClassName?: string
  backgroundImage?: string
  Screen: ComponentType<GameScreenProps>
}
