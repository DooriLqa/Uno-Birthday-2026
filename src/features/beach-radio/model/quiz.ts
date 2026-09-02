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
    text: 'В Hades 2 последний босс нижнего мира Хроносс в раннем доступе игры имел уникальнуюмеханику: Если игрок ставил паузу в битве с ним, он произносил ехидную реплику и принудительно снимал её. Что сделали разработчики в релизной версии?',
    answers: [
      'Оставили эту механику какой и была',
      'Теперь Хронос ехидничает и возвращает на начало битвы (диалога с ним)',
      'Теперь он ходит во время паузы и ворчит',
      'Теперь он даёт минуту песчаных часов и потом снимает паузу',
    ],
    correctIndex: 2,
  },
  // { id: 'q10', text: 'Какой предмет помогает защитить глаза от яркого солнца?', answers: ['Солнцезащитные очки', 'Вилка', 'Шарф', 'Ковш'], correctIndex: 0 },
  // { id: 'q11', text: 'Как называется место, где продают товары?', answers: ['Ларёк', 'Маяк', 'Риф', 'Причал'], correctIndex: 0 },
  // { id: 'q12', text: 'Сколько пальцев на одной руке?', answers: ['3', '4', '5', '6'], correctIndex: 2 },
  // { id: 'q13', text: 'Что из этого умеет плавать?', answers: ['Лодка', 'Кресло', 'Кастрюля', 'Лампа'], correctIndex: 0 },
  // { id: 'q14', text: 'Как называется звук моря?', answers: ['Шум волн', 'Звон будильника', 'Треск льда', 'Гул мотора'], correctIndex: 0 },
  // { id: 'q15', text: 'Какой предмет нужен, чтобы регулировать громкость?', answers: ['Регулятор', 'Компас', 'Линейка', 'Лупа'], correctIndex: 0 },
  // { id: 'q16', text: 'Что из этого является радиочастотой?', answers: ['98.7 MHz', '98.7 kg', '98.7 °C', '98.7 cm'], correctIndex: 0 },
  // { id: 'q17', text: 'Как называется домашнее животное, которое говорит «гав»?', answers: ['Собака', 'Кошка', 'Попугай', 'Хомяк'], correctIndex: 0 },
  // { id: 'q18', text: 'Что лучше всего подходит для пляжного дня?', answers: ['Полотенце', 'Снегоочиститель', 'Ёлочная гирлянда', 'Лопата для снега'], correctIndex: 0 },
  // { id: 'q19', text: 'Какой напиток чаще всего подают с трубочкой на пляже?', answers: ['Тропический коктейль', 'Горячий борщ', 'Эспрессо', 'Какао'], correctIndex: 0 },
  // { id: 'q20', text: 'Какой символ мы выбрали для общей валюты?', answers: [':feet:', ':lemon:', ':star:', ':shell:'], correctIndex: 0 },
]

export function pickQuestion(excludedIds: string[] = []): QuizQuestion {
  const state = useQuizProgressStore.getState()
  const available = (pool: QuizQuestion[]) => {
    const filtered = pool.filter((question) => !excludedIds.includes(question.id))
    return filtered.length > 0 ? filtered : pool
  }
  const unasked = available(
    questions.filter((question) => !state.seenQuestionIds.includes(question.id)),
  )
  const notSolved = available(
    questions.filter(
      (question) =>
        state.seenQuestionIds.includes(question.id) &&
        !state.correctQuestionIds.includes(question.id),
    ),
  )
  const correct = available(
    questions.filter((question) => state.correctQuestionIds.includes(question.id)),
  )
  const pool = unasked.length > 0 ? unasked : notSolved.length > 0 ? notSolved : correct
  const question = pool[Math.floor(Math.random() * pool.length)] ?? questions[0]
  state.markSeen(question.id)
  return question
}
