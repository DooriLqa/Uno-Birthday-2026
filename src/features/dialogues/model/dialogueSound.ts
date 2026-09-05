let activeDialogueAudio: HTMLAudioElement | null = null

export const playDialogueSound = (source: string) => {
  activeDialogueAudio?.pause()

  const audio = new Audio(source)
  audio.volume = 0.55
  activeDialogueAudio = audio

  audio.addEventListener(
    'ended',
    () => {
      if (activeDialogueAudio === audio) activeDialogueAudio = null
    },
    { once: true },
  )

  void audio.play().catch(() => undefined)
}
