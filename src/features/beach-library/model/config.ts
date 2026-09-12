// Editable column genres, row settings, icons (emoji or image URLs), and book titles.
export const GENRES = [
  { name: 'Романтика', icon: '💌', description: 'Истории о любви, чувствах и отношениях героев.' },
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
    '9 оттенков драконьей страсти',
    'Мой милый мимик',
    'Фаербол любви ',
    'Встретимся с тобой в Заколонинг',
    '2 сердца в подземелье',
  ],
  [
    'Марсианочка: встреча с родителями',
    'Первая любовь робота',
    'Биография подземного человека',
    '"V" значит пять',
    'Как растопить сердце из хрома?',
  ],
  [
    '= СОН МАРМЫШКИ =',
    '8 редфлагов',
    'Три дня палтуса',
    'Я 6-ой в очереди на альтушку',
    'Вальс на школьном балу',
  ],
  [
    'Гоблинка с татуировкой грифона',
    'Тайна 67го подземелья',
    'Убийства в семиугольном замке',
    'Тьма арканума',
    'В мире темных душ меня боятся кузнецы..',
  ],
  [
    'Тайна 3й колонки с планеты ЖОПА',
    '10 тиранидяд',
    '6-и ликий убийца',
    'Андроид 007: лицензия на расследование',
    'Убийство в 4-м измерении',
  ],
  [
    'Человек, продавший чат',
    'Дело о 3-х пропавших в лесу офицерах',
    '7 часов без надзора за клубом "Малибу"',
    'Дело о пропавшем инсайдере',
    'mionNoita ass15',
  ],
  [
    'Мой муж - курощуп III-й',
    '5 рыцарей круглой парты. Стендап-тур',
    '700 лучших гномьих анекдотов',
    'Я переродился котосовой в другом мире',
    'Гоблин 2: Смешной перевод',
  ],
  [
    'Бегущий за пончиками 2049',
    '3-ое на корабле, не считая глорпа',
    '1 клик до конца света',
    'Кибердед в угаре',
    '6 обезьян украли мой звездолёт',
  ],
  [
    'Блять, я второй',
    '158 см над уровнем неба',
    '}{0тт@бь)ч',
    '42-х летний инвестор выглядит на 12',
    '0 дней на платформе',
  ],
] as const

export const BOOKS = BOOK_TITLES.flatMap((titles, row) =>
  titles.map((title, index) => ({
    id: row * 5 + index,
    genre: Math.floor(row / 3),
    direction: row % 3,
    title,
    // Fixed scatter and colours do not reveal either classification.
    // Keep the right window clear, including rotated and hovered book edges.
    x: 12 + ((((row * 5 + index) * 17) % 45) % 15) * 3.8 + Math.sin(row * 13 + index * 5) * 0.5,
    y:
      62 +
      Math.floor((((row * 5 + index) * 17) % 45) / 15) * 8 +
      Math.cos(row * 7 + index * 9) * 0.8,
    angle: ((row * 29 + index * 17) % 55) - 27,
    color: ['#32766c', '#a95037', '#345c85', '#ad8638', '#714e77'][(row * 3 + index) % 5],
  })),
)

export const ROWS = BOOK_TITLES.map((_, index) => ({
  id: index,
  cabinet: Math.floor(index / 3),
  direction: index % 3,
  // Front edges of the three shelf levels in the updated library background.
  x: [21.8, 40.85, 60.7][Math.floor(index / 3)],
  y: 20.2 + (index % 3) * 14.6,
  width: [17.3, 18.1, 17.1][Math.floor(index / 3)],
  height: 12.5,
}))

export function isBookCorrect(book: number, slot: number) {
  const entry = BOOKS[book]
  return (
    !!entry && entry.genre === Math.floor(slot / 15) && entry.direction === Math.floor(slot / 5) % 3
  )
}
// Текст CSS-страницы: редактируйте здесь.
export const INSTRUCTION =
  'Привет, путешественник! Если ты уже закончила с уборкой, то ты нашла 4 страницы из разных книг. Как видишь, не понятно из какой книги каждая страница, т.к. на странице не хватает ключевых фраз или слов-подсказок. Используй особую страницу и попробуй наложить найденные страницы на неё, чтобы понять из какой книги каждая страница. Что делать с найденными названиями книг? Думаю что это - ключ к сокровищу.'
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
