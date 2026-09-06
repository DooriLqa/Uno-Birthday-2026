import { useQuizProgressStore } from '@/features/beach-radio/model/quizStore'
import type { QuizQuestion } from './types'

export const questions: QuizQuestion[] = [
  {
    id: 'q01',
    text: 'В этой игре лошадей запрограммировали так, чтобы они самостоятельно объезжали препятствия, чтобы игрок в них не врезался.',
    answers: [
      'Red Dead Redemption 2',
      'The Last of Us 2',
      'The Witcher 3: The Wild Hunt',
      'Kingdom Come: Deliverance 2',
    ],
    correctIndex: 0,
  },
  {
    id: 'q02',
    text: 'Максимальная высота в Minecraft в самой новой версии игры',
    answers: ['300', '272', '320', '256'],
    correctIndex: 2,
  },
  {
    id: 'q03',
    text: 'Игра, которую делали дольше всех (среди перечисленных) (с начала разработки и до релиза, не считая поддержку)',
    answers: ['Kenshi', 'The Witness', 'Blue Prince', 'Dwarf Fortress '],
    correctIndex: 3,
  },
  {
    id: 'q04',
    text: 'Сколько обязательных боссов в Dark Souls (без DLC)?',
    answers: ['22', '13', '17', '8'],
    correctIndex: 1,
  },
  {
    id: 'q05',
    text: 'Сколько подарков можно подарить одному NPC за неделю в игре Stardew Valley?',
    answers: ['1', '2', '3', 'Безлимитно'],
    correctIndex: 1,
  },
  {
    id: 'q06',
    text: 'Сколько всего уникальных предметов можно выбить в игре Danganronpa 2: Goodbye Despair в МоноМоно Машине (слот машине)',
    answers: ['108', '120', '132', '156'],
    correctIndex: 0,
  },
  {
    id: 'q07',
    text: 'В Slay the Spire каждый персонаж имеет уникальную механику. Какая уникальная механика у персонажа «Безмолвие» (Silent)?',
    answers: ['Сжигание карт', 'Яды', 'Усиление карт', 'Немота'],
    correctIndex: 1,
  },
  {
    id: 'q08',
    text: 'В игре Tetris создатель Алексей Пажитнов не получил денег за свою игру в СССР. Кто в итоге стал владельцем прав на Tetris?',
    answers: ['Microsoft', 'Nintendo', 'Sega', 'Atari'],
    correctIndex: 1,
  },
  {
    id: 'q09',
    text: 'В Hades 2 последний босс нижнего мира Хроносс в раннем доступе игры имел уникальную механику: Если игрок ставил паузу в битве с ним, он произносил ехидную реплику и принудительно снимал её. Что сделали разработчики в релизной версии?',
    answers: [
      'Оставили эту механику какой и была',
      'Теперь Хронос ехидничает и возвращает на начало битвы (диалога с ним)',
      'Теперь он ходит во время паузы и ворчит',
      'Теперь он даёт минуту песчаных часов и потом снимает паузу',
    ],
    correctIndex: 2,
  },
  {
    id: 'q10',
    text: 'Из какой игры OST?',
    audioSrc: '/audio/quiz/ost/raven.mp3',
    answers: ['Clair Obscur: Expedition 33', 'Diablo 4', 'Ravenswatch', 'Grim Dawn'],
    correctIndex: 2,
  },
  {
    id: 'q11',
    text: 'Из какой игры OST?',
    audioSrc: '/audio/quiz/ost/fable.mp3',
    answers: [
      'Ori and The Blind Forest',
      'Minecraft',
      'Harry Potter and the Goblet of Fire',
      'Fable',
    ],
    correctIndex: 3,
  },
  {
    id: 'q12',
    text: 'Из какой игры OST?',
    audioSrc: '/audio/quiz/ost/hlf2.mp3',
    answers: ['Half-Life 2', 'S.T.A.L.K.E.R.: Shadow of Chernobyl', 'Deus Ex', 'BioShock'],
    correctIndex: 0,
  },
  {
    id: 'q13',
    text: 'Из какой игры OST?',
    audioSrc: '/audio/quiz/ost/linage.mp3',
    answers: ['Heroes of Might & Magic 5', 'Yes, you grace', 'Guild Wars', 'Lineage 2'],
    correctIndex: 3,
  },
  {
    id: 'q14',
    text: 'Из какой игры OST?',
    audioSrc: '/audio/quiz/ost/mor.mp3',
    answers: ['Gothic', 'The Elder Scrolls III: Morrowind', 'Dragon Age: Origins', 'Risen'],
    correctIndex: 1,
  },
  {
    id: 'q15',
    text: 'Из какой игры OST?',
    audioSrc: '/audio/quiz/ost/wog.mp3',
    answers: ['World of Goo', 'Disco Elysium', 'Deponia', 'Worms 4 Mayhem'],
    correctIndex: 0,
  },
  {
    id: 'q16',
    text: 'Какой пароль для входа к магам Воды в Gothic?',
    answers: ['Я забыл пароль!', 'Териантрох', 'Тетриданох', 'Тетриандох'],
    correctIndex: 3,
  },
  {
    id: 'q17',
    text: 'Тормоз замедлитель (8 букв)',
    answers: ['Рекордер', 'Ретардер', 'Интардер', 'Детандер'],
    correctIndex: 1,
  },
  {
    id: 'q18',
    text: 'О какой игре идёт речь?',
    audioSrc: '/audio/quiz/stream/factorio.mp3',
    answers: ['Factorio', '2', '3', '4'],
    correctIndex: 0,
  },
  {
    id: 'q18',
    text: 'О какой игре идёт речь?',
    audioSrc: '/audio/quiz/stream/until.mp3',
    answers: ['Until Dawn', 'Life Is Strange', '3', '4'],
    correctIndex: 0,
  },
  {
    id: 'q18',
    text: 'О какой игре идёт речь?',
    audioSrc: '/audio/quiz/stream/another.mp3',
    answers: ['Another Crab ́s Treasure', '2', '3', '4'],
    correctIndex: 0,
  },
  {
    id: 'q18',
    text: 'О какой игре идёт речь?',
    audioSrc: '/audio/quiz/stream/darksouls.mp3',
    answers: ['Dark Souls', '2', '3', '4'],
    correctIndex: 0,
  },
  {
    id: 'q18',
    text: 'О какой игре идёт речь?',
    audioSrc: '/audio/quiz/stream/sekiro.mp3',
    answers: ['Sekiro: Shadows Die Twice', '2', 'Dark Souls', 'Elden Ring'],
    correctIndex: 0,
  },
]

export function pickQuestion(excludedIds: string[] = []): QuizQuestion {
  const { questionWeights } = useQuizProgressStore.getState()
  const excluded = new Set(excludedIds)
  const available = questions.filter((question) => !excluded.has(question.id))
  const pool = available.length > 0 ? available : questions

  const minWeight = Math.min(...pool.map((question) => questionWeights[question.id] ?? 0))
  const candidates = pool.filter((question) => (questionWeights[question.id] ?? 0) === minWeight)

  return candidates[Math.floor(Math.random() * candidates.length)] ?? questions[0]
}
