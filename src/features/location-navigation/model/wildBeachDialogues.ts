import {
  openDialogue,
  useDialogueStore,
  type Dialogue,
  type DialogueSpeaker,
} from '@/features/dialogues'
import fishermanSprite from '@/shared/assets/features/dialogues/fisherman-basset.png'
import pirateSprite from '@/shared/assets/features/dialogues/pirate-corgi.png'

export const FISHERMAN_DIALOGUE_ID = 'wild-beach-fisherman-intro-v1'
export const PIRATE_DIALOGUE_ID = 'wild-beach-pirate-intro-v1'

const fisherman: DialogueSpeaker = {
  id: 'basset-fisherman',
  name: 'Бруно, рыбак',
  sprite: fishermanSprite,
}

const pirate: DialogueSpeaker = {
  id: 'corgi-pirate',
  name: 'Капитан Рыжий',
  sprite: pirateSprite,
}

const fishermanDialogue: Dialogue = {
  id: FISHERMAN_DIALOGUE_ID,
  messages: [
    {
      id: 'greeting',
      speaker: fisherman,
      emotion: 'neutral',
      text: 'Тихо здесь, правда? Рыба клюёт лучше, когда никто не торопится. Причал можешь использовать сколько захочешь.',
    },
    {
      id: 'reward',
      speaker: fisherman,
      emotion: 'happy',
      text: 'Приноси улов мне и я дам тебе монетки.',
    },
  ],
}

const pirateDialogue: Dialogue = {
  id: PIRATE_DIALOGUE_ID,
  messages: [
    {
      id: 'greeting',
      speaker: pirate,
      emotion: 'surprised',
      text: 'Эй, салага! Волны принесли целую флотилию бутылок, а в каждой — карта сокровищ. Но я не знаю, как их правильно читать. Поможешь?',
    },
    {
      id: 'request',
      speaker: pirate,
      emotion: 'happy',
      text: 'Тебе надо будет провести меня по лабиринту пляжа, чтобы я смог собрать все сундуки. Так и быть из каждого сундука я отдам тебе одну монетку. Думаю, так будет честно!',
    },
  ],
}

function openOnce(dialogue: Dialogue) {
  const state = useDialogueStore.getState()
  if (state.activeDialogueId || state.readDialogueIds.includes(dialogue.id)) return
  openDialogue(dialogue)
}

export const openFishermanIntroduction = () => openOnce(fishermanDialogue)
export const openPirateIntroduction = () => openOnce(pirateDialogue)
