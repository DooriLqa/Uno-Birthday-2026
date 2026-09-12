export type DialogueEmotion = 'neutral' | 'happy' | 'surprised' | 'sad' | 'angry' | 'giggling'

export type DialogueSpeaker = {
  id: string
  name: string
  isMain?: boolean
  sprite?: string
  spritesByEmotion?: Partial<Record<DialogueEmotion, string>>
}

export type DialogueChoice = {
  id: string
  label: string
  onSelect: () => void
}

export type DialogueMessage = {
  id: string
  speaker: DialogueSpeaker
  emotion: DialogueEmotion
  text: string
  sound?: string
  onComplete?: () => void
  choices?: DialogueChoice[]
}

export const getDialogueMessageSprite = (message: DialogueMessage) =>
  message.speaker.spritesByEmotion?.[message.emotion] ?? message.speaker.sprite

export type Dialogue = {
  id: string
  restartOnOpen?: boolean
  messages: DialogueMessage[]
}

export type DialogueReadState = {
  isRead: boolean
  readMessageIds: string[]
}
