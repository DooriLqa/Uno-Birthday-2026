import { useEffect, useMemo, useRef, useState } from 'react'
import './FindAPair.css'

import { usePawCoinStore } from '@/features/currency/model/store'
import cardBack from '@/shared/assets/find-a-pair/cards/рубашка.png'
import { playCardSound } from '@/features/find-a-pair/model/sound'

type Card = {
  id: string
  rank: number
  image: string
}

type BoardCard = Card & {
  revealed: boolean
  matched: boolean
}

export type FindAPairProps = {
  onComplete: () => void
}

const TIME_LIMIT = 30
const BOARD_COLUMNS = 4
const BOARD_ROWS = 4
const TOTAL_CARDS = BOARD_COLUMNS * BOARD_ROWS
const TOTAL_PAIRS = TOTAL_CARDS / 2

const CARD_IMAGES = import.meta.glob(
  '/src/shared/assets/find-a-pair/cards/*.{png,jpg,jpeg,webp}',
  {
    eager: true,
    import: 'default',
    query: '?url',
  },
) as Record<string, string>

function getCardFiles() {
  return Object.entries(CARD_IMAGES)
    .map(([path, image]) => {
      const match = path.match(
        /(?:^|\/)([^/]+)_(1|2|3|4|5|6|7|8)\.(png|jpg|jpeg|webp)$/i,
      )

      if (!match) {
        return null
      }

      return {
        path,
        image,
        rank: Number(match[2]),
      }
    })
    .filter(
      (item): item is {
        path: string
        image: string
        rank: number
      } => item !== null,
    )
}

function createBoard(): BoardCard[] {
  const files = getCardFiles()

  // У нас 32 уникальные карты: 8 значений × 4 масти.
  // Для поля 4×4 выбираем 8 уникальных комбинаций «масть + значение»
  // и создаём по две копии каждой комбинации.
  const selectedCards = [...files]
    .sort(() => Math.random() - 0.5)
    .slice(0, TOTAL_PAIRS)

  if (selectedCards.length < TOTAL_PAIRS) {
    throw new Error(
      `Для Find a Pair нужно минимум ${TOTAL_PAIRS} уникальных карт для создания ${TOTAL_PAIRS} пар.`,
    )
  }

  const cards = selectedCards.flatMap((file, index) =>
    Array.from({ length: 2 }, (_, copyIndex) => ({
      id: `${file.path}-${index}-${copyIndex}-${Math.random()}`,
      rank: file.rank,
      image: file.image,
      revealed: false,
      matched: false,
    })),
  )

  if (cards.length !== TOTAL_CARDS) {
    throw new Error(
      `Для Find a Pair нужно ${TOTAL_CARDS} изображений карт, найдено ${cards.length}.`,
    )
  }

  return cards.sort(() => Math.random() - 0.5)
}

