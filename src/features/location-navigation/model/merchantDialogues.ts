import {
  openDialogue,
  useDialogueStore,
  type DialogueChoice,
  type DialogueSpeaker,
} from '@/features/dialogues'
import { usePawCoinStore } from '@/features/currency/model/store'
import { useInventoryStore } from '@/features/inventory/model/store'
import merchantSprite from '@/shared/assets/features/dialogues/shiba-merchant.png'

export const MAP_ITEM_ID = 'shiba-treasure-map'
export const LANTERN_ITEM_ID = 'oil-lantern'
export const CAVE_DARK_DIALOGUE_ID = 'jungle-cave-dark-v1'
const LANTERN_COST = 15
const GREETING_ID = 'tourist-merchant-map-v1'
const merchant: DialogueSpeaker = {
  id: 'shiba-merchant',
  name: 'Пончик, торговец',
  sprite: merchantSprite,
}
const yuni: DialogueSpeaker = { id: 'yuni', name: 'Юни', isMain: true }

export const hasIslandMap = () =>
  useInventoryStore.getState().items.some((item) => item.id === MAP_ITEM_ID)

export const hasOilLantern = () =>
  useInventoryStore.getState().items.some((item) => item.id === LANTERN_ITEM_ID)

export function openMapWarning() {
  openDialogue({
    id: 'island-map-required',
    messages: [
      {
        id: 'warning',
        speaker: { id: 'yuni', name: 'Юни', isMain: true },
        emotion: 'neutral',
        text: 'Без карты легко заблудиться. Сначала зайду к торговцу на пляже справа от причала.',
      },
    ],
  })
}

export function tryEnterJungleCave(onOpenCrossword: () => void) {
  if (hasOilLantern()) {
    onOpenCrossword()
    return
  }

  openDialogue({
    id: CAVE_DARK_DIALOGUE_ID,
    messages: [
      {
        id: 'too-dark',
        speaker: yuni,
        emotion: 'neutral',
        text: 'Внутри совсем темно. Без источника света туда лучше не заходить — нужно найти фонарь.',
      },
    ],
  })
}

function openQuizInvitation(onOpenQuiz: () => void) {
  openDialogue({
    id: 'tourist-merchant-quiz',
    messages: [
      {
        id: 'invite',
        speaker: merchant,
        emotion: 'happy',
        text: 'Сыграем в квиз? Пять правильных ответов — и радиоприёмник твой. Попытка стоит одну монетку.',
      },
      {
        id: 'start',
        speaker: merchant,
        emotion: 'happy',
        text: 'Приступим!',
        onComplete: onOpenQuiz,
      },
    ],
  })
}

function buyOilLantern() {
  if (hasOilLantern()) {
    openDialogue({
      id: 'tourist-merchant-lantern-owned',
      messages: [
        {
          id: 'owned',
          speaker: merchant,
          emotion: 'happy',
          text: 'Фонарь уже у тебя. Проверь масло и смело возвращайся к пещере!',
        },
      ],
    })
    return
  }

  if (!usePawCoinStore.getState().spendPawCoins(LANTERN_COST)) {
    openDialogue({
      id: 'tourist-merchant-lantern-poor',
      messages: [
        {
          id: 'not-enough',
          speaker: merchant,
          emotion: 'neutral',
          text: 'Пока не хватает монет. Подзаработай ещё немного и возвращайся — фонарь стоит 15 монет.',
        },
      ],
    })
    return
  }

  useInventoryStore.getState().addItem({
    id: LANTERN_ITEM_ID,
    name: 'Масляный фонарь',
    icon: '🏮',
  })
  openDialogue({
    id: 'tourist-merchant-lantern-bought',
    messages: [
      {
        id: 'bought',
        speaker: merchant,
        emotion: 'happy',
        text: 'Держи масляный фонарь! Теперь в пещере будет достаточно света. Только не размахивай им возле хвоста.',
      },
    ],
  })
}

function openMerchantOptions(onOpenQuiz: () => void) {
  const choices: DialogueChoice[] = [
    ...(hasOilLantern()
      ? []
      : [
          {
            id: 'buy-lantern',
            label: `Купить масляный фонарь — ${LANTERN_COST} монет`,
            onSelect: buyOilLantern,
          },
        ]),
    {
      id: 'open-quiz',
      label: 'Сыграть в квиз',
      onSelect: () => openQuizInvitation(onOpenQuiz),
    },
  ]

  openDialogue({
    id: 'tourist-merchant-options',
    messages: [
      {
        id: 'options',
        speaker: merchant,
        emotion: 'happy',
        text: hasOilLantern()
          ? 'Фонарь пригодился? Чем ещё могу помочь?'
          : 'Для пещеры нужен надёжный свет. Что выберешь?',
        choices,
      },
    ],
  })
}

export function talkToMerchant(onOpenQuiz: () => void) {
  const state = useDialogueStore.getState()
  if (!state.readDialogueIds.includes(GREETING_ID)) {
    openDialogue({
      id: GREETING_ID,
      messages: [
        {
          id: 'welcome',
          speaker: merchant,
          emotion: 'happy',
          text: 'Добро пожаловать на остров! Я Пончик, торгую разными полезными пляжными вещами! Здесь людный пляж, можешь развлекаться! Если хочется тишины, в противоположной стороне есть Тихая Бухта, там даже библиотека есть!',
        },
        {
          id: 'map',
          speaker: merchant,
          emotion: 'neutral',
          text: 'Еще вот, держи карту острова. Она тебе обязательно пригодится, чтобы ориентироваться на нашем острове',
          onComplete: () => {
            if (!hasIslandMap())
              useInventoryStore
                .getState()
                .addItem({ id: MAP_ITEM_ID, name: 'Карта острова', icon: '🗺️' })
          },
        },
        {
          id: 'quiz-next',
          speaker: merchant,
          emotion: 'happy',
          text: 'А когда захочешь проверить свою эрудицию — загляни ещё раз. У меня есть квиз с радиоприёмником в награду!',
        },
      ],
    })
    return
  }

  if (state.readDialogueIds.includes(CAVE_DARK_DIALOGUE_ID)) {
    openMerchantOptions(onOpenQuiz)
    return
  }

  openQuizInvitation(onOpenQuiz)
}
