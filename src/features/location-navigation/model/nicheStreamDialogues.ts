import {
  openDialogue,
  useDialogueStore,
  type DialogueChoice,
  type DialogueSpeaker,
} from '@/features/dialogues'
import { usePawCoinStore } from '@/features/currency/model/store'
import { CAFE_DRINKS_BY_ID, type CafeDrinkId } from '@/features/inventory/model/items'
import { useInventoryStore } from '@/features/inventory/model/store'
import baristaSprite from '@/shared/assets/features/dialogues/aussie-barista.png'

export const NICHE_STREAM_INTRO_ID = 'niche-stream-barista-intro-v1'
const DRINK_COST = 2

const barista: DialogueSpeaker = {
  id: 'aussie-barista',
  name: 'Мелли, бариста',
  sprite: baristaSprite,
}

function openPurchaseResult(drinkId: CafeDrinkId) {
  const drink = CAFE_DRINKS_BY_ID[drinkId]
  if (!usePawCoinStore.getState().spendPawCoins(DRINK_COST)) {
    openDialogue({
      id: 'niche-stream-not-enough-coins',
      messages: [
        {
          id: 'not-enough',
          speaker: barista,
          emotion: 'neutral',
          text: 'Не хватает монет. Любой напиток стоит две — заглядывай, когда немного подзаработаешь.',
        },
      ],
    })
    return
  }

  useInventoryStore.getState().addItem(drink)
  openDialogue({
    id: `niche-stream-bought-${drink.id}`,
    messages: [
      {
        id: 'bought',
        speaker: barista,
        emotion: 'happy',
        text: `${drink.name} готов! Я аккуратно положу напиток в твой инвентарь.`,
      },
    ],
  })
}

function drinkChoices(ids: readonly CafeDrinkId[]): DialogueChoice[] {
  return ids.map((id) => ({
    id,
    label: `${CAFE_DRINKS_BY_ID[id].name} — ${DRINK_COST} монеты`,
    onSelect: () => openPurchaseResult(id),
  }))
}

function openCoffeeMenu() {
  openDialogue({
    id: 'niche-stream-coffee-menu',
    messages: [
      {
        id: 'coffee-choice',
        speaker: barista,
        emotion: 'happy',
        text: 'Какой кофе приготовить?',
        choices: drinkChoices(['espresso', 'cappuccino', 'vanilla-latte']),
      },
    ],
  })
}

function openBubbleTeaMenu() {
  openDialogue({
    id: 'niche-stream-bubble-tea-menu',
    messages: [
      {
        id: 'bubble-tea-choice',
        speaker: barista,
        emotion: 'happy',
        text: 'Какой вкус бабл-ти хочешь?',
        choices: drinkChoices(['mango-bubble-tea', 'strawberry-bubble-tea', 'taro-bubble-tea']),
      },
    ],
  })
}

function openDrinkMenu() {
  openDialogue({
    id: 'niche-stream-drink-menu',
    messages: [
      {
        id: 'drink-type',
        speaker: barista,
        emotion: 'happy',
        text: 'Сегодня любой напиток стоит две монеты. Что будешь?',
        choices: [
          { id: 'coffee', label: 'Выбрать кофе', onSelect: openCoffeeMenu },
          { id: 'bubble-tea', label: 'Выбрать бабл-ти', onSelect: openBubbleTeaMenu },
          { id: 'later', label: 'Пока ничего', onSelect: () => {} },
        ],
      },
    ],
  })
}

export function talkToNicheStreamBarista() {
  if (useDialogueStore.getState().readDialogueIds.includes(NICHE_STREAM_INTRO_ID)) {
    openDrinkMenu()
    return
  }

  openDialogue({
    id: NICHE_STREAM_INTRO_ID,
    messages: [
      {
        id: 'welcome',
        speaker: barista,
        emotion: 'happy',
        text: 'Добро пожаловать в «Нишевый поток»! Хоть к нам и нет особых указателей, люди с душой всегда находят сюда дорогу.',
      },
      {
        id: 'come-back',
        speaker: barista,
        emotion: 'neutral',
        text: 'Я Мелли. Загляни ещё раз — приготовлю кофе или бабл-ти за две монеты.',
      },
    ],
  })
}
