export type Game = {
  id: string
  title: string
  description: string
  emoji: string
  color: string
  target: string
}

export const games: Game[] = [
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
    target: 'очко'
  },
  {
    id: 'find-a-pair',
    title: 'Find a Pair',
    description: 'Найди все пары карт за 30 секунд.',
    emoji: '🂠',
    color: '#d8c5e8',
    target: 'все пары'
  },
  {
    id: 'wack-a-mole',
    title: 'Wack a Mole',
    description: 'Успей ударить по кроту.',
    emoji: '🔨',
    color: '#c9d9b4',
    target: 'крота'
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
]

export const getGame = (id: string | undefined) => games.find((game) => game.id === id)
