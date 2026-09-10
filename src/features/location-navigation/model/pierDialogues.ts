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
        text: 'Эй, юнга! Хочешь потренировать вместе со мной память? Найдёшь все пары — получишь от меня монетку.',
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
            label: 'давай сыграем',
            onSelect: onOpenFindAPair,
          },
        ],
      },
    ],
  })
}
