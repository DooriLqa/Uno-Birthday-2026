import { openDialogue, type Dialogue } from '@/features/dialogues'
import librarianSprite from '@/shared/assets/features/dialogues/poodle-librarian.png'

const speaker = { id: 'library-poodle', name: 'Библиотекарь', sprite: librarianSprite }
const yuni = { id: 'yuni', name: '', isMain: true }

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
      id: 'help-response',
      speaker: yuni,
      emotion: 'happy',
      text: 'Конечно! Я люблю книги и не оставлю библиотеку в таком виде.',
    },
    {
      id: 'sorting',
      speaker,
      emotion: 'neutral',
      text: 'Расставь книги по полкам: сверху указан жанр, а слева — сеттинг. Выбирай книгу и ставь её на их пересечение. Если ошибёшься, книгу можно переставить.',
    },
    {
      id: 'sorting-response',
      speaker: yuni,
      emotion: 'neutral',
      text: 'Поняла: сверю жанр и сеттинг, а потом поставлю книгу на нужное место.',
    },
    {
      id: 'hint',
      speaker,
      emotion: 'neutral',
      text: 'Также я должна была передать тебе письмо, но оно затерялось в этом бардаке, возможно оно под какой-то из книг.',
    },
    {
      id: 'letter-response',
      speaker: yuni,
      emotion: 'surprised',
      text: 'Письмо? Теперь мне ещё любопытнее. Скорее наведём порядок!',
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
      text: 'Спасибо за помощь с уборкой! Теперь здесь полный "порядок". Вот письмо, о котором я говорила.',
    },
    {
      id: 'letter-response',
      speaker: yuni,
      emotion: 'happy',
      text: 'Спасибо! Я обязательно прочитаю его и попробую понять, что оно значит.',
    },
  ],
}

export function talkToLibrarian() {
  openDialogue(librarianDialogue)
}

export function finishLibrarianCleanup() {
  openDialogue(librarianCompletionDialogue)
}
