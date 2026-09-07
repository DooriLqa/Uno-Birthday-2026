import type { CSSProperties } from 'react'
import beachArcades from '@/shared/assets/locations/beach-arcades-v2.png'
import beachBookshelf from '@/shared/assets/locations/beach-bookshelf-v2.png'
import beachLibraryDeck from '@/shared/assets/locations/beach-library-deck-v2.png'
import beachPierPanorama from '@/shared/assets/locations/beach-pier-panorama-32x9.png'
import beachShopCounter from '@/shared/assets/locations/beach-shop-counter-v2.png'
import beachShopOverview from '@/shared/assets/locations/beach-shop-overview-v2.png'

export type LocationAction =
  | { type: 'location'; locationId: LocationId }
  | { type: 'game'; gameId: string }
  | { type: 'dialogue'; dialogueId: 'merchant-greeting' }

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
  id:
    | 'beach-panorama'
    | 'beach-shop'
    | 'beach-shop-counter'
    | 'beach-arcades'
    | 'beach-library-deck'
    | 'beach-bookshelf'
  title: string
  image: string
  transitionSound?: string
  isWide?: boolean
  hotspots: LocationHotspot[]
}

export type LocationId = LocationDefinition['id']

const sandSteps = '/audio/sfx/location-footsteps.ogg'

export const locations: Record<LocationId, LocationDefinition> = {
  'beach-panorama': {
    id: 'beach-panorama',
    title: 'Причал у пляжа',
    image: beachPierPanorama,
    transitionSound: sandSteps,
    isWide: true,
    hotspots: [
      {
        id: 'reading-deck',
        label: 'Подойти к читальному помосту',
        area: { left: '1%', top: '14%', width: '25%', height: '73%' },
        cursor: 'arrow-left',
        action: { type: 'location', locationId: 'beach-library-deck' },
      },
      {
        id: 'shop',
        label: 'Подойти к лавке',
        area: { left: '35%', top: '12%', width: '23%', height: '73%' },
        cursor: 'magnify',
        action: { type: 'location', locationId: 'beach-shop' },
      },
      {
        id: 'fishing',
        label: 'Порыбачить',
        area: { left: '80%', top: '14%', width: '28%', height: '75%' },
        cursor: 'arrow-right',
        action: { type: 'game', gameId: 'fishing' },
      },
    ],
  },
  'beach-shop': {
    id: 'beach-shop',
    title: 'Лавка Пончика',
    image: beachShopOverview,
    transitionSound: sandSteps,
    hotspots: [
      {
        id: 'shop-counter',
        label: 'Рассмотреть лавку',
        area: { left: '9%', top: '13%', width: '51%', height: '77%' },
        cursor: 'projected-forward',
        action: { type: 'location', locationId: 'beach-shop-counter' },
      },
      {
        id: 'arcades',
        label: 'Подойти к игровым автоматам',
        area: { left: '60%', top: '22%', width: '36%', height: '65%' },
        cursor: 'arrow-right',
        action: { type: 'location', locationId: 'beach-arcades' },
      },
    ],
  },
  'beach-shop-counter': {
    id: 'beach-shop-counter',
    title: 'У прилавка',
    image: beachShopCounter,
    transitionSound: sandSteps,
    hotspots: [
      {
        id: 'merchant',
        label: 'Позвать Пончика',
        area: { left: '25%', top: '27%', width: '49%', height: '52%' },
        cursor: 'dialogue',
        action: { type: 'dialogue', dialogueId: 'merchant-greeting' },
      },
    ],
  },
  'beach-arcades': {
    id: 'beach-arcades',
    title: 'Три игровых автомата',
    image: beachArcades,
    transitionSound: sandSteps,
    hotspots: [
      {
        id: 'arkanoid',
        label: 'Запустить Арканоид',
        area: { left: '4%', top: '14%', width: '28%', height: '75%' },
        cursor: 'projected-forward',
        action: { type: 'game', gameId: 'arkanoid' },
      },
      {
        id: 'flappy-bird',
        label: 'Запустить Полёт над лагуной',
        area: { left: '35%', top: '14%', width: '29%', height: '75%' },
        cursor: 'projected-forward',
        action: { type: 'game', gameId: 'flappy-bird' },
      },
      {
        id: 'fruit-basket',
        label: 'Запустить Корзину удачи',
        area: { left: '67%', top: '14%', width: '29%', height: '75%' },
        cursor: 'projected-forward',
        action: { type: 'game', gameId: 'fruit-basket' },
      },
    ],
  },
  'beach-library-deck': {
    id: 'beach-library-deck',
    title: 'Помост с библиотекой',
    image: beachLibraryDeck,
    transitionSound: sandSteps,
    hotspots: [
      {
        id: 'bookshelves',
        label: 'Рассмотреть пустые полки',
        area: { left: '42%', top: '14%', width: '47%', height: '76%' },
        cursor: 'magnify',
        action: { type: 'location', locationId: 'beach-bookshelf' },
      },
    ],
  },
  'beach-bookshelf': {
    id: 'beach-bookshelf',
    title: 'Разбросанные книги',
    image: beachBookshelf,
    transitionSound: sandSteps,
    hotspots: [
      {
        id: 'book-shelf-game',
        label: 'Расставить книги по полкам',
        area: { left: '12%', top: '8%', width: '76%', height: '84%' },
        cursor: 'projected-forward',
        action: { type: 'game', gameId: 'book-shelf' },
      },
    ],
  },
}
