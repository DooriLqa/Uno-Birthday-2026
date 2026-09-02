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
    id: 'Japonsk',
    title: 'Кроссворд от патапоныча',
    description: 'Мы в пизде Taa.',
    emoji: '🗺️',
    color: '#ded1aa',
    target: 'Патапон',
  },
  {
    id: 'robot-maze',
    title: 'Лабиринт робота',
    description: 'Помоги роботу найти выход из лабиринта.',
    emoji: '🤖',
    color: '#a9d8f2',
    target: 'выход',
  },
]

export const getGame = (id: string | undefined) => games.find((game) => game.id === id)
