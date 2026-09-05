import { useEffect, useRef, useState } from 'react'
import { usePawCoinStore } from '@/features/currency/model/store'
import './FruitBasketGame.css'

type Props = { onComplete: () => void }
type FallingItem = {
  id: number
  x: number
  y: number
  kind: 'good' | 'bad'
  emoji: string
  speed: number
}

type GameState = {
  basketX: number
  items: FallingItem[]
  score: number
  basketLoad: number
  deliveryProgress: number
  lives: number
  gameOver: boolean
  won: boolean
}

const TARGET_SCORE = 20
const MAX_LIVES = 5
const BASKET_WIDTH = 15
const MAX_BASKET_LOAD = 5
const DROP_ZONE_WIDTH = 16
const DROP_DURATION = 1000
const BASKET_SPEED = 1.7
const MAX_BASKET_SPEED = 3.6
const BASKET_ACCELERATION = 0.06
const ITEM_SPAWN_INTERVAL = 1200
const STARTUP_ITEM_SPAWN_INTERVAL = ITEM_SPAWN_INTERVAL * 2
const STARTUP_SPAWN_COUNT = 3
const FULL_BASKET_SPAWN_INTERVAL = ITEM_SPAWN_INTERVAL * 4
const GOOD_ITEMS = ['💎', '💍', '👑', '📱', '💻', '🎧', '📷', '⌚']
const BAD_ITEMS = ['⛓️', '👮‍♂️']

const initialState: GameState = {
  basketX: 50,
  items: [],
  score: 0,
  basketLoad: 0,
  deliveryProgress: 0,
  lives: MAX_LIVES,
  gameOver: false,
  won: false,
}

function isAtDropZone(game: GameState, side: 'left' | 'right') {
  return side === 'left' ? game.basketX <= DROP_ZONE_WIDTH : game.basketX >= 100 - DROP_ZONE_WIDTH
}

function basketDropZoneClass(game: GameState, side: 'left' | 'right') {
  if (!isAtDropZone(game, side) || game.basketLoad === 0) return ''
  return game.deliveryProgress > 0 ? 'is-charging' : 'is-ready'
}

function dropProgressPercent(game: GameState, side: 'left' | 'right') {
  return isAtDropZone(game, side) ? (game.deliveryProgress / DROP_DURATION) * 100 : 0
}

