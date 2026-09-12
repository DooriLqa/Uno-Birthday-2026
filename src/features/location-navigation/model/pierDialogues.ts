import { openDialogue, type DialogueSpeaker } from '@/features/dialogues'

const oldSailor: DialogueSpeaker = {
  id: 'old-pier-sailor',
  name: 'Старый моряк Боцман',
}

export function talkToPierSailor(onOpenFindAPair: () => void) {
  openDialogue({
    id: 'pier-sailor-memory-game',
    messages: [
      {
        id: 'memory-offer',
        speaker: oldSailor,
        emotion: 'happy',
        text: 'Эй, юнга! Самое главное в старости - держать память в тонусе. И молодых я этому тоже учу. Успеешь найти все пары - премирую тебя монеткой',
      },
      {
        id: 'memory-choice',
        speaker: oldSailor,
        emotion: 'neutral',
        text: 'Ну что, сыграем?',
        choices: [
          {
            id: 'later',
            label: 'позже',
            onSelect: () => {},
          },
          {
            id: 'play',
            label: 'Давай сыграем',
            onSelect: onOpenFindAPair,
          },
        ],
      },
    ],
  })
}
