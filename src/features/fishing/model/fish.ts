export type FishingDistance = 'near' | 'mid' | 'far'
export type FishBehavior = 'mixed' | 'smooth' | 'sinker' | 'floater' | 'dart'

export type Fish = {
  id: string
  name: string
  distance: FishingDistance
  sprite: { column: number; row: number }
  behavior: FishBehavior
  speed: number
  jump: number
  description: string
}

export type FishRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'

export const DISTANCE_LABELS: Record<FishingDistance, string> = {
  near: 'Мелководье',
  mid: 'Прибережные воды',
  far: 'Глубоководье',
}

export const RARITIES = [
  { id: 'common', name: 'Common', weight: 45, color: '#f2f2f2', reward: 1 / 3 },
  { id: 'uncommon', name: 'Uncommon', weight: 30, color: '#57d46f', reward: 1 / 2 },
  { id: 'rare', name: 'Rare', weight: 20, color: '#45a8ff', reward: 1 },
  { id: 'epic', name: 'Epic', weight: 10, color: '#b66cff', reward: 2 },
  { id: 'legendary', name: 'Legendary', weight: 5, color: '#ff9d32', reward: 5 },
] as const

export const FISH: Fish[] = [
  {
    id: 'perch',
    name: 'Окунь',
    distance: 'near',
    sprite: { column: 0, row: 0 },
    behavior: 'smooth',
    speed: 2,
    jump: 2,
    description: 'Полосатый хищник, который спокойно держится у берега.',
  },
  {
    id: 'herring',
    name: 'Сельдь',
    distance: 'near',
    sprite: { column: 1, row: 0 },
    behavior: 'sinker',
    speed: 2.2,
    jump: 2.2,
    description: 'Серебристая стайная рыбка, быстро уходящая в глубину.',
  },
  {
    id: 'largemouth-bass',
    name: 'Большеротый бас',
    distance: 'near',
    sprite: { column: 2, row: 0 },
    behavior: 'mixed',
    speed: 2.3,
    jump: 2.3,
    description: 'Крепкий хищник с широкой пастью и резкими рывками.',
  },
  {
    id: 'goldfish',
    name: 'Золотая рыбка',
    distance: 'near',
    sprite: { column: 3, row: 0 },
    behavior: 'dart',
    speed: 2.5,
    jump: 2.5,
    description: 'Яркая декоративная рыбка, неожиданно юркая в воде.',
  },
  {
    id: 'rainbow-trout',
    name: 'Радужная форель',
    distance: 'near',
    sprite: { column: 4, row: 0 },
    behavior: 'floater',
    speed: 1.5,
    jump: 5,
    description: 'Пятнистая форель, любит всплывать и снова уходить вниз.',
  },
  {
    id: 'catfish',
    name: 'Сом',
    distance: 'mid',
    sprite: { column: 0, row: 1 },
    behavior: 'mixed',
    speed: 6,
    jump: 0.7,
    description: 'Усатый донный гигант, который двигается тяжело и уверенно.',
  },
  {
    id: 'tuna',
    name: 'Тунец',
    distance: 'mid',
    sprite: { column: 1, row: 1 },
    behavior: 'sinker',
    speed: 1.6,
    jump: 3,
    description: 'Сильная морская рыба с обтекаемым телом и быстрым ходом.',
  },
  {
    id: 'pike',
    name: 'Щука',
    distance: 'mid',
    sprite: { column: 2, row: 1 },
    behavior: 'dart',
    speed: 1.5,
    jump: 2.5,
    description: 'Длинный хищник, способный внезапно броситься за добычей.',
  },
  {
    id: 'rockfish',
    name: 'Морской окунь',
    distance: 'mid',
    sprite: { column: 3, row: 1 },
    behavior: 'floater',
    speed: 4,
    jump: 1.2,
    description: 'Крепкая красная рыба, предпочитающая скалистые участки.',
  },
  {
    id: 'bream',
    name: 'Лещ',
    distance: 'mid',
    sprite: { column: 4, row: 1 },
    behavior: 'smooth',
    speed: 2,
    jump: 2,
    description: 'Спокойная серебристая рыба, плавно меняющая направление.',
  },
  {
    id: 'flounder',
    name: 'Камбала',
    distance: 'far',
    sprite: { column: 0, row: 2 },
    behavior: 'dart',
    speed: 2.5,
    jump: 1.5,
    description: 'Плоская донная рыба, почти незаметная среди камней и песка.',
  },
  {
    id: 'sergeant-major',
    name: 'Сержант-майор',
    distance: 'far',
    sprite: { column: 1, row: 2 },
    behavior: 'sinker',
    speed: 2,
    jump: 2,
    description: 'Полосатая рифовая рыбка, ловко снующая между кораллами.',
  },
  {
    id: 'parrotfish',
    name: 'Рыба-попугай',
    distance: 'far',
    sprite: { column: 2, row: 2 },
    behavior: 'floater',
    speed: 3,
    jump: 2,
    description: 'Яркая тропическая рыба, медленно скользящая над рифом.',
  },
  {
    id: 'garfish',
    name: 'Сарган',
    distance: 'far',
    sprite: { column: 3, row: 2 },
    behavior: 'mixed',
    speed: 2,
    jump: 2,
    description: 'Тонкая стремительная рыба с длинной острой мордой.',
  },
  {
    id: 'carp',
    name: 'Карп',
    distance: 'far',
    sprite: { column: 4, row: 2 },
    behavior: 'dart',
    speed: 2,
    jump: 2,
    description: 'Крупная золотистая рыба, способная дать сильный рывок.',
  },
]

export const getRarity = (rarity: FishRarity) =>
  RARITIES.find((item) => item.id === rarity) ?? RARITIES[0]

const DISTANCE_RARITY_WEIGHTS: Record<FishingDistance, Record<FishRarity, number>> = {
  near: { common: 50, uncommon: 30, rare: 13, epic: 5, legendary: 2 },
  mid: { common: 35, uncommon: 36, rare: 20, epic: 10, legendary: 4 },
  far: { common: 25, uncommon: 25, rare: 29, epic: 15, legendary: 6 },
}

export function pickRarity(distance: FishingDistance = 'near'): FishRarity {
  const weights = DISTANCE_RARITY_WEIGHTS[distance]
  const total = Object.values(weights).reduce((sum, weight) => sum + weight, 0)
  let roll = Math.random() * total
  for (const rarity of RARITIES) {
    roll -= weights[rarity.id]
    if (roll <= 0) return rarity.id
  }
  return 'common'
}

export function pickFish(distance: FishingDistance) {
  const candidates = FISH.filter((fish) => fish.distance === distance)
  return candidates[Math.floor(Math.random() * candidates.length)] ?? FISH[0]
}

export const rarityDifficulty = (rarity: FishRarity) =>
  ({ common: 0.8, uncommon: 1.2, rare: 1.6, epic: 2.1, legendary: 2.7 })[rarity]