export function FruitBasketGame({ onComplete }: Props) {
  const [game, setGame] = useState(initialState)
  const addPawCoins = usePawCoinStore((state) => state.addPawCoins)
  const gameRef = useRef(game)
  const completeRef = useRef(onComplete)
  const addPawCoinsRef = useRef(addPawCoins)
  const nextId = useRef(0)
  const controlsRef = useRef({ left: false, right: false })
  const basketSpeedRef = useRef(BASKET_SPEED)
  const lastDirectionRef = useRef(0)
  const startupSpawnCountRef = useRef(0)

  useEffect(() => {
    gameRef.current = game
  }, [game])

  useEffect(() => {
    completeRef.current = onComplete
  }, [onComplete])

  useEffect(() => {
    addPawCoinsRef.current = addPawCoins
  }, [addPawCoins])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a' || event.key.toLowerCase() === 'ф') {
        event.preventDefault()
        controlsRef.current.left = true
      }
      if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd' || event.key.toLowerCase() === 'в') {
        event.preventDefault()
        controlsRef.current.right = true
      }
    }
    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a' || event.key.toLowerCase() === 'ф') controlsRef.current.left = false
      if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd' || event.key.toLowerCase() === 'в') controlsRef.current.right = false
    }
    const releaseControls = () => {
      controlsRef.current.left = false
      controlsRef.current.right = false
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('blur', releaseControls)
    window.addEventListener('pointerup', releaseControls)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('blur', releaseControls)
      window.removeEventListener('pointerup', releaseControls)
    }
  }, [])

  useEffect(() => {
    let spawnTimer: number
    const spawnItem = () => {
      const current = gameRef.current
      if (!current.gameOver && !current.won) {
        const isGood = Math.random() > 0.28
        const item: FallingItem = {
          id: nextId.current++,
          x: 8 + Math.random() * 84,
          y: -8,
          kind: isGood ? 'good' : 'bad',
          emoji: isGood
            ? GOOD_ITEMS[Math.floor(Math.random() * GOOD_ITEMS.length)]
            : BAD_ITEMS[Math.floor(Math.random() * BAD_ITEMS.length)],
          speed: 0.7 + Math.random() * 0.35,
        }
        setGame((state) => ({ ...state, items: [...state.items, item] }))
        startupSpawnCountRef.current += 1
      }
      const isStartup = startupSpawnCountRef.current < STARTUP_SPAWN_COUNT
      const delay = isStartup
        ? STARTUP_ITEM_SPAWN_INTERVAL
        : current.basketLoad >= (MAX_BASKET_LOAD / 2) + 1
        ? FULL_BASKET_SPAWN_INTERVAL
        : ITEM_SPAWN_INTERVAL
      spawnTimer = window.setTimeout(spawnItem, delay)
    }
    spawnTimer = window.setTimeout(spawnItem, STARTUP_ITEM_SPAWN_INTERVAL)

    const frameTimer = window.setInterval(() => {
      setGame((current) => {
        if (current.gameOver || current.won) return current

        const direction = Number(controlsRef.current.right) - Number(controlsRef.current.left)
        if (direction === 0 || direction !== lastDirectionRef.current) {
          basketSpeedRef.current = BASKET_SPEED
        } else {
          basketSpeedRef.current = Math.min(MAX_BASKET_SPEED, basketSpeedRef.current + BASKET_ACCELERATION)
        }
        lastDirectionRef.current = direction
        const basketX = Math.max(8, Math.min(92, current.basketX + direction * basketSpeedRef.current))
        let score = current.score
        let basketLoad = current.basketLoad
        const atDropZone = basketX <= DROP_ZONE_WIDTH || basketX >= 100 - DROP_ZONE_WIDTH
        const deliveryProgress = atDropZone && basketLoad > 0
          ? current.deliveryProgress + 32
          : 0
        let lives = current.lives
        const remainingItems: FallingItem[] = []
        current.items.forEach((item) => {
          const nextY = item.y + item.speed
          const reachesBasket = nextY >= 78
          const inBasket = Math.abs(item.x - basketX) <= BASKET_WIDTH / 2

          if (reachesBasket) {
            if (inBasket) {
              if (item.kind === 'good' && basketLoad < MAX_BASKET_LOAD) basketLoad += 1
              else lives -= 1
            } else if (item.kind === 'good') {
              lives -= 1
            }
          } else {
            remainingItems.push({ ...item, y: nextY })
          }
        })

        if (deliveryProgress >= DROP_DURATION) {
          score += basketLoad
          basketLoad = 0
        }
        const won = score >= TARGET_SCORE
        const gameOver = lives <= 0
        if (won) {
          addPawCoinsRef.current(1)
          completeRef.current()
        }
        return {
          ...current,
          basketX,
          items: remainingItems,
          score,
          basketLoad,
          deliveryProgress: basketLoad === 0 ? 0 : Math.min(deliveryProgress, DROP_DURATION),
          lives: Math.max(0, lives),
          gameOver,
          won,
        }
      })
    }, 32)

    return () => {
      window.clearTimeout(spawnTimer)
      window.clearInterval(frameTimer)
    }
  }, [])

  const restart = () => {
    controlsRef.current.left = false
    controlsRef.current.right = false
    basketSpeedRef.current = BASKET_SPEED
    lastDirectionRef.current = 0
    startupSpawnCountRef.current = 0
    setGame(initialState)
    gameRef.current = initialState
  }

  return (
    <div className="fruit-basket-game">
      <div className="fruit-basket-game__skyline" aria-hidden="true">
        <span>☁️</span>
        <span>☁️</span>
      </div>
      <header className="fruit-basket-game__header">
        <div>
          <p className="fruit-basket-game__eyebrow">Операция «Ценная находка»</p>
          <h1>Корзинка удачи</h1>
          <p>Лови драгоценности и технику, затем отнеси их в зону сдачи. Наручники пропускай.</p>
        </div>
        <div className="fruit-basket-game__score" aria-label={`Сдано ${game.score} из ${TARGET_SCORE}`}>
          <strong>{String(game.score).padStart(2, '0')}</strong>
          <span>/ {TARGET_SCORE}</span>
        </div>
      </header>

      <div className="fruit-basket-game__status">
        <span>В корзине {game.basketLoad}/{MAX_BASKET_LOAD}</span>
        <span>Жизни</span>
        <span className="fruit-basket-game__hearts" aria-label={`${game.lives} из ${MAX_LIVES} жизней`}>
          {'♥'.repeat(game.lives)}<span className="fruit-basket-game__empty-hearts">{'♡'.repeat(MAX_LIVES - game.lives)}</span>
        </span>
      </div>

      <div className="fruit-basket-game__field" aria-label="Игровое поле">
        <div className={`fruit-basket-game__drop-zone fruit-basket-game__drop-zone--left ${basketDropZoneClass(game, 'left')}`}>
          <strong>СДАТЬ</strong>
          <span>←</span>
          <i style={{ height: `${dropProgressPercent(game, 'left')}%` }} />
        </div>
        <div className={`fruit-basket-game__drop-zone fruit-basket-game__drop-zone--right ${basketDropZoneClass(game, 'right')}`}>
          <strong>СДАТЬ</strong>
          <span>→</span>
          <i style={{ height: `${dropProgressPercent(game, 'right')}%` }} />
        </div>
        <div className="fruit-basket-game__sun" aria-hidden="true">☀</div>
        <div className="fruit-basket-game__cloud cloud-one" aria-hidden="true">☁</div>
        <div className="fruit-basket-game__cloud cloud-two" aria-hidden="true">☁</div>
        {game.items.map((item) => (
          <span
            key={item.id}
            className={`fruit-basket-game__item fruit-basket-game__item--${item.kind}`}
            style={{ left: `${item.x}%`, top: `${item.y}%` }}
            aria-hidden="true"
          >
            {item.emoji}
          </span>
        ))}
        <div
          className={`fruit-basket-game__basket ${game.basketLoad >= MAX_BASKET_LOAD ? 'is-full' : ''}`}
          style={{ left: `${game.basketX}%` }}
          aria-hidden="true"
        >
          <span>🧺</span>
          <i>●</i>
        </div>
        <div className="fruit-basket-game__ground" aria-hidden="true" />
        {(game.gameOver || game.won) && (
          <div className="fruit-basket-game__result">
            <span className="fruit-basket-game__result-icon">{game.won ? '🌟' : '🍂'}</span>
            <h2>{game.won ? 'Ценности собраны!' : 'Попытка окончена'}</h2>
            <p>{game.won ? 'Отличная работа: всё ценное у тебя.' : 'Попробуй ещё раз и береги жизни.'}</p>
            <button type="button" onClick={restart}>Сыграть снова</button>
          </div>
        )}
      </div>

    </div>
  )
}
