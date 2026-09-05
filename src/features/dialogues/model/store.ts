import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Dialogue, DialogueReadState } from './types'

type DialogueState = {
  dialogues: Record<string, Dialogue>
  activeDialogueId: string | null
  activeMessageIndex: number
  readDialogueIds: string[]
  readMessageIdsByDialogue: Record<string, string[]>
  registerDialogue: (dialogue: Dialogue) => void
  openDialogue: (dialogue: Dialogue) => void
  openDialogueById: (dialogueId: string) => void
  nextMessage: () => void
  closeDialogue: () => void
  getReadState: (dialogueId: string) => DialogueReadState
}

const getFirstUnreadIndex = (dialogue: Dialogue, readMessageIds: string[]) => {
  const index = dialogue.messages.findIndex((message) => !readMessageIds.includes(message.id))
  return index === -1 ? 0 : index
}

export const useDialogueStore = create<DialogueState>()(
  persist(
    (set, get) => ({
      dialogues: {},
      activeDialogueId: null,
      activeMessageIndex: 0,
      readDialogueIds: [],
      readMessageIdsByDialogue: {},
      registerDialogue: (dialogue) =>
        set((state) => ({ dialogues: { ...state.dialogues, [dialogue.id]: dialogue } })),
      openDialogue: (dialogue) => {
        const readMessageIds = get().readMessageIdsByDialogue[dialogue.id] ?? []
        set((state) => ({
          dialogues: { ...state.dialogues, [dialogue.id]: dialogue },
          activeDialogueId: dialogue.id,
          activeMessageIndex: getFirstUnreadIndex(dialogue, readMessageIds),
        }))
      },
      openDialogueById: (dialogueId) => {
        const dialogue = get().dialogues[dialogueId]
        if (!dialogue) return
        const readMessageIds = get().readMessageIdsByDialogue[dialogueId] ?? []
        set({
          activeDialogueId: dialogueId,
          activeMessageIndex: getFirstUnreadIndex(dialogue, readMessageIds),
        })
      },
      nextMessage: () => {
        const state = get()
        const dialogueId = state.activeDialogueId
        if (!dialogueId) return

        const dialogue = state.dialogues[dialogueId]
        const message = dialogue?.messages[state.activeMessageIndex]
        if (!dialogue || !message) return

        const readMessageIds = state.readMessageIdsByDialogue[dialogueId] ?? []
        const nextReadMessageIds = readMessageIds.includes(message.id)
          ? readMessageIds
          : [...readMessageIds, message.id]
        const isLastMessage = state.activeMessageIndex === dialogue.messages.length - 1

        set({
          activeDialogueId: isLastMessage ? null : dialogueId,
          activeMessageIndex: isLastMessage ? 0 : state.activeMessageIndex + 1,
          readDialogueIds:
            isLastMessage && !state.readDialogueIds.includes(dialogueId)
              ? [...state.readDialogueIds, dialogueId]
              : state.readDialogueIds,
          readMessageIdsByDialogue: {
            ...state.readMessageIdsByDialogue,
            [dialogueId]: nextReadMessageIds,
          },
        })
        message.onComplete?.()
      },
      closeDialogue: () => set({ activeDialogueId: null, activeMessageIndex: 0 }),
      getReadState: (dialogueId) => {
        const readMessageIds = get().readMessageIdsByDialogue[dialogueId] ?? []
        const dialogue = get().dialogues[dialogueId]
        return {
          isRead: Boolean(
            dialogue && dialogue.messages.every((message) => readMessageIds.includes(message.id)),
          ),
          readMessageIds,
        }
      },
    }),
    {
      name: 'beach-party-dialogues',
      partialize: (state) => ({
        readDialogueIds: state.readDialogueIds,
        readMessageIdsByDialogue: state.readMessageIdsByDialogue,
      }),
    },
  ),
)

export const openDialogue = (dialogue: Dialogue) =>
  useDialogueStore.getState().openDialogue(dialogue)
