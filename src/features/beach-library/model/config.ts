// Editable column genres, row settings, icons (emoji or image URLs), and book titles.
export const GENRES = [
  { name: 'Романы', icon: '💌', description: 'Истории о любви, чувствах и отношениях героев.' },
  {
    name: 'Детективы',
    icon: '🔎',
    description: 'Расследования, улики, преступления и поиск виновного.',
  },
  {
    name: 'Комедии',
    icon: '🎭',
    description: 'Забавные истории, нелепые ситуации и юмористические приключения.',
  },
] as const

export const DIRECTIONS = [
  {
    name: 'Фэнтези',
    icon: '🐉',
    description: 'Волшебные миры: магия, драконы, эльфы и заклинания.',
  },
  {
    name: 'Сайфай',
    icon: '🚀',
    description:
      'Научная фантастика: космос, роботы, технологии будущего и путешествия во времени.',
  },
  {
    name: 'Современность',
    icon: '🏙️',
    description:
      'Наше время: обычные люди, города и повседневная жизнь без магии и технологий будущего.',
  },
] as const

// Column first, then row: five books at each genre × direction intersection.
export const BOOK_TITLES = [
  [
    'Любовь под крылом дракона',
    'Сердце эльфийского принца',
    'Свадьба в зачарованном лесу',
    'Ведьма и её возлюбленный',
    'Поцелуй, разрушивший заклятие',
  ],
  [
    'Свидание на орбите Венеры',
    'Любовные письма с Марса',
    'Два сердца на звездолёте',
    'Андроид, который влюбился',
    'Наша свадьба в далёкой галактике',
  ],
  [
    'Любовь в соседней квартире',
    'Свидание в городском кафе',
    'Свадьба после выпускного',
    'Письма любимой из Петербурга',
    'Два сердца в последнем метро',
  ],
  [
    'Кто похитил драконье яйцо?',
    'Убийство в башне волшебника',
    'Эльф-сыщик и пропавшая корона',
    'Улика в запретном заклинании',
    'Следствие ведёт придворная ведьма',
  ],
  [
    'Убийство на орбитальной станции',
    'Робот-сыщик и украденный микрочип',
    'Кто саботировал звездолёт?',
    'Отпечатки пришельца на месте преступления',
    'Пропавший пассажир машины времени',
  ],
  [
    'Убийство в соседнем подъезде',
    'Инспектор и ограбление банка',
    'Кто украл картину из городского музея?',
    'Улика на записи камеры наблюдения',
    'Частный сыщик и пропавший курьер',
  ],
  [
    'Как дракон икал огнём на экзамене',
    'Волшебник-недотёпа превратил себя в чайник',
    'Эльфы на курсах стендапа',
    'Тролль устроился няней к принцессе',
    'Сто смешных ошибок начинающей ведьмы',
  ],
  [
    'Робот-пылесос захватил галактику по ошибке',
    'Марсиане перепутали Землю с пиццерией',
    'Космонавт забыл ключи от ракеты',
    'Машина времени застряла в понедельнике',
    'Андроид-комик и сбой чувства юмора',
  ],
  [
    'Сосед, кот и сто нелепых отговорок',
    'Как я случайно стал директором',
    'Стендап в очереди за кофе',
    'Курьер перепутал свадьбу с корпоративом',
    'Отпуск вверх тормашками: дневник неудачника',
  ],
] as const

export const BOOKS = BOOK_TITLES.flatMap((titles, row) =>
  titles.map((title, index) => ({
    id: row * 5 + index,
    genre: Math.floor(row / 3),
    direction: row % 3,
    title,
    // Fixed scatter and colours do not reveal either classification.
    x: 18 + ((((row * 5 + index) * 17) % 45) % 15) * 4.4 + Math.sin(row * 13 + index * 5) * 0.9,
    y:
      70 +
      Math.floor((((row * 5 + index) * 17) % 45) / 15) * 6 +
      Math.cos(row * 7 + index * 9) * 1.8,
    angle: ((row * 29 + index * 17) % 55) - 27,
    color: ['#32766c', '#a95037', '#345c85', '#ad8638', '#714e77'][(row * 3 + index) % 5],
  })),
)

export const ROWS = BOOK_TITLES.map((_, index) => ({
  id: index,
  cabinet: Math.floor(index / 3),
  direction: index % 3,
  x: [23.8, 41.2, 60.5][Math.floor(index / 3)],
  y: [30.4, 40.8, 51][index % 3],
  width: [15.4, 17.4, 15.6][Math.floor(index / 3)],
  height: 8.6,
}))

export function isBookCorrect(book: number, slot: number) {
  const entry = BOOKS[book]
  return (
    !!entry && entry.genre === Math.floor(slot / 15) && entry.direction === Math.floor(slot / 5) % 3
  )
}
export const LETTERS = [
  'ФЖАУКРЭМПСЮВ',
  'ЗНБТЯХОДИЛЩЕ',
  'ЫЦГСВЕЙФРАПК',
  'МЮДЛШНУЗБТАО',
  'РЭХИЩКЦЯЕВГС',
  'ПАЖОУФМЛДНЫТ',
  'ЕБЧРСЮКЗХИВА',
  'ЦТНЯГЭДОШПЛУ',
  'ВКМЩАИФЕЖСЮР',
  'ЛЗПХУНБТЯДОГ',
  'ШЕРАЦЫМВКИЖС',
  'ЮОТДФЛЗПНАГЭ',
]
// Positions are in the 300 × 360 paper coordinate system. Real transparent holes.
export const HOLES = [
  [62, 85],
  [132, 109],
  [225, 157],
  [85, 205],
  [178, 253],
  [248, 301],
  [108, 277],
  [201, 133],
]
export const INSTRUCTION =
  'Положи лист с буквами под найденные страницы. Перемещай страницы с отверстиями: сквозь них видны буквы нижнего листа. Найди по одной букве для каждой страницы. Прочитай их в порядке номеров страниц — восемь букв станут ключом к загадке.'
export const LETTER_PAGE = 'beach-library-letters'
export const NOTE_PAGE = 'beach-library-note'
export const pageId = (index: number) => `beach-library-page-${index}`

export function placeBook(slots: (number | null)[], book: number, slot: number) {
  if (!Number.isInteger(slot) || slot < 0 || slot >= 45 || !BOOKS[book]) return null
  // Swap occupied slots so even a completely filled, incorrect library stays solvable.
  // If the held book came from the floor, the displaced book returns to the floor.
  const displaced = slots[slot] === book ? null : slots[slot]
  return slots.map((value, index) => (index === slot ? book : value === book ? displaced : value))
}
export function completedCabinets(slots: (number | null)[]) {
  return [0, 1, 2].filter((cabinet) =>
    Array.from({ length: 15 }, (_, offset) => cabinet * 15 + offset).every(
      (slot) => slots[slot] !== null && isBookCorrect(slots[slot]!, slot),
    ),
  )
}
