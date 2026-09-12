import book1 from '../assets/pages/book1.png'
import book2 from '../assets/pages/book2.png'
import book3 from '../assets/pages/book3.png'
import book4 from '../assets/pages/book4.png'
import text from '../assets/pages/text.png'
import { INSTRUCTION, LETTER_PAGE, NOTE_PAGE, pageId } from './config'
export const PAGE_ASSETS: Record<string, { src?: string; title: string; description: string }> = {
  ...Object.fromEntries(
    [book1, book2, book3, book4].map((src, index) => [
      pageId(index),
      {
        src,
        title: `Страница ${index + 1}`,
        description: `Страница из книги ${index + 1}. Наложи её на лист с текстом.`,
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
