import { BeachRadioGame } from '@/features/beach-radio'
import { BeachSearchGame } from '@/features/beach-search'
import { BlackJack } from '@/features/black-jack'
import { BookShelfGame } from '@/features/book-shelf'
import { CoconutCatchGame } from '@/features/coconut-catch'
import { FindAPair } from '@/features/find-a-pair'
import { FishingGame } from '@/features/fishing'
import { FlappyBirdGame } from '@/features/flappy-bird'
import { FruitBasketGame } from '@/features/fruit-basket'
import { LockPickingGame } from '@/features/lock-picking'
import { SeaBattle } from '@/features/sea-battle'
import { ShellGameScreen } from '@/features/shell-game'
import { TotemCodeGame } from '@/features/totem-code'
import { WackAMole } from '@/features/wack-a-mole'
import { Arkanoid } from '@/features/arkanoid'
import { Japonsk } from '@/features/cropp/Japonsk'
import { RobotMazeGame } from '@/features/cropp/RobotMazeGame'
import type { GameDefinition } from '@/entities/game/model/types'
import flappyBirdLagoonBackground from '@/shared/assets/flappy-bird/lagoon-cliff-vista-background.png'
import islandMapImage from '@/shared/assets/island-map/tropical-island-map-expanded.png'
import totemBeachScene from '@/shared/assets/totem-code/totem-beach-scene-no-fire.png'
import robotMazeGameBackground from '@/shared/assets/robot/background.png'
import fishingScene from '@/shared/assets/locations/fishing.png'

const locationTransition = {
  transitionSound: '/audio/sfx/location-footsteps.ogg',
} satisfies Pick<GameDefinition, 'transitionSound'>

const islandGame = {
  backgroundImage: islandMapImage,
  ...locationTransition,
} satisfies Pick<GameDefinition, 'backgroundImage' | 'transitionSound'>

