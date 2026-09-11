import type { InventoryItem } from './store'
import collieRedKeychain from '@/shared/assets/features/inventory/arcade-keychains/collie-red-keychain.png'
import shepherdGreenKeychain from '@/shared/assets/features/inventory/arcade-keychains/shepherd-green-keychain.png'
import beagleBlueKeychain from '@/shared/assets/features/inventory/arcade-keychains/beagle-blue-keychain.png'
import tropicalFieldJournalSpread from '@/shared/assets/features/inventory/books/tropical-field-journal-spread.png'
import sailorLogbookSpread from '@/shared/assets/features/inventory/books/sailor-logbook-spread.png'
import treasureAtlasSpread from '@/shared/assets/features/inventory/books/treasure-atlas-spread.png'
import coffeeArtwork from '@/shared/assets/features/inventory/drinks/coffee.png'
import bubbleTeaArtwork from '@/shared/assets/features/inventory/drinks/bubble-tea.png'

export type CafeDrinkId =
  | 'espresso'
  | 'cappuccino'
  | 'vanilla-latte'
  | 'mango-bubble-tea'
  | 'strawberry-bubble-tea'
  | 'taro-bubble-tea'

export const CAFE_DRINKS_BY_ID: Readonly<Record<CafeDrinkId, InventoryItem>> = {
  espresso: {
    id: 'espresso',
    name: 'Эспрессо',
    icon: '☕',
    description: 'Крепкий кофе из «Нишевого потока».',
  },
  cappuccino: {
    id: 'cappuccino',
    name: 'Капучино',
    icon: '☕',
    description: 'Мягкий кофе с воздушной молочной пеной.',
  },
  'vanilla-latte': {
    id: 'vanilla-latte',
    name: 'Ванильный латте',
    icon: '☕',
    description: 'Тёплый латте с ароматом ванили.',
  },
  'mango-bubble-tea': {
    id: 'mango-bubble-tea',
    name: 'Манговый бабл-ти',
    icon: '🧋',
    description: 'Фруктовый чай с манго и шариками тапиоки.',
  },
  'strawberry-bubble-tea': {
    id: 'strawberry-bubble-tea',
    name: 'Клубничный бабл-ти',
    icon: '🧋',
    description: 'Ягодный чай с клубникой и шариками тапиоки.',
  },
  'taro-bubble-tea': {
    id: 'taro-bubble-tea',
    name: 'Бабл-ти с таро',
    icon: '🧋',
    description: 'Сливочный чай с таро и шариками тапиоки.',
  },
}

export const BOOK_ITEMS: readonly InventoryItem[] = [
  {
    id: 'tropical-field-journal',
    name: 'Тропический путевой дневник',
    icon: '📗',
    kind: 'book',
    rarity: 'uncommon',
    inspectable: true,
    pages: [tropicalFieldJournalSpread],
  },
  {
    id: 'sailor-logbook',
    name: 'Морской журнал',
    icon: '📘',
    kind: 'book',
    rarity: 'rare',
    inspectable: true,
    pages: [sailorLogbookSpread],
  },
  {
    id: 'treasure-hunter-atlas',
    name: 'Атлас искателя сокровищ',
    icon: '📕',
    kind: 'book',
    rarity: 'epic',
    inspectable: true,
    pages: [treasureAtlasSpread],
  },
]

export const ARCADE_REWARDS_BY_GAME_ID: Readonly<Record<string, InventoryItem>> = {
  'flappy-bird': {
    id: 'arcade-pin-dachshund-red',
    name: 'Брелок «Колли-пилот»',
    icon: '🐕',
    rarity: 'rare',
    inspectable: true,
    description: 'Деревянный брелок с колли, большими часами и красным ошейником.',
  },
  'fruit-basket': {
    id: 'arcade-pin-shiba-green',
    name: 'Брелок «Овчарка-собиратель»',
    icon: '🐕',
    rarity: 'rare',
    inspectable: true,
    description: 'Деревянный брелок с овчаркой, большими часами и зелёным ошейником.',
  },
  arkanoid: {
    id: 'arcade-pin-aussie-blue',
    name: 'Брелок «Бигль-чемпион»',
    icon: '🐕',
    rarity: 'rare',
    inspectable: true,
    description: 'Деревянный брелок с биглем, большими часами и синим ошейником.',
  },
}

const ITEM_ARTWORK_BY_ID: Readonly<Record<string, string>> = {
  'arcade-pin-dachshund-red': collieRedKeychain,
  'arcade-pin-shiba-green': shepherdGreenKeychain,
  'arcade-pin-aussie-blue': beagleBlueKeychain,
  'tropical-field-journal': tropicalFieldJournalSpread,
  'sailor-logbook': sailorLogbookSpread,
  'treasure-hunter-atlas': treasureAtlasSpread,
  espresso: coffeeArtwork,
  cappuccino: coffeeArtwork,
  'vanilla-latte': coffeeArtwork,
  'mango-bubble-tea': bubbleTeaArtwork,
  'strawberry-bubble-tea': bubbleTeaArtwork,
  'taro-bubble-tea': bubbleTeaArtwork,
}

const ARCADE_REWARDS_BY_ITEM_ID = Object.fromEntries(
  Object.values(ARCADE_REWARDS_BY_GAME_ID).map((item) => [item.id, item]),
) as Readonly<Record<string, InventoryItem>>

export const isArcadeKeychain = (itemId: string) => itemId in ARCADE_REWARDS_BY_ITEM_ID

const ITEM_DEFINITIONS_BY_ID: Readonly<Record<string, InventoryItem>> = {
  ...ARCADE_REWARDS_BY_ITEM_ID,
  ...Object.fromEntries(BOOK_ITEMS.map((item) => [item.id, item])),
  ...CAFE_DRINKS_BY_ID,
}

export const getInventoryItemArtwork = (itemId: string) => ITEM_ARTWORK_BY_ID[itemId]

export const getInventoryItemPresentation = (item: InventoryItem): InventoryItem => {
  const currentDefinition = ITEM_DEFINITIONS_BY_ID[item.id]
  return currentDefinition ? { ...item, ...currentDefinition, quantity: item.quantity } : item
}
