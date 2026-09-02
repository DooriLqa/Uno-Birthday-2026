export type Game = {
  id: string
  title: string
  description: string
  emoji: string
  color: string
  target: string
}

const gameList: Game[] = [
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
    id: 'shell-hunt',
    title: 'Охота за ракушками',
    description: 'Найди сокровище у кромки воды.',
    emoji: '🐚',
    color: '#f5c9d6',
    target: 'ракушку',
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
