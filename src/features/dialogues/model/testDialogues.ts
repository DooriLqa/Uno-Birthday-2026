import shibaMerchantSprite from '@/shared/assets/dialogues/shiba-merchant.png'
import shibaMerchantGigglingSprite from '@/shared/assets/dialogues/shiba-merchant-giggling.png'
import { usePawCoinStore } from '@/features/currency/model/store'
import { useInventoryStore } from '@/features/inventory/model/store'
import type { Dialogue, DialogueSpeaker } from './types'

const treasureMapItem = { id: 'shiba-treasure-map', name: 'Карта сокровищ', icon: '🗺️' }

const rewardShibaDialogue = () => {
  const inventory = useInventoryStore.getState()
  if (inventory.items.some((item) => item.id === treasureMapItem.id)) return

  inventory.addItem(treasureMapItem)
  usePawCoinStore.getState().addPawCoins(5)
}

const yuni: DialogueSpeaker = { id: 'yuni', name: 'Юни', isMain: true }
const shibaMerchant: DialogueSpeaker = {
  id: 'shiba-merchant',
  name: 'Сиба-торговец Пончик',
  sprite: shibaMerchantSprite,
  spritesByEmotion: {
    giggling: shibaMerchantGigglingSprite,
  },
}

export const dialogueTestSamples: Dialogue[] = [
  {
    id: 'test-shiba-greeting',
    messages: [
      {
        id: 'greeting-yuni',
        speaker: yuni,
        emotion: 'surprised',
        text: 'Ого, ты правда продаёшь ракушки?',
      },
      {
        id: 'greeting-shiba',
        speaker: shibaMerchant,
        emotion: 'happy',
        text: 'Гав! И ракушки, и кокосы, и крайне редкие песчинки!',
      },
      {
        id: 'greeting-shiba-giggle',
        speaker: shibaMerchant,
        emotion: 'giggling',
        text: 'Хи-хи! Особенно редкие — те, что я сам только что намыл.',
        sound: '/audio/sfx/shiba-giggle.wav',
      },
      {
        id: 'greeting-yuni-answer',
        speaker: yuni,
        emotion: 'happy',
        text: 'Тогда одну редкую песчинку, пожалуйста.',
        onComplete: rewardShibaDialogue,
      },
    ],
  },
  {
    id: 'test-shiba-discount',
    messages: [
      {
        id: 'discount-shiba',
        speaker: shibaMerchant,
        emotion: 'neutral',
        text: 'Сегодня скидка: каждая третья ракушка пахнет морем бесплатно!',
      },
      {
        id: 'discount-yuni',
        speaker: yuni,
        emotion: 'sad',
        text: 'А остальные две?',
      },
      {
        id: 'discount-shiba-answer',
        speaker: shibaMerchant,
        emotion: 'happy',
        text: 'Тоже пахнут. Но уже по полной цене. Бизнес!',
      },
    ],
  },
  {
    id: 'test-shiba-farewell',
    messages: [
      {
        id: 'farewell-yuni',
        speaker: yuni,
        emotion: 'neutral',
        text: 'Мне пора искать код тотемов.',
      },
      {
        id: 'farewell-shiba',
        speaker: shibaMerchant,
        emotion: 'happy',
        text: 'Удачи! Если найдёшь лишний тотем — неси ко мне, обменяю на печенье.',
      },
    ],
  },
]