export function FindAPair({ onComplete }: FindAPairProps) {
  // Карты создаются сразу при открытии игры.
  const addPawCoins = usePawCoinStore((state) => state.addPawCoins)
  const [cards, setCards] = useState<BoardCard[]>(() => createBoard())
  const [selected, setSelected] = useState<string[]>([])
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT)
  const [started, setStarted] = useState(false)
  const [finished, setFinished] = useState(false)
  const [result, setResult] = useState<'win' | null>(null)
  const [showTimeOut, setShowTimeOut] = useState(false)

  const viewportRef = useRef<HTMLDivElement>(null)
  const gameRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const viewport = viewportRef.current
    const game = gameRef.current

    if (!viewport || !game) return

    const updateScale = () => {
      const availableWidth = viewport.clientWidth - 16
      const availableHeight = viewport.clientHeight - 16
      const designWidth = game.offsetWidth
      const designHeight = game.offsetHeight

      if (availableWidth <= 0 || availableHeight <= 0 || designWidth <= 0 || designHeight <= 0) return

      const scale = Math.min(1.2, availableWidth / designWidth, availableHeight / designHeight)
      game.style.setProperty('--find-a-pair-scale', String(Math.max(scale, 0.1)))
    }

    const frame = window.requestAnimationFrame(updateScale)
    const observer = new ResizeObserver(updateScale)
    observer.observe(viewport)
    observer.observe(game)
    window.addEventListener('resize', updateScale)

    return () => {
      window.cancelAnimationFrame(frame)
      observer.disconnect()
      window.removeEventListener('resize', updateScale)
    }
  }, [result, started, showTimeOut])

  const matchedPairs = useMemo(
    () => cards.filter((card) => card.matched).length / 2,
    [cards],
  )

  const startGame = () => {
    setCards(createBoard())
    setSelected([])
    setTimeLeft(TIME_LIMIT)
    setStarted(true)
    setFinished(false)
    setResult(null)
    setShowTimeOut(false)
  }

  useEffect(() => {
    if (!started || finished) {
      return
    }

    const timer = window.setInterval(() => {
      setTimeLeft((current) => {
        if (current <= 1) {
          window.clearInterval(timer)
          setStarted(false)
          setFinished(true)
          setShowTimeOut(true)
          window.setTimeout(() => setShowTimeOut(false), 2000)
          return 0
        }

        return current - 1
      })
    }, 1000)

    return () => window.clearInterval(timer)
  }, [started, finished])

  useEffect(() => {
    if (!started || selected.length !== 2) {
      return
    }

    const [firstId, secondId] = selected
    const first = cards.find((card) => card.id === firstId)
    const second = cards.find((card) => card.id === secondId)

    if (!first || !second) {
      return
    }

    const isPair = first.rank === second.rank && first.image === second.image

    const timeout = window.setTimeout(
      () => {
        if (isPair) {
          setCards((current) =>
            current.map((card) =>
              card.id === firstId || card.id === secondId
                ? { ...card, matched: true, revealed: true }
                : card,
            ),
          )
        } else {
          setCards((current) =>
            current.map((card) =>
              card.id === firstId || card.id === secondId
                ? { ...card, revealed: false }
                : card,
            ),
          )
        }

        setSelected([])
      },
      isPair ? 250 : 750,
    )

    return () => window.clearTimeout(timeout)
  }, [selected, cards, started])

  useEffect(() => {
    if (!started || cards.length === 0) {
      return
    }

    const allMatched = cards.every((card) => card.matched)

    if (allMatched) {
      setStarted(false)
      setFinished(true)
      setResult('win')
      addPawCoins(1)
      onComplete()
    }
  }, [cards, started, onComplete])

  const handleCardClick = (id: string) => {
    if (!started || finished || selected.length >= 2) {
      return
    }

    const card = cards.find((item) => item.id === id)

    if (!card || card.revealed || card.matched) {
      return
    }

    playCardSound()

    setCards((current) =>
      current.map((item) =>
        item.id === id ? { ...item, revealed: true } : item,
      ),
    )

    setSelected((current) => [...current, id])
  }

  return (
    <div ref={viewportRef} className="find-a-pair">
      <div ref={gameRef} className="find-a-pair__game">
        <div className="find-a-pair__hud">
          <div className="find-a-pair__timer">
            <span>Время</span>
            <strong>{timeLeft} сек</strong>
          </div>

          {!started && (
            <button
              className="find-a-pair__start"
              type="button"
              onClick={startGame}
            >
              {result ? 'Играть ещё раз' : 'Начать игру'}
            </button>
          )}

          {started && <div className="find-a-pair__start-spacer" />}

          <div className="find-a-pair__pairs">
            <span>Пары</span>
            <strong>
              {matchedPairs}/{TOTAL_PAIRS}
            </strong>
          </div>
        </div>

        <div className="find-a-pair__board-wrapper">
          <div className="find-a-pair__board" aria-label="Игровое поле 4 на 4">
            {cards.map((card) => {
              const isOpen = card.revealed || card.matched

              return (
                <button
                  key={card.id}
                  className={`find-a-pair__card ${isOpen ? 'find-a-pair__card--open' : ''
                    } ${card.matched ? 'find-a-pair__card--matched' : ''}`}
                  type="button"
                  onClick={() => handleCardClick(card.id)}
                  disabled={!started || card.revealed || card.matched}
                  aria-label={isOpen ? `Карта ${card.rank}` : 'Закрытая карта'}
                >
                  {isOpen ? (
                    <img src={card.image} alt={`Карта ${card.rank}`} draggable={false} />
                  ) : (
                    <img
                      className="find-a-pair__back-image"
                      src={cardBack}
                      alt=""
                      draggable="false"
                    />
                  )}
                </button>
              )
            })}
          </div>

          {result === 'win' && (
            <div
              className="find-a-pair__win-overlay"
              role="status"
              aria-live="polite"
            >
              Все пары найдены! 🎉
            </div>
          )}

          {showTimeOut && (
            <div
              className="find-a-pair__timeout"
              role="status"
              aria-live="assertive"
            >
              Время вышло!
            </div>
          )}
        </div>
      </div>
    </div>
  )
}