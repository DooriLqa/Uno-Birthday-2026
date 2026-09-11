import type { CSSProperties } from 'react'
import pier from '@/shared/assets/locations/tourist/pier.png'
import cove from '@/shared/assets/locations/tourist/cove.png'
import library from '@/shared/assets/locations/tourist/library.png'
import lounger from '@/shared/assets/locations/tourist/lounger.png'
import beach from '@/shared/assets/locations/tourist/beach.png'
import shop from '@/shared/assets/locations/tourist/shop.png'
import arcades from '@/shared/assets/locations/tourist/arcades.png'
import wildBeach from '@/shared/assets/locations/wild/overview.png'
import fisherHut from '@/shared/assets/locations/wild/fisher-hut.png'
import totemCamp from '@/shared/assets/locations/wild/totem-camp.png'
import pirateShore from '@/shared/assets/locations/wild/pirate-shore.png'
import jungleOverview from '@/shared/assets/locations/jungle/overview.png'
import jungleCave from '@/shared/assets/locations/jungle/cave.png'
import jungleWaterfall from '@/shared/assets/locations/jungle/waterfall.png'
import nicheStream from '@/shared/assets/locations/jungle/niche-stream.png'
import locationFootstepsSound from '@/shared/assets/common/audio/location-footsteps.ogg'

export type LocationId =
  | 'pier'
  | 'quiet-cove'
  | 'library'
  | 'lounger'
  | 'tourist-beach'
  | 'shop'
  | 'arcades'
  | 'wild-beach'
  | 'fisher-hut'
  | 'totem-camp'
  | 'pirate-shore'
  | 'jungle'
  | 'jungle-cave'
  | 'jungle-waterfall'
  | 'niche-stream'
export type LocationAction =
  | { type: 'location'; locationId: LocationId }
  | { type: 'game'; gameId: string }
  | { type: 'merchant' }
  | { type: 'sailor' }
  | { type: 'map' }
  | { type: 'jungle-cave' }
  | { type: 'barista' }
export type LocationCursor =
  | 'pointer'
  | 'magnify'
  | 'arrow-up'
  | 'arrow-down'
  | 'arrow-left'
  | 'arrow-right'
  | 'turn-left'
  | 'turn-right'
  | 'projected-back'
  | 'projected-forward'
  | 'dialogue'
  | 'hand-point'
  | 'hand-grab'
  | 'hand-open'
export type LocationHotspot = {
  id: string
  label: string
  area: Pick<CSSProperties, 'left' | 'top' | 'width' | 'height'>
  cursor?: LocationCursor
  action: LocationAction
}
export type LocationDefinition = {
  id: LocationId
  regionId: 'tourist-beach' | 'wild-beach' | 'jungle'
  title: string
  image: string
  transitionSound?: string
  isWide?: boolean
  ambienceVolume?: number
  ambience?: 'beach' | 'niche-stream'
  hotspots: LocationHotspot[]
}
const area = (left: number, top: number, width: number, height: number) => ({
  left: left + '%',
  top: top + '%',
  width: width + '%',
  height: height + '%',
})
const base = {
  regionId: 'tourist-beach',
  transitionSound: locationFootstepsSound,
  ambienceVolume: 1,
  ambience: 'beach',
} as const
const wildBase = {
  regionId: 'wild-beach',
  transitionSound: locationFootstepsSound,
  ambienceVolume: 1,
  ambience: 'beach',
} as const
const jungleBase = {
  regionId: 'jungle',
  transitionSound: locationFootstepsSound,
} as const
export const locations: Record<LocationId, LocationDefinition> = {
  pier: {
    ...base,
    id: 'pier',
    title: 'Причал',
    image: pier,
    isWide: true,
    hotspots: [
      {
        id: 'left',
        label: 'Налево — в Бухту спокойствия',
        area: area(0, 9, 31, 55),
        cursor: 'arrow-left',
        action: { type: 'location', locationId: 'quiet-cove' },
      },
      {
        id: 'sailor',
        label: 'Поговорить со старым моряком',
        area: area(34, 24, 17, 43),
        cursor: 'dialogue',
        action: { type: 'sailor' },
      },
      {
        id: 'right',
        label: 'Направо — на пляж с лавкой',
        area: area(84, 9, 16, 55),
        cursor: 'arrow-right',
        action: { type: 'location', locationId: 'tourist-beach' },
      },
      {
        id: 'inland',
        label: 'Вглубь острова — нужна карта',
        area: area(58, 4, 25, 49),
        cursor: 'projected-forward',
        action: { type: 'map' },
      },
    ],
  },
  'quiet-cove': {
    ...base,
    id: 'quiet-cove',
    title: 'Бухта спокойствия',
    image: cove,
    hotspots: [
      {
        id: 'library',
        label: 'Войти в библиотеку',
        area: area(63, 17, 36, 49),
        cursor: 'projected-forward',
        action: { type: 'location', locationId: 'library' },
      },
      {
        id: 'rest',
        label: 'Отдохнуть на лежаке',
        area: area(21, 32, 28, 32),
        cursor: 'magnify',
        action: { type: 'location', locationId: 'lounger' },
      },
    ],
  },
  library: {
    ...base,
    id: 'library',
    title: 'Пляжная библиотека',
    image: library,
    ambienceVolume: 0.3,
    hotspots: [],
  },
  lounger: { ...base, id: 'lounger', title: 'Вид с лежака', image: lounger, hotspots: [] },
  'tourist-beach': {
    ...base,
    id: 'tourist-beach',
    title: 'Туристический пляж',
    image: beach,
    hotspots: [
      {
        id: 'canopy',
        label: 'Подойти к лавке и автоматам',
        area: area(2, 8, 65, 65),
        cursor: 'projected-forward',
        action: { type: 'location', locationId: 'shop' },
      },
    ],
  },
  shop: {
    ...base,
    id: 'shop',
    title: 'Лавка Пончика',
    image: shop,
    hotspots: [
      {
        id: 'merchant',
        label: 'Поговорить с Пончиком',
        area: area(6, 25, 45, 57),
        cursor: 'dialogue',
        action: { type: 'merchant' },
      },
      {
        id: 'machines',
        label: 'Подойти к игровым автоматам',
        area: area(51, 27, 37, 55),
        cursor: 'magnify',
        action: { type: 'location', locationId: 'arcades' },
      },
    ],
  },
  arcades: {
    ...base,
    id: 'arcades',
    title: 'Игровые автоматы',
    image: arcades,
    hotspots: [
      {
        id: 'catch',
        label: 'Ловля предметов',
        area: area(40, 15, 19, 73),
        cursor: 'projected-forward',
        action: { type: 'game', gameId: 'fruit-basket' },
      },
      {
        id: 'arkanoid',
        label: 'Арканоид',
        area: area(60, 15, 21, 73),
        cursor: 'projected-forward',
        action: { type: 'game', gameId: 'arkanoid' },
      },
    ],
  },
  'wild-beach': {
    ...wildBase,
    id: 'wild-beach',
    title: 'Дикий пляж',
    image: wildBeach,
    isWide: true,
    hotspots: [
      {
        id: 'fisher-hut',
        label: 'Рыбацкий домик',
        area: area(0, 8, 30, 57),
        cursor: 'projected-forward',
        action: { type: 'location', locationId: 'fisher-hut' },
      },
      {
        id: 'totem-camp',
        label: 'Кострище с тотемами',
        area: area(31, 19, 38, 52),
        cursor: 'magnify',
        action: { type: 'location', locationId: 'totem-camp' },
      },
      {
        id: 'pirate-shore',
        label: 'Пиратский берег',
        area: area(69, 8, 31, 66),
        cursor: 'projected-forward',
        action: { type: 'location', locationId: 'pirate-shore' },
      },
    ],
  },
  'fisher-hut': {
    ...wildBase,
    id: 'fisher-hut',
    title: 'Домик рыбака',
    image: fisherHut,
    hotspots: [
      {
        id: 'fishing-pier',
        label: 'Порыбачить с причала',
        area: area(34, 27, 43, 36),
        cursor: 'projected-forward',
        action: { type: 'game', gameId: 'fishing' },
      },
    ],
  },
  'totem-camp': {
    ...wildBase,
    id: 'totem-camp',
    title: 'Кострище четырёх тотемов',
    image: totemCamp,
    hotspots: [
      {
        id: 'totems',
        label: 'Разгадать код тотемов',
        area: area(9, 10, 82, 55),
        cursor: 'hand-point',
        action: { type: 'game', gameId: 'totem-code' },
      },
    ],
  },
  'pirate-shore': {
    ...wildBase,
    id: 'pirate-shore',
    title: 'Берег посланий',
    image: pirateShore,
    hotspots: [
      {
        id: 'bottles',
        label: 'Разобрать записки из бутылок',
        area: area(3, 43, 85, 52),
        cursor: 'hand-grab',
        action: { type: 'game', gameId: 'robot-maze' },
      },
    ],
  },
  jungle: {
    ...jungleBase,
    id: 'jungle',
    title: 'Джунгли',
    image: jungleOverview,
    isWide: true,
    hotspots: [
      {
        id: 'cave',
        label: 'Подойти к пещере',
        area: area(1, 3, 43, 70),
        cursor: 'projected-forward',
        action: { type: 'location', locationId: 'jungle-cave' },
      },
      {
        id: 'waterfall',
        label: 'Подойти к водопаду',
        area: area(71, 7, 29, 70),
        cursor: 'projected-forward',
        action: { type: 'location', locationId: 'jungle-waterfall' },
      },
    ],
  },
  'jungle-cave': {
    ...jungleBase,
    id: 'jungle-cave',
    title: 'Пещера одноглазых охотников',
    image: jungleCave,
    hotspots: [
      {
        id: 'entrance',
        label: 'Войти в тёмную пещеру',
        area: area(22, 1, 50, 74),
        cursor: 'projected-forward',
        action: { type: 'jungle-cave' },
      },
    ],
  },
  'jungle-waterfall': {
    ...jungleBase,
    id: 'jungle-waterfall',
    title: 'Водопад в джунглях',
    image: jungleWaterfall,
    hotspots: [
      {
        id: 'niche-stream',
        label: 'Зайти за стену водопада в кофейню «Нишевый поток»',
        area: area(69, 6, 29, 69),
        cursor: 'projected-forward',
        action: { type: 'location', locationId: 'niche-stream' },
      },
    ],
  },
  'niche-stream': {
    ...jungleBase,
    id: 'niche-stream',
    title: 'Нишевый поток',
    image: nicheStream,
    ambience: 'niche-stream',
    ambienceVolume: 1,
    hotspots: [
      {
        id: 'coffee-bar',
        label: 'Поговорить с баристой',
        area: area(0, 9, 35, 57),
        cursor: 'dialogue',
        action: { type: 'barista' },
      },
      {
        id: 'lagoon-flight',
        label: 'Сыграть в «Полёт над лагуной»',
        area: area(44, 20, 20, 54),
        cursor: 'projected-forward',
        action: { type: 'game', gameId: 'flappy-bird' },
      },
    ],
  },
}
export const worldRegions = [
  {
    id: 'tourist-beach',
    title: 'Туристический пляж',
    entry: 'pier' as LocationId,
    area: area(61, 58, 24, 27),
  },
  {
    id: 'wild-beach',
    title: 'Дикий пляж',
    entry: 'wild-beach' as LocationId,
    area: area(7, 12, 27, 24),
  },
  { id: 'jungle', title: 'Джунгли', entry: 'jungle' as LocationId, area: area(43, 12, 23, 23) },
]
