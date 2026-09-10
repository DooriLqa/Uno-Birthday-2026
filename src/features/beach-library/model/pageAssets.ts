import page1 from '../assets/pages/page-1.png'
import page2 from '../assets/pages/page-2.png'
import page3 from '../assets/pages/page-3.png'
import page4 from '../assets/pages/page-4.png'
import page5 from '../assets/pages/page-5.png'
import page6 from '../assets/pages/page-6.png'
import page7 from '../assets/pages/page-7.png'
import page8 from '../assets/pages/page-8.png'
import letters from '../assets/pages/letters.png'
import note from '../assets/pages/note.png'
import { INSTRUCTION, LETTER_PAGE, LETTERS, NOTE_PAGE, pageId } from './config'

// The paper, printed text and transparent cutouts are all baked into these PNGs.
export const PAGE_ASSETS: Record<string, { src: string; title: string; description: string }> = {
  ...Object.fromEntries(
    [page1, page2, page3, page4, page5, page6, page7, page8].map((src, index) => [
      pageId(index),
      {
        src,
        title: `Страница ${index + 1}`,
        description: `Страница ${index + 1} с прозрачным отверстием. Совмести его с буквой нижнего листа.`,
      },
    ]),
  ),
  [LETTER_PAGE]: {
    src: letters,
    title: 'Лист с буквами',
    description: `Лист с буквами: ${LETTERS.join(' ')}`,
  },
  [NOTE_PAGE]: { src: note, title: 'Записка библиотекаря', description: INSTRUCTION },
}
