import book1 from '@/shared/assets/games/beach-library/book1.png'
import book2 from '@/shared/assets/games/beach-library/book2.png'
import book3 from '@/shared/assets/games/beach-library/book3.png'
import book4 from '@/shared/assets/games/beach-library/book4.png'
import text from '@/shared/assets/games/beach-library/text.png'
import { INSTRUCTION, LETTER_PAGE, NOTE_PAGE, pageId } from './config'
export const PAGE_ASSETS: Record<string, { src?: string; title: string; description: string }> = {
  ...Object.fromEntries(
    [book1, book2, book3, book4].map((src, index) => [
      pageId(index),
      {
        src,
        title: 'Страница из книги',
        description: 'Наложи эту страницу на лист с текстом.',
      },
    ]),
  ),
  [LETTER_PAGE]: {
    src: text,
    title: 'Лист с текстом',
    description: 'Лист с текстом для наложения найденных страниц.',
  },
  [NOTE_PAGE]: { title: 'Записка библиотекаря', description: INSTRUCTION },
}
