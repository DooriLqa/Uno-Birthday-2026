export type FishingDistance = 'near' | 'mid' | 'far'
export type FishBehavior = 'mixed' | 'smooth' | 'sinker' | 'floater' | 'dart'

export type Fish = {
  id: string
  name: string
  distance: FishingDistance
  emoji: string
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
  { id: 'sand-sardine', name: 'Песчаная сардинка', distance: 'near', emoji: '🐟', behavior: 'smooth', speed: 1.4, jump: 0.9, description: 'Спокойная маленькая рыбка у самого берега.' },
  { id: 'reef-goby', name: 'Рифовый бычок', distance: 'near', emoji: '🐠', behavior: 'sinker', speed: 1.6, jump: 1.4, description: 'Резко ныряет вниз и возвращается к камням.' },
  { id: 'coral-perch', name: 'Коралловый окунь', distance: 'near', emoji: '🐟', behavior: 'mixed', speed: 1.8, jump: 1.5, description: 'Прыгает небольшими рывками.' },
  { id: 'tiny-mackerel', name: 'Юркая скумбрия', distance: 'near', emoji: '🐟', behavior: 'dart', speed: 2, jump: 2.1, description: 'Маленькая, но неожиданно резкая.' },
  { id: 'shellfish-bream', name: 'Ракушечный лещ', distance: 'near', emoji: '🐠', behavior: 'floater', speed: 1.5, jump: 1.3, description: 'Плавно всплывает и снова опускается.' },
  { id: 'silver-mackerel', name: 'Серебряная скумбрия', distance: 'mid', emoji: '🐟', behavior: 'mixed', speed: 2.1, jump: 1.8, description: 'Классическая средняя морская рыба.' },
  { id: 'coral-trout', name: 'Коралловая форель', distance: 'mid', emoji: '🐠', behavior: 'sinker', speed: 2.2, jump: 2, description: 'Ныряет быстрее, чем кажется.' },
  { id: 'turquoise-bass', name: 'Бирюзовый бас', distance: 'mid', emoji: '🐟', behavior: 'dart', speed: 2.3, jump: 2.4, description: 'Двигается короткими хаотичными сериями.' },
  { id: 'sunny-bream', name: 'Янтарный лещ', distance: 'mid', emoji: '🐠', behavior: 'floater', speed: 2, jump: 2.1, description: 'Любит резко всплывать к поверхности.' },
  { id: 'striped-jack', name: 'Полосатый джек', distance: 'mid', emoji: '🐟', behavior: 'smooth', speed: 2.4, jump: 1.9, description: 'Быстро, но предсказуемо меняет направление.' },
  { id: 'deep-marlin', name: 'Глубинный марлин', distance: 'far', emoji: '🐟', behavior: 'dart', speed: 2.7, jump: 2.6, description: 'Мощно мечется по всей глубине.' },
  { id: 'storm-tuna', name: 'Штормовой тунец', distance: 'far', emoji: '🐟', behavior: 'sinker', speed: 2.6, jump: 2.4, description: 'После каждого разворота резко ускоряется.' },
  { id: 'moon-snapper', name: 'Лунный снаппер', distance: 'far', emoji: '🐠', behavior: 'floater', speed: 2.4, jump: 2.5, description: 'Парит, а затем внезапно взмывает вверх.' },
  { id: 'ocean-giant', name: 'Океанский гигант', distance: 'far', emoji: '🐟', behavior: 'mixed', speed: 2.9, jump: 2.3, description: 'Тяжёлая рыба с длинными рывками.' },
  { id: 'golden-swordfish', name: 'Золотой меч-рыба', distance: 'far', emoji: '🐠', behavior: 'dart', speed: 3.1, jump: 2.8, description: 'Почти не сидит на одном месте.' },
]

export const getRarity = (rarity: FishRarity) => RARITIES.find((item) => item.id === rarity) ?? RARITIES[0]

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
  ({ common: 0.7, uncommon: 1, rare: 1.3, epic: 1.7, legendary: 2.5 })[rarity]
