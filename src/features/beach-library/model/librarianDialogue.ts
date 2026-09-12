import { openDialogue, type Dialogue } from '@/features/dialogues'
import librarianSprite from '@/shared/assets/features/dialogues/poodle-librarian.png'

const speaker = { id: 'library-poodle', name: 'Библиотекарша', sprite: librarianSprite }

export const librarianDialogue: Dialogue = {
  id: 'library-cleanup',
  restartOnOpen: true,
  messages: [
    {
      id: 'help',
      speaker,
      emotion: 'sad',
      text: 'Здравствуй! Кто-то устроил такой хаос в нашей библиотеке. Поможешь мне с уборкой?',
    },
    {
      id: 'sorting',
      speaker,
      emotion: 'neutral',
      text: 'Расставь книги по полкам: сверху указан жанр, а слева — сеттинг. Выбирай книгу и ставь её на их пересечение. Если ошибёшься, книгу можно переставить.',
    },
    {
      id: 'hint',
      speaker,
      emotion: 'neutral',
      text: 'Также я нашла какое-то странное письмо, отдам его когда мы закончим с уборкой, возможно ты поймешь что всё это значит.',
    },
    {
      id: 'thanks',
      speaker,
      emotion: 'happy',
      text: 'Спасибо за помощь! Если забудешь, как расставлять книги, подойди ко мне — я всё повторю.',
    },
  ],
}

export const librarianCompletionDialogue: Dialogue = {
  id: 'library-cleanup-complete',
  restartOnOpen: true,
  messages: [
    {
      id: 'letter',
      speaker,
      emotion: 'happy',
      text: 'Спасибо за помощь с уборкой! Вот письмо, о котором я говорила.',
    },
  ],
}

export function talkToLibrarian() {
  openDialogue(librarianDialogue)
}

export function finishLibrarianCleanup() {
  openDialogue(librarianCompletionDialogue)
}
