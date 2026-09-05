import { useEffect, useMemo, useState } from 'react'
import './FindAPair.css'

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
  onWin: () => void
  onLoss: () => void
}

const TIME_LIMIT = 30
const BOARD_COLUMNS = 6
const BOARD_ROWS = 4
const TOTAL_CARDS = BOARD_COLUMNS * BOARD_ROWS
const TOTAL_PAIRS = TOTAL_CARDS / 2
const RANKS = Array.from({ length: 9 }, (_, index) => index + 6)

const CARD_IMAGES = import.meta.glob(
  '/src/assets/cards/*.{png,jpg,jpeg,webp}',
  {
    eager: true,
    import: 'default',
    query: '?url',
  },
) as Record<string, string>

function getCardFiles() {
  return Object.entries(CARD_IMAGES)
    .map(([path, image]) => {
      const match = path.match(/(?:^|\/)([^/]+)_(6|7|8|9|10|11|12|13|14)\.(png|jpg|jpeg|webp)$/i)

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
      (
        item,
      ): item is { path: string; image: string; rank: number } =>
        item !== null,
    )
}

function createBoard(): BoardCard[] {
  const files = getCardFiles()

  const availableRanks = RANKS.filter(
    (rank) => files.filter((file) => file.rank === rank).length >= 4,
  )

  if (availableRanks.length < TOTAL_PAIRS / 2) {
    throw new Error(
      `Для Find a Pair нужно минимум ${TOTAL_PAIRS / 2} значений карт с четырьмя мастями.`,
    )
  }

  const selectedRanks = [...availableRanks]
    .sort(() => Math.random() - 0.5)
    .slice(0, TOTAL_PAIRS / 2)

  const cards = selectedRanks.flatMap((rank) =>
    files
      .filter((file) => file.rank === rank)
      .slice(0, 4)
      .map((file, index) => ({
        id: `${rank}-${index}-${Math.random()}`,
        rank,
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

export function FindAPair({ onWin, onLoss }: FindAPairProps) {
  const [cards, setCards] = useState<BoardCard[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT)
  const [started, setStarted] = useState(false)
  const [finished, setFinished] = useState(false)
  const [result, setResult] = useState<'win' | 'lose' | null>(null)

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
          setResult('lose')
          onLoss()
          return 0
        }

        return current - 1
      })
    }, 1000)

    return () => window.clearInterval(timer)
  }, [started, finished, onLoss])

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

    const isPair = first.rank === second.rank

    const timeout = window.setTimeout(() => {
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
    }, isPair ? 250 : 750)

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
      onWin()
    }
  }, [cards, started, onWin])

  const handleCardClick = (id: string) => {
    if (!started || finished || selected.length >= 2) {
      return
    }

    const card = cards.find((item) => item.id === id)

    if (!card || card.revealed || card.matched) {
      return
    }

    setCards((current) =>
      current.map((item) =>
        item.id === id ? { ...item, revealed: true } : item,
      ),
    )
    setSelected((current) => [...current, id])
  }

  return (
    <div className="find-a-pair">
      <div className="find-a-pair__hud">
        <div className="find-a-pair__timer">
          <span>Время</span>
          <strong>{timeLeft} сек</strong>
        </div>

        <div className="find-a-pair__pairs">
          <span>Пары</span>
          <strong>{matchedPairs}/{TOTAL_PAIRS}</strong>
        </div>
      </div>

      {result === 'win' && (
        <p className="find-a-pair__result find-a-pair__result--win">
          Все пары найдены! 🎉
        </p>
      )}

      {result === 'lose' && (
        <p className="find-a-pair__result find-a-pair__result--lose">
          Время вышло!
        </p>
      )}

      {!started && (
        <button
          className="find-a-pair__start"
          type="button"
          onClick={startGame}
        >
          {result ? 'Играть ещё раз' : 'Начать игру'}
        </button>
      )}

      <div className="find-a-pair__board" aria-label="Игровое поле 6 на 6">
        {cards.map((card) => {
          const isOpen = card.revealed || card.matched

          return (
            <button
              key={card.id}
              className={`find-a-pair__card ${
                isOpen ? 'find-a-pair__card--open' : ''
              } ${card.matched ? 'find-a-pair__card--matched' : ''}`}
              type="button"
              onClick={() => handleCardClick(card.id)}
              disabled={!started || card.revealed || card.matched}
              aria-label={isOpen ? `Карта ${card.rank}` : 'Закрытая карта'}
            >
              {isOpen ? (
                <img src={card.image} alt={`Карта ${card.rank}`} />
              ) : (
                <span className="find-a-pair__back">?</span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