export const games: GameDefinition[] = [
  {
    id: 'beach-radio',
    title: 'Радио Бони',
    description: 'Выиграй радиоприёмник и найди тайные частоты.',
    emoji: '📻',
    color: '#f2c98c',
    target: 'радиоприёмник',
    mapPosition: { left: '84%', top: '72%' },
    pageClassName: 'beach-radio-page',
    ...locationTransition,
    Screen: BeachRadioGame,
  },
  {
    id: 'beach-search',
    title: 'Поиск на пляже',
    description: 'Найди предметы на большом пляже.',
    emoji: '🔎',
    color: '#d2edcf',
    target: 'все предметы',
    mapPosition: { left: '49%', top: '75%' },
    pageClassName: 'beach-search-page',
    ...islandGame,
    Screen: BeachSearchGame,
  },
  {
    id: 'book-shelf',
    title: 'Книжная полка',
    description: 'Разложи книги по цветам в правильный порядок.',
    emoji: '📚',
    color: '#e7d5ff',
    target: 'все книги',
    mapPosition: { left: '42%', top: '32%' },
    pageClassName: 'book-shelf-page',
    ...islandGame,
    Screen: BookShelfGame,
  },
  {
    id: 'flappy-bird',
    title: 'Полёт над лагуной',
    description: 'Пролетай между трубами и собирай монетки.',
    emoji: '🐦',
    color: '#f8df9a',
    target: '10 труб',
    mapPosition: { left: '60%', top: '23%' },
    pageClassName: 'flappy-bird-page',
    backgroundImage: flappyBirdLagoonBackground,
    ...locationTransition,
    Screen: FlappyBirdGame,
  },
  {
    id: 'totem-code',
    title: 'Код тотемов',
    description: 'Собери тайную комбинацию по подсказкам.',
    emoji: '🗿',
    color: '#dbc09b',
    target: 'код тотемов',
    mapPosition: { left: '27%', top: '38%' },
    pageClassName: 'totem-code-page',
    backgroundImage: totemBeachScene,
    ...locationTransition,
    Screen: TotemCodeGame,
  },
  {
    id: 'coconut-catch',
    title: 'Лови кокосы',
    description: 'Успей поймать пляжный улов.',
    emoji: '🥥',
    color: '#c9e5ae',
    target: 'кокос',
    mapPosition: { left: '47%', top: '51%' },
    ...islandGame,
    Screen: CoconutCatchGame,
  },
  {
    id: 'fruit-basket',
    title: 'Корзинка удачи',
    description: 'Собери ценности и сдай их в левую или правую зону.',
    emoji: '🧺',
    color: '#f6b7a8',
    target: '20 ценностей',
    mapPosition: { left: '83%', top: '45%' },
    pageClassName: 'fruit-basket-page',
    ...locationTransition,
    Screen: FruitBasketGame,
  },
  /* {
    id: 'wave-rider',
    title: 'На гребне волны',
    description: 'Поймай идеальную волну.',
    emoji: '🏄',
    color: '#b9e6f2',
    target: 'волну',
    mapPosition: { left: '72%', top: '37%' },
    ...islandGame,
    Screen: WaveRiderGame,
  }, */
  /* {
    id: 'ice-cream',
    title: 'Мороженое мечты',
    description: 'Собери самый летний рожок.',
    emoji: '🍦',
    color: '#ffe19e',
    target: 'шарик мороженого',
    mapPosition: { left: '28%', top: '65%' },
    ...islandGame,
    Screen: IceCreamGame,
  }, */
  /* {
    id: 'treasure-map',
    title: 'Карта сокровищ',
    description: 'Следуй за крестиком к призу.',
    emoji: '🗺️',
    color: '#ded1aa',
    target: 'сокровище',
    mapPosition: { left: '70%', top: '65%' },
    ...islandGame,
    Screen: TreasureMapGame,
  }, */
  {
    id: 'shell-game',
    title: 'Кручу-верчу',
    description: 'Следи за ракушкой.',
    emoji: '🥤',
    color: '#eb6c9a',
    target: 'наперсток',
    mapPosition: { left: '46%', top: '30%' },
    ...islandGame,
    Screen: ShellGameScreen,
  },
  {
    id: 'black-jack',
    title: 'Black Jack',
    description: 'Набери 21 и обыграй раздающего.',
    emoji: '🃏',
    color: '#b8d8c0',
    target: 'очко',
    mapPosition: { left: '40%', top: '35%' },
    ...islandGame,
    Screen: BlackJack,
  },
  {
    id: 'find-a-pair',
    title: 'Find a Pair',
    description: 'Найди все пары карт за 30 секунд.',
    emoji: '🎴',
    color: '#d8c5e8',
    target: 'все пары',
    mapPosition: { left: '42%', top: '30%' },
    ...islandGame,
    Screen: FindAPair,
  },
  {
    id: 'wack-a-mole',
    title: 'Wack a Mole',
    description: 'Успей ударить по кроту.',
    emoji: '🔨',
    color: '#c9d9b4',
    target: 'крота',
    mapPosition: { left: '48%', top: '38%' },
    ...islandGame,
    Screen: WackAMole,
  },
  {
    id: 'arkanoid',
    title: 'Арканоид',
    description: 'Разбей все кирпичи и не дай мячу упасть.',
    emoji: '🧱',
    color: '#b9d7f0',
    target: 'все кирпичи',
    mapPosition: { left: '50%', top: '30%' },
    ...islandGame,
    Screen: Arkanoid,
  },
  {
    id: 'sea-battle',
    title: 'Морской бой',
    description: 'Потопи все корабли.',
    emoji: '🚢',
    color: '#075290',
    target: 'торпеда',
    mapPosition: { left: '44%', top: '39%' },
    ...islandGame,
    Screen: SeaBattle,
  },
  {
    id: 'lock-picking',
    title: 'Взлом замка',
    description: 'Подбери комбинацию и открой замок.',
    emoji: '🔓',
    color: '#d8c28d',
    target: 'замок',
    mapPosition: { left: '54%', top: '47%' },
    ...islandGame,
    Screen: LockPickingGame,
  },
  {
    id: 'fishing',
    title: 'Рыбалка',
    description: 'Лови рыбок, собирай редкий улов и получай монетки.',
    emoji: '🎣',
    color: '#b7e2ea',
    target: 'рыбу',
    mapPosition: { left: '58%', top: '22%' },
    pageClassName: 'fishing-page',
    backgroundImage: fishingScene,
    ...locationTransition,
    Screen: FishingGame,
  },
  {
    id: 'japonsk',
    title: 'Японский кроссворд',
    description: 'Реши японский кроссворд.',
    emoji: '⛰️',
    color: '#f0a2a2',
    target: 'японский кроссворд',
    mapPosition: { left: '55%', top: '30%' },
    pageClassName: 'japonsk-page',
    ...islandGame,
    Screen: Japonsk,
  },
  {
    id: 'robot-maze',
    title: 'Робот-лабиринт',
    description: 'Помоги роботу найти выход из лабиринта.',
    emoji: '🤖',
    color: '#a2c9f0',
    target: 'выход из лабиринта',
    mapPosition: { left: '60%', top: '30%' },
    pageClassName: 'robot-maze-page',
    backgroundImage: robotMazeGameBackground,
    Screen: RobotMazeGame,
  },
]

export const getGame = (gameId: string | null) => games.find((game) => game.id === gameId)
