import { useQuizProgressStore } from '@/features/beach-radio/model/quizStore'
import type { QuizQuestion } from './types'

export const questions: QuizQuestion[] = [
  {
    id: 'q01',
    text: 'Сколько обязательных боссов в Dark Souls (без DLC)?',
    answers: ['22', '13', '17', '8'],
    correctIndex: 1,
  },
  {
    id: 'q02',
    text: 'Сколько подарков можно подарить одному NPC за неделю в игре Stardew Valley?',
    answers: ['1', '2', '3', 'Безлимитно'],
    correctIndex: 1,
  },
  {
    id: 'q03',
    text: 'Сколько всего уникальных предметов можно выбить в игре Danganronpa 2: Goodbye Despair в МоноМоно Машине (слот машине)',
    answers: ['108', '120', '132', '156'],
    correctIndex: 0,
  },
  {
    id: 'q04',
    text: 'В игре Tetris создатель Алексей Пажитнов не получил денег за свою игру в СССР. Кто в итоге стал владельцем прав на Tetris?',
    answers: ['Microsoft', 'Nintendo', 'Sega', 'Atari'],
    correctIndex: 1,
  },
  {
    id: 'q05',
    text: 'Из какой игры OST?',
    audioSrc: '/audio/quiz/ost/raven.mp3',
    answers: ['Clair Obscur: Expedition 33', 'Diablo 4', 'Ravenswatch', 'Grim Dawn'],
    correctIndex: 2,
  },
  {
    id: 'q06',
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
    id: 'q07',
    text: 'Из какой игры OST?',
    audioSrc: '/audio/quiz/ost/hlf2.mp3',
    answers: ['Half-Life 2', 'S.T.A.L.K.E.R.: Shadow of Chernobyl', 'Deus Ex', 'BioShock'],
    correctIndex: 0,
  },
  {
    id: 'q08',
    text: 'Из какой игры OST?',
    audioSrc: '/audio/quiz/ost/linage.mp3',
    answers: ['Heroes of Might & Magic 5', 'Yes, you grace', 'Guild Wars', 'Lineage 2'],
    correctIndex: 3,
  },
  {
    id: 'q09',
    text: 'Из какой игры OST?',
    audioSrc: '/audio/quiz/ost/mor.mp3',
    answers: ['Gothic', 'The Elder Scrolls III: Morrowind', 'Dragon Age: Origins', 'Risen'],
    correctIndex: 1,
  },
  {
    id: 'q10',
    text: 'Из какой игры OST?',
    audioSrc: '/audio/quiz/ost/wog.mp3',
    answers: ['World of Goo', 'Disco Elysium', 'Deponia', 'Worms 4 Mayhem'],
    correctIndex: 0,
  },
  {
    id: 'q11',
    text: 'Какой пароль для входа к магам Воды в Gothic?',
    answers: ['Я забыл пароль!', 'Териантрох', 'Тетриданох', 'Тетриандох'],
    correctIndex: 3,
  },
  {
    id: 'q12',
    text: 'Тормоз замедлитель (8 букв)',
    answers: ['Рекордер', 'Ретардер', 'Интардер', 'Детандер'],
    correctIndex: 1,
  },
  {
    id: 'q13',
    text: 'Из какой игры отрывок стрима?',
    audioSrc: '/audio/quiz/stream/factorio.mp3',
    answers: ['Meet the Robinsons', 'The Farmer Was Replaced', 'Minecraft', 'Factorio'],
    correctIndex: 3,
  },
  {
    id: 'q14',
    text: 'Из какой игры отрывок стрима?',
    audioSrc: '/audio/quiz/stream/until.mp3',
    answers: ['Until Dawn', 'Life Is Strange', 'Mixtape', 'Silent Hill'],
    correctIndex: 0,
  },
  {
    id: 'q15',
    text: 'Из какой игры отрывок стрима?',
    audioSrc: '/audio/quiz/stream/another.mp3',
    answers: ['GTA: Vise City', 'Mixtape', 'Hades', 'Another Crab ́s Treasure'],
    correctIndex: 3,
  },
  {
    id: 'q16',
    text: 'Из какой игры отрывок стрима?',
    audioSrc: '/audio/quiz/stream/darksouls.mp3',
    answers: ['Elden Ring', 'Dark Souls: Remastered', 'Gothic 1', 'Freddi Fish 5'],
    correctIndex: 1,
  },
  {
    id: 'q17',
    text: 'Из какой игры отрывок стрима?',
    audioSrc: '/audio/quiz/stream/sekiro.mp3',
    answers: [
      'Dark Souls: Remastered',
      'Thief Simulator',
      'Sekiro: Shadows Die Twice',
      'Elden Ring',
    ],
    correctIndex: 2,
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
