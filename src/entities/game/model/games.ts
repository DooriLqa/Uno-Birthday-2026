export type Game = {
  id: string
  title: string
  description: string
  emoji: string
  color: string
  target: string
}

export const gameList: Game[] = [
  {
    id: 'beach-radio',
    title: 'Радио Бони',
    description: 'Выиграй радиоприёмник и найди тайные частоты.',
    emoji: '📻',
    color: '#f2c98c',
    target: 'радиоприёмник',
  },
  {
    id: 'beach-search',
    title: 'Поиск на пляже',
    description: 'Найди предметы на большом пляже.',
    emoji: '🔎',
    color: '#d2edcf',
    target: 'все предметы',
  },
  {
    id: 'book-shelf',
    title: 'Книжная полка',
    description: 'Разложи книги по цветам в правильный порядок.',
    emoji: '📚',
    color: '#e7d5ff',
    target: 'все книги',
  },
  {
    id: 'flappy-bird',
    title: 'Полёт над лагуной',
    description: 'Пролетай между трубами и собирай монетки.',
    emoji: '🐦',
    color: '#f8df9a',
    target: '10 труб',
  },
  {
    id: 'totem-code',
    title: 'Код тотемов',
    description: 'Собери тайную комбинацию по подсказкам.',
    emoji: '🗿',
    color: '#dbc09b',
    target: 'код тотемов',
  },
  {
    id: 'coconut-catch',
    title: 'Лови кокосы',
    description: 'Успей поймать пляжный улов.',
    emoji: '🥥',
    color: '#c9e5ae',
    target: 'кокос',
  },
  {
    id: 'fruit-basket',
    title: 'Корзинка удачи',
    description: 'Собери ценности и сдай их в левую или правую зону.',
    emoji: '🧺',
    color: '#f6b7a8',
    target: '20 ценностей',
  },
  {
    id: 'wave-rider',
    title: 'На гребне волны',
    description: 'Поймай идеальную волну.',
    emoji: '🏄',
    color: '#b9e6f2',
    target: 'волну',
  },
  {
    id: 'ice-cream',
    title: 'Мороженое мечты',
    description: 'Собери самый летний рожок.',
    emoji: '🍦',
    color: '#ffe19e',
    target: 'шарик мороженого',
  },
  {
    id: 'treasure-map',
    title: 'Карта сокровищ',
    description: 'Следуй за крестиком к призу.',
    emoji: '🗺️',
    color: '#ded1aa',
    target: 'сокровище',
  },
  {
    id: 'shell-game',
    title: 'Кручу-верчу',
    description: 'Следи за ракушкой.',
    emoji: '🥤',
    color: '#eb6c9a',
    target: 'наперсток',
  },
  {
    id: 'black-jack',
    title: 'Black Jack',
    description: 'Набери 21 и обыграй раздающего.',
    emoji: '🃏',
    color: '#b8d8c0',
    target: 'очко',
  },
  {
    id: 'find-a-pair',
    title: 'Find a Pair',
    description: 'Найди все пары карт за 30 секунд.',
    emoji: '🎴',
    color: '#d8c5e8',
    target: 'все пары',
  },
  {
    id: 'wack-a-mole',
    title: 'Wack a Mole',
    description: 'Успей ударить по кроту.',
    emoji: '🔨',
    color: '#c9d9b4',
    target: 'крота',
  },
  {
    id: 'arkanoid',
    title: 'Арканоид',
    description: 'Разбей все кирпичи и не дай мячу упасть.',
    emoji: '🧱',
    color: '#b9d7f0',
    target: 'все кирпичи',
  },
  {
    id: 'sea-battle',
    title: 'Морской бой',
    description: 'Потопи все корабли.',
    emoji: '🚢',
    color: '#075290',
    target: 'торпеда',
  },
  {
    id: 'lock-picking',
    title: 'Взлом замка',
    description: 'Подбери комбинацию и открой замок.',
    emoji: '🔐',
    color: '#d8c28d',
    target: 'замок',
  },
  {
    id: 'fishing',
    title: 'Рыбалка',
    description: 'Лови рыбок, собирай редкий улов и получай монетки.',
    emoji: '🎣',
    color: '#b7e2ea',
    target: 'рыбу',
  },
]

export const games = gameList.map((game) =>
  game.id === 'shell-hunt'
    ? {
        ...game,
        title: 'Код тотемов',
        description: 'Собери тайную комбинацию по подсказкам.',
        emoji: '🗿',
        color: '#dbc09b',
        target: 'код тотемов',
      }
    : game,
)

export const getGame = (id: string | undefined) => games.find((game) => game.id === id)
