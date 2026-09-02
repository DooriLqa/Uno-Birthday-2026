import { useEffect, useRef, useState } from 'react'
import { CircleHelp, Coins, Power, Radio as RadioIcon, Volume2, X } from 'lucide-react'
import { usePawCoinStore } from '@/features/currency/model/store'
import { useInventoryStore } from '@/features/inventory/model/store'
import { syncRadioAudio, useRadioStore } from '@/features/beach-radio/model/radioStore'
import { pickQuestion } from '@/features/beach-radio/model/quiz'
import { useQuizProgressStore } from '@/features/beach-radio/model/quizStore'
import type { QuizQuestion } from '@/features/beach-radio/model/types'
import './BeachRadioGame.css'

type Props = { onComplete: () => void; onOpenRadio?: () => void }
type DialogStep = 'seller' | 'quiz' | 'win'
const RADIO_ITEM_ID = 'beach-radio'

export function BeachRadioGame({ onComplete, onOpenRadio }: Props) {
  // const pawCoins = usePawCoinStore((state) => state.pawCoins)
  const spendPawCoins = usePawCoinStore((state) => state.spendPawCoins)
  const inventory = useInventoryStore((state) => state.items)
  const addItem = useInventoryStore((state) => state.addItem)
  const hasRadio = inventory.some((item) => item.id === RADIO_ITEM_ID)
  const [dialogStep, setDialogStep] = useState<DialogStep>('seller')
  const [quizQuestion, setQuizQuestion] = useState<QuizQuestion | null>(null)
  const [correctAnswers, setCorrectAnswers] = useState(0)
  const [quizError, setQuizError] = useState('')
  const [showDevHint, setShowDevHint] = useState(false)
  const runQuestionIds = useRef<string[]>([])

  const openRadio = () => {
    onOpenRadio?.()
    syncRadioAudio()
  }

  const startQuiz = () => {
    if (!spendPawCoins(1)) {
      setQuizError('Нужна 1 монетка с лапкой. Попроси разработчика пополнить запас.')
      return
    }
    setQuizError('')
    setCorrectAnswers(0)
    runQuestionIds.current = []
    const firstQuestion = pickQuestion()
    runQuestionIds.current = [firstQuestion.id]
    setQuizQuestion(firstQuestion)
    setDialogStep('quiz')
  }

  const answer = (answerIndex: number) => {
    if (!quizQuestion) return
    const isCorrect = answerIndex === quizQuestion.correctIndex

    if (!isCorrect) {
      setCorrectAnswers(0)
      setQuizQuestion(null)
      setDialogStep('seller')
      setQuizError(
        hasRadio
          ? 'Не угадал! Попробуем ещё раз?'
          : 'Не угадал! Попробуем ещё раз? Для новой попытки нужна 1 монетка.',
      )
      return
    }

    useQuizProgressStore.getState().markCorrect(quizQuestion.id)
    const nextCorrectAnswers = correctAnswers + 1
    setCorrectAnswers(nextCorrectAnswers)
    setQuizError('')

    if (nextCorrectAnswers >= 5) {
      setQuizQuestion(null)
      setDialogStep('win')
      if (!hasRadio) {
        addItem({ id: RADIO_ITEM_ID, name: 'Радиоприёмник', icon: '📻' })
        onComplete()
      }
      return
    }

    const nextQuestion = pickQuestion(runQuestionIds.current)
    runQuestionIds.current = [...runQuestionIds.current, nextQuestion.id]
    setQuizQuestion(nextQuestion)
  }

  return (
    <div className="beach-radio-game">
      <div className="beach-radio-game__scene" aria-label="Пляжный ларёк с собакой-продавцом">
        <div className="beach-radio-game__kiosk" aria-label="Пляжный ларёк Бони">
          <div className="beach-radio-game__awning">БОНЯ • ПЛЯЖНЫЙ ЛАРЁК</div>
          <div className="beach-radio-game__shelf beach-radio-game__shelf--top">
            {!hasRadio && <div className="kiosk-product kiosk-product--radio">📻</div>}
            <div className="kiosk-product">🍹</div>
            <div className="kiosk-product">🥥</div>
            <div className="kiosk-product">🍸</div>
            <div className="kiosk-product">🍍</div>
          </div>
          <div className="beach-radio-game__menu">
            <span>МЕНЮ</span>
            <strong>Кокосовый бриз</strong>
            <strong>Манго-сёрф</strong>
            <strong>Ананасовый закат</strong>
          </div>
          <DogSeller />
          <div className="beach-radio-game__counter" />
        </div>
      </div>

      <section
        className={`beach-radio-dialog ${dialogStep === 'quiz' ? 'beach-radio-dialog--quiz' : ''}`}
        aria-live="polite"
      >
        {dialogStep === 'seller' && (
          <>
            <div className="beach-radio-dialog__name">Боня, продавец</div>
            <p>
              {hasRadio
                ? 'Радио уже твоё. Но я всегда готов ещё поиграть, если хочешь! Попытка стоит всего 1 🐾.'
                : 'Привет! Хочешь забрать этот старенький радиоприёмник? Просто так не отдам — сыграем в квиз.'}
            </p>
            <div className="beach-radio-dialog__actions">
              <button
                type="button"
                className="radio-action radio-action--primary"
                onClick={startQuiz}
              >
                <Coins size={18} /> Играть за 1 🐾
              </button>
              {hasRadio && (
                <button type="button" className="radio-action" onClick={openRadio}>
                  <RadioIcon size={18} /> Открыть радио
                </button>
              )}
              {!hasRadio && (
                <button
                  type="button"
                  className="radio-action"
                  onClick={() => setShowDevHint((value) => !value)}
                >
                  <CircleHelp size={18} /> Что за монетки?
                </button>
              )}
            </div>
            {quizError && <div className="beach-radio-dialog__error">{quizError}</div>}
            {showDevHint && (
              <div className="beach-radio-dialog__hint">
                Монетки с лапкой — общая валюта для будущих мини-игр.
              </div>
            )}
          </>
        )}

        {dialogStep === 'quiz' && quizQuestion && (
          <QuizPanel question={quizQuestion} onAnswer={answer} />
        )}

        {dialogStep === 'win' && (
          <>
            <div className="beach-radio-dialog__name">Боня, продавец</div>
            <p>
              {hasRadio
                ? 'Хорош! Сыграем ещё раз когда-нибудь? А радио можешь слушать сколько захочешь.'
                : 'Ух ты! Отлично справился. Сделка есть сделка — держи радиоприёмник!'}
            </p>
            <div className="beach-radio-dialog__actions">
              <button
                type="button"
                className="radio-action radio-action--primary"
                onClick={openRadio}
              >
                <RadioIcon size={18} /> Открыть радио
              </button>
              <button
                type="button"
                className="radio-action"
                onClick={() => setDialogStep('seller')}
              >
                <Coins size={18} /> Сыграть ещё раз
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  )
}

function DogSeller() {
  return (
    <div className="dog-seller" aria-hidden>
      <div className="dog-seller__shadow" />
      <div className="dog-seller__body">
        <div className="dog-seller__apron">BONYA</div>
      </div>
      <div className="dog-seller__head">
        <span className="dog-seller__ear dog-seller__ear--left" />
        <span className="dog-seller__ear dog-seller__ear--right" />
        <span className="dog-seller__eye dog-seller__eye--left" />
        <span className="dog-seller__eye dog-seller__eye--right" />
        <span className="dog-seller__muzzle" />
        <span className="dog-seller__nose" />
        <span className="dog-seller__mouth" />
        <span className="dog-seller__hat">☀</span>
      </div>
    </div>
  )
}

function QuizPanel({
  question,
  onAnswer,
}: {
  question: QuizQuestion
  onAnswer: (index: number) => void
}) {
  return (
    <div className="quiz-panel">
      <div className="quiz-panel__question">
        <span>Вопрос</span>
        <h2>{question.text}</h2>
      </div>
      <div className="quiz-panel__answers">
        {question.answers.map((option, index) => (
          <button key={option} type="button" onClick={() => onAnswer(index)}>
            <span>{String.fromCharCode(65 + index)}</span>
            {option}
          </button>
        ))}
      </div>
    </div>
  )
}

export function RadioModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { isPowered, volume, frequency, setPowered, setVolume, setFrequency } = useRadioStore()
  const [localFrequency, setLocalFrequency] = useState(frequency)

  useEffect(() => {
    if (open && localFrequency !== frequency) {
      setFrequency(localFrequency)
    }
  }, [localFrequency, open, frequency, setFrequency])

  useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
        return
      }

      if (event.key === 'ArrowLeft') {
        setLocalFrequency((value) => Math.max(87, Number((value - 0.1).toFixed(1))))
      }

      if (event.key === 'ArrowRight') {
        setLocalFrequency((value) => Math.min(108, Number((value + 0.1).toFixed(1))))
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose, open])

  const prevOpenRef = useRef(open)
  useEffect(() => {
    if (open && !prevOpenRef.current) {
      setLocalFrequency(frequency)
    }
    prevOpenRef.current = open
  }, [open, frequency])

  if (!open) return null

  return (
    <div className="radio-modal" role="dialog" aria-modal="true" aria-label="Радиоприёмник">
      <div className="radio-modal__backdrop" />
      <div className="radio-modal__content">
        <button
          type="button"
          className="radio-modal__close"
          onClick={onClose}
          aria-label="Закрыть радио"
        >
          <X size={22} />
        </button>
        <div className="radio-device">
          <div className="radio-device__antenna" />
          <div className="radio-device__handle" />
          <div className="radio-device__brand">
            BEACH
            <br />
            WAVES
          </div>
          <div className="radio-device__screen">
            <span>FM</span>
            <strong>{localFrequency.toFixed(1)}</strong>
            <small>MHz</small>
          </div>
          <div className="radio-device__speaker">
            {Array.from({ length: 35 }, (_, index) => (
              <i key={index} />
            ))}
          </div>
          <div className="radio-device__tuning">
            <div className="radio-device__tuning-labels">
              <span>87</span>
              <span>FM</span>
              <span>108</span>
            </div>
            <input
              className="radio-device__frequency-range"
              type="range"
              min="87"
              max="108"
              step="0.1"
              value={localFrequency}
              onChange={(event) => setLocalFrequency(Number(event.target.value))}
              aria-label="Настройка частоты"
            />
            <div className="radio-device__frequency-markers">
              <span>88</span>
              <span>92</span>
              <span>96</span>
              <span>100</span>
              <span>104</span>
              <span>108</span>
            </div>
          </div>
          <div className="radio-device__controls">
            <button
              type="button"
              className={`radio-device__power ${isPowered ? 'is-on' : ''}`}
              onClick={() => setPowered(!isPowered)}
              aria-label={isPowered ? 'Выключить радио' : 'Включить радио'}
            >
              <Power size={22} />
            </button>
            <label className="radio-device__volume">
              <Volume2 size={18} />
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(event) => setVolume(Number(event.target.value))}
                aria-label="Громкость радио"
              />
            </label>
            <span className={`radio-device__status ${isPowered ? 'is-on' : ''}`}>
              {isPowered ? 'ON AIR' : 'OFF'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
