import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { playDialogueSound } from '@/features/dialogues/model/dialogueSound'
import { useDialogueStore } from '@/features/dialogues/model/store'
import { getDialogueMessageSprite } from '@/features/dialogues/model/types'
import './DialogueLayer.css'

export function DialogueLayer() {
  const activeDialogueId = useDialogueStore((state) => state.activeDialogueId)
  const activeMessageIndex = useDialogueStore((state) => state.activeMessageIndex)
  const dialogue = useDialogueStore((state) =>
    state.activeDialogueId ? state.dialogues[state.activeDialogueId] : undefined,
  )
  const nextMessage = useDialogueStore((state) => state.nextMessage)
  const selectChoice = useDialogueStore((state) => state.selectChoice)
  const closeDialogue = useDialogueStore((state) => state.closeDialogue)
  const historyRef = useRef<HTMLDivElement>(null)
  const playedMessageKeyRef = useRef<string | null>(null)

  const message = dialogue?.messages[activeMessageIndex]
  const hasChoices = Boolean(message?.choices?.length)

  useEffect(() => {
    if (!activeDialogueId) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeDialogue()
        return
      }
      if (!hasChoices && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault()
        nextMessage()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeDialogueId, closeDialogue, hasChoices, nextMessage])

  useEffect(() => {
    const history = historyRef.current
    if (!history) return
    history.scrollTo({ top: history.scrollHeight, behavior: 'smooth' })
  }, [activeDialogueId, activeMessageIndex])

  useEffect(() => {
    if (!activeDialogueId) {
      playedMessageKeyRef.current = null
      return
    }

    const messageKey = `${activeDialogueId}:${message?.id}`
    if (!message?.sound || playedMessageKeyRef.current === messageKey) return

    playedMessageKeyRef.current = messageKey
    playDialogueSound(message.sound)
  }, [activeDialogueId, message])

  if (!dialogue || !message) return null

  const visibleMessages = dialogue.messages.slice(0, activeMessageIndex + 1)
  const lastSpeakerWithSprite = [...visibleMessages]
    .reverse()
    .find((dialogueMessage) => getDialogueMessageSprite(dialogueMessage))
  const speakerSprite = lastSpeakerWithSprite && getDialogueMessageSprite(lastSpeakerWithSprite)
  const isSpeakerMuted = Boolean(lastSpeakerWithSprite && lastSpeakerWithSprite.speaker.id !== message.speaker.id)

  return (
    <section
      className={`dialogue-layer ${hasChoices ? 'dialogue-layer--has-choices' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label={`Диалог: ${dialogue.id}`}
      onClick={() => { if (!hasChoices) nextMessage() }}
    >
      <button
        type="button"
        className="dialogue-layer__close"
        aria-label="Закрыть диалог"
        onClick={(event) => {
          event.stopPropagation()
          closeDialogue()
        }}
      >
        <X size={20} />
      </button>
      <div ref={historyRef} className="dialogue-layer__history" aria-live="polite">
        {visibleMessages.map((dialogueMessage, index) => {
          const isActiveMessage = index === activeMessageIndex
          const isMainSpeaker = Boolean(dialogueMessage.speaker.isMain)

          return (
            <div
              key={dialogueMessage.id}
              className={`dialogue-layer__entry ${
                isMainSpeaker ? 'dialogue-layer__entry--main' : 'dialogue-layer__entry--guest'
              } dialogue-layer__entry--${dialogueMessage.emotion} ${
                isActiveMessage ? 'is-active' : 'is-history'
              }`}
            >
              <div className="dialogue-layer__bubble">
                <strong>{dialogueMessage.speaker.name}</strong>
                <p>{dialogueMessage.text}</p>
                {isActiveMessage && dialogueMessage.choices?.length ? (
                  <div className="dialogue-layer__choices" aria-label="Варианты ответа">
                    {dialogueMessage.choices.map((choice) => (
                      <button
                        key={choice.id}
                        type="button"
                        className="dialogue-layer__choice"
                        onClick={(event) => {
                          event.stopPropagation()
                          selectChoice(choice.id)
                        }}
                      >
                        {choice.label}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          )
        })}
      </div>
      {lastSpeakerWithSprite && speakerSprite && (
        <div className={`dialogue-layer__speaker ${isSpeakerMuted ? 'is-muted' : ''}`} aria-hidden="true">
          <img src={speakerSprite} alt="" draggable="false" />
        </div>
      )}
    </section>
  )
}
