// Change names, descriptions, emoji (or image URLs) and titles here.
export const GENRES = [
  {
    name: 'Приключения',
    icon: '🧭',
    description: 'Путешествия, поиски сокровищ и опасные экспедиции.',
    titles: [
      'Сокровища затонувшего острова',
      'Вокруг света под парусом',
      'Экспедиция в потерянную долину',
      'Тайная тропа контрабандистов',
      'За картой капитана Флинта',
    ],
  },
  {
    name: 'Детектив',
    icon: '🔎',
    description: 'Расследования, улики и загадочные преступления.',
    titles: [
      'Кто украл алмаз?',
      'Улика в запертой комнате',
      'Последнее дело инспектора',
      'Следствие ведёт библиотекарь',
      'Отпечаток на месте преступления',
    ],
  },
  {
    name: 'Фантастика',
    icon: '🚀',
    description: 'Космос, технологии будущего и научные открытия за пределами возможного.',
    titles: [
      'Колония на Марсе',
      'Робот, который видел сны',
      'Прыжок сквозь время',
      'Сигнал с далёкой галактики',
      'Космический корабль «Заря»',
    ],
  },
  {
    name: 'Фэнтези',
    icon: '🐉',
    description: 'Магия, драконы и волшебные миры.',
    titles: [
      'Школа лунных волшебников',
      'Печать последнего дракона',
      'Корона эльфийской королевы',
      'Заклинание древнего леса',
      'Хранитель магического портала',
    ],
  },
  {
    name: 'Поэзия',
    icon: '🪶',
    description: 'Стихотворения, рифмы, сонеты и лирика.',
    titles: [
      'Сонеты морскому ветру',
      'Стихи под шум прибоя',
      'Сто рифм о лете',
      'Лирика тихих вечеров',
      'Баллады рассвета',
    ],
  },
  {
    name: 'Кулинария',
    icon: '🍲',
    description: 'Рецепты, продукты и секреты приготовления еды.',
    titles: [
      'Пятьдесят рецептов тропических супов',
      'Идеальная выпечка шаг за шагом',
      'Секреты домашнего сыра',
      'Ужин из морепродуктов',
      'Десерты без духовки',
    ],
  },
  {
    name: 'История',
    icon: '🏺',
    description: 'Прошлое человечества, цивилизации и реальные исторические события.',
    titles: [
      'Хроники Древнего Рима',
      'Как жили в Средневековье',
      'История Великих географических открытий',
      'Египет во времена фараонов',
      'Летопись древних цивилизаций',
    ],
  },
  {
    name: 'Природа',
    icon: '🌿',
    description: 'Животные, растения и окружающий живой мир.',
    titles: [
      'Атлас тропических птиц',
      'Тайная жизнь кораллов',
      'Деревья и цветы островов',
      'Энциклопедия морских животных',
      'Как устроен муравейник',
    ],
  },
  {
    name: 'Романтика',
    icon: '💌',
    description: 'Любовь, чувства, встречи и отношения.',
    titles: [
      'Любовь на краю океана',
      'Свидание у старого маяка',
      'Письма любимой',
      'Два сердца и один закат',
      'Свадьба после долгой разлуки',
    ],
  },
] as const

export const BOOKS = GENRES.flatMap((genre, row) =>
  genre.titles.map((title, index) => ({
    id: row * 5 + index,
    genre: row,
    title,
    // A fixed shuffled scatter: positions and colours do not reveal the genre.
    x: 18 + ((((row * 5 + index) * 17) % 45) % 15) * 4.4 + Math.sin(row * 13 + index * 5) * 0.9,
    y:
      70 +
      Math.floor((((row * 5 + index) * 17) % 45) / 15) * 6 +
      Math.cos(row * 7 + index * 9) * 1.8,
    angle: ((row * 29 + index * 17) % 55) - 27,
    color: ['#32766c', '#a95037', '#345c85', '#ad8638', '#714e77'][(row * 3 + index) % 5],
  })),
)

export const ROWS = GENRES.map((_, index) => ({
  id: index,
  cabinet: Math.floor(index / 3),
  x: [23.8, 41.2, 60.5][Math.floor(index / 3)],
  y: [30.4, 40.8, 51][index % 3],
  width: [15.4, 17.4, 15.6][Math.floor(index / 3)],
  height: 8.6,
}))

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
      (slot) => slots[slot] !== null && BOOKS[slots[slot]!]?.genre === Math.floor(slot / 5),
    ),
  )
}
