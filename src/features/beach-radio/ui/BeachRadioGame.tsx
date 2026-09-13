import { audioController, type Sound } from '@/shared/lib/audio/audioController'
import { useEffect, useRef, useState } from 'react'
import {
  CircleHelp,
  Coins,
  Pause,
  Play,
  Radio as RadioIcon,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react'
import { usePawCoinStore } from '@/features/currency/model/store'
import { useInventoryStore } from '@/features/inventory/model/store'
import { syncRadioAudio, useRadioStore } from '@/features/beach-radio/model/radioStore'
import { pickQuestion } from '@/features/beach-radio/model/quiz'
import { useQuizProgressStore } from '@/features/beach-radio/model/quizStore'
import type { QuizQuestion } from '@/features/beach-radio/model/types'
import { VolumeKnob } from './VolumeKnob/VolumeKnob'
import radio from '@/shared/assets/games/beach-radio/radio.png'
import coin from '@/shared/assets/common/branding/coin.png'
import './BeachRadioGame.css'

type Props = { onComplete: () => void; onOpenRadio?: () => void; onClose?: () => void }
type DialogStep = 'seller' | 'quiz' | 'win'
const RADIO_ITEM_ID = 'beach-radio'

export function BeachRadioGame({ onComplete, onOpenRadio, onClose }: Props) {
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
      useQuizProgressStore.getState().setQuestionWeight(quizQuestion.id, 1)
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

    useQuizProgressStore.getState().setQuestionWeight(quizQuestion.id, 2)
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
      <section
        className={`beach-radio-dialog ${dialogStep === 'quiz' ? 'beach-radio-dialog--quiz' : ''}`}
        aria-live="polite"
      >
        {(dialogStep === 'seller' || dialogStep === 'win') && (
          <button
            type="button"
            className="beach-radio-quiz-close"
            onClick={onClose}
            aria-label="Закрыть радио и вернуться в локацию"
          >
            <X size={21} aria-hidden="true" />
          </button>
        )}

        {dialogStep === 'seller' && (
          <>
            <div className="beach-radio-dialog__name">Пончик, продавец</div>
            <p>
              {hasRadio
                ? 'Радио уже твоё. Но я всегда готов ещё поиграть, если хочешь! Попытка стоит всего 1 монетку.'
                : 'Привет! Хочешь забрать этот старенький радиоприёмник? Просто так не отдам — сыграем в квиз.'}
            </p>
            <div className="beach-radio-dialog__actions">
              <button
                type="button"
                className="radio-action radio-action--primary"
                onClick={startQuiz}
              >
                <Coins size={18} /> Играть за 1 <img className="coin" src={coin} alt="" />
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
                Монетки с лапкой — общая валюта нашего острова.
              </div>
            )}
          </>
        )}

        {dialogStep === 'quiz' && quizQuestion && (
          <>
            <button
              type="button"
              className="beach-radio-quiz-close"
              onClick={onClose}
              aria-label="Закрыть квиз и вернуться в локацию"
            >
              <X size={21} aria-hidden="true" />
            </button>
            <QuizPanel
              key={quizQuestion.id}
              question={quizQuestion}
              correctAnswers={correctAnswers}
              onAnswer={answer}
            />
          </>
        )}

        {dialogStep === 'win' && (
          <>
            <div className="beach-radio-dialog__name">Пончик, продавец</div>
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

function QuizPanel({
  question,
  correctAnswers,
  onAnswer,
}: {
  question: QuizQuestion
  correctAnswers: number
  onAnswer: (index: number) => void
}) {
  const audioRef = useRef<Sound | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const audioVolume = useQuizProgressStore((state) => state.audioVolume)
  const setAudioVolume = useQuizProgressStore((state) => state.setAudioVolume)

  useEffect(() => {
    if (!question.audioSrc) return
    const sound = audioController.createSound(question.audioSrc, {
      volume: useQuizProgressStore.getState().audioVolume,
    })
    audioRef.current = sound
    const audio = sound.element

    const onTimeUpdate = () => setCurrentTime(audio.currentTime)
    const onLoadedMetadata = () => setDuration(Number.isFinite(audio.duration) ? audio.duration : 0)
    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)
    const onEnded = () => {
      setIsPlaying(false)
      setCurrentTime(0)
    }

    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('loadedmetadata', onLoadedMetadata)
    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)
    audio.addEventListener('ended', onEnded)

    return () => {
      audioRef.current = null
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('loadedmetadata', onLoadedMetadata)
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
      audio.removeEventListener('ended', onEnded)
      sound.dispose()
    }
  }, [question.audioSrc])

  useEffect(() => {
    audioRef.current?.setVolume(audioVolume)
  }, [audioVolume])

  const togglePlayback = () => {
    const audio = audioRef.current

    if (!audio) return

    if (audio.element.paused) {
      void audio.play()
    } else {
      audio.pause()
    }
  }

  const seek = (value: number) => {
    const audio = audioRef.current

    if (!audio) return

    audio.element.currentTime = value
    setCurrentTime(value)
  }

  const changeVolume = (value: number) => {
    setAudioVolume(value)

    audioRef.current?.setVolume(value)
  }

  const formatTime = (value: number) => {
    if (!Number.isFinite(value)) return '0:00'

    const minutes = Math.floor(value / 60)
    const seconds = Math.floor(value % 60)
    return `${minutes}:${String(seconds).padStart(2, '0')}`
  }

  return (
    <div className="quiz-panel">
      <header className="quiz-panel__header">
        <div className="quiz-panel__title">
          <span className="quiz-panel__wheel" aria-hidden="true">
            ☸
          </span>
          <div>
            <small>Радиорубка Пончика</small>
            <strong>Пляжный квиз</strong>
          </div>
        </div>
        <div className="quiz-panel__progress" aria-label={`Верных ответов: ${correctAnswers} из 5`}>
          <small>Верных ответов: {correctAnswers} / 5</small>
          <div aria-hidden="true">
            {Array.from({ length: 5 }, (_, index) => (
              <span key={index} className={index < correctAnswers ? 'is-earned' : ''}>
                🐾
              </span>
            ))}
          </div>
        </div>
      </header>

      {(question.text || question.audioSrc) && (
        <div className="quiz-panel__question">
          <span>Вопрос {correctAnswers + 1} из 5</span>
          {question.text && <h2>{question.text}</h2>}

          {question.audioSrc && (
            <div className="quiz-audio-player">
              <button
                type="button"
                className="quiz-audio-player__play"
                onClick={togglePlayback}
                aria-label={isPlaying ? 'Поставить аудио на паузу' : 'Воспроизвести аудио'}
              >
                {isPlaying ? <Pause size={18} /> : <Play size={18} />}
              </button>

              <div className="quiz-audio-player__timeline">
                <input
                  type="range"
                  min="0"
                  max={duration || 0}
                  step="0.01"
                  value={Math.min(currentTime, duration || 0)}
                  onChange={(event) => seek(Number(event.target.value))}
                  aria-label="Позиция аудио"
                  disabled={!duration}
                />
                <div className="quiz-audio-player__time">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              <label className="quiz-audio-player__volume">
                {audioVolume === 0 ? <VolumeX size={17} /> : <Volume2 size={17} />}
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={audioVolume}
                  onChange={(event) => changeVolume(Number(event.target.value))}
                  aria-label="Громкость аудио вопроса"
                />
              </label>
            </div>
          )}
        </div>
      )}

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

  useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
        return
      }

      if (event.key === 'ArrowLeft') {
        setFrequency(Number(Math.max(87, frequency - 0.1).toFixed(1)))
      }

      if (event.key === 'ArrowRight') {
        setFrequency(Number(Math.min(108, frequency + 0.1).toFixed(1)))
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [frequency, onClose, open, setFrequency])

  if (!open) return null

  return (
    <div className="radio-modal" role="dialog" aria-modal="true" aria-label="Радиоприёмник">
      <div className="radio-modal__backdrop" />
      <div className="radio-content">
        <img className="radio-image" src={radio} alt="" />

        <button
          type="button"
          className="radio-modal__close"
          onClick={onClose}
          aria-label="Закрыть радио"
        >
          <X size={22} />
        </button>

        <input
          className="radio-frequency"
          type="range"
          min="87"
          max="108"
          step="0.1"
          value={frequency}
          onChange={(event) => setFrequency(Number(event.target.value))}
          aria-label="Настройка частоты"
        />

        <div className="radio-knob-volume">
          <VolumeKnob
            value={volume}
            onChange={setVolume}
            size={90}
            min={0}
            max={1}
            step={0.01}
            ariaLabel="Громкость радио"
          />
        </div>

        <div className="radio-knob-frequency">
          <VolumeKnob
            value={frequency}
            onChange={setFrequency}
            size={93}
            min={87.5}
            max={108}
            step={0.1}
            ariaLabel="Настройка частоты радио"
          />
        </div>

        <button
          className={`radio-power-button ${isPowered ? 'is-on' : ''}`}
          type="button"
          aria-label={isPowered ? 'Выключить радио' : 'Включить радио'}
          onClick={() => setPowered(!isPowered)}
        >
          <span className="power-icon"></span>
        </button>
      </div>
    </div>
  )
}
