import { useEffect, useRef, useState } from 'react'
import { usePawCoinStore } from '@/features/currency/model/store'
import brickImage from '@/assets/fruit-basket/brick.png'
import buildingImage from '@/assets/fruit-basket/building.png'
import groundImage from '@/assets/fruit-basket/ground.png'
import handcuffsImage from '@/assets/fruit-basket/handcuffs.png'
import cameraImage from '@/assets/fruit-basket/camera.png'
import coinImage from '@/assets/fruit-basket/coin.png'
import diamondImage from '@/assets/fruit-basket/diamond.png'
import laptopImage from '@/assets/fruit-basket/laptop.png'
import magnetImage from '@/assets/fruit-basket/magnet.png'
import phoneImage from '@/assets/fruit-basket/phone.png'
import playerImage from '@/assets/fruit-basket/playerThief.png'
import ringImage from '@/assets/fruit-basket/ring.png'
import skyImage from '@/assets/fruit-basket/sky.png'
import sweetsImage from '@/assets/fruit-basket/sweets-box.png'
import watchImage from '@/assets/fruit-basket/watch.png'
import x2Image from '@/assets/fruit-basket/x2-bonus.png'
import { playOneShotSound } from '@/shared/lib/audio/playOneShotSound'
import { FRUIT_BASKET_LAYOUT } from '../model/layout'
import { BASKET_CATCH_OFFSET, isCaught, isMissed } from '../model/collision'
import './FruitBasketGame.css'

type Props = { onComplete: () => void }

type FallingItem = {
  id: number
  x: number
  y: number
  kind: 'good' | 'bad' | 'bonus'
  bonusType?: 'x2' | 'magnet'
  image: string
  speed: number
  magnetized?: boolean
  overflowed?: boolean
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
  x2Active: boolean
  magnetUntil: number | null
}

const BASKET_GAME_KEY = 'basket-game'
const TARGET_SCORE = 30
const MAX_LIVES = 5
const MAX_BASKET_LOAD = 5
const DROP_ZONE_WIDTH = 16

const ITEM_SPAWN_MIN_X = DROP_ZONE_WIDTH + 4
const ITEM_SPAWN_MAX_X = 92

const DROP_DURATION = 1000

const BASKET_SPEED = 1.7
const MAX_BASKET_SPEED = 3.6
const BASKET_ACCELERATION = 0.06

const ITEM_SPAWN_INTERVAL = 1200
const STARTUP_ITEM_SPAWN_INTERVAL = ITEM_SPAWN_INTERVAL * 2
const STARTUP_SPAWN_COUNT = 3
const FULL_BASKET_SPAWN_INTERVAL = ITEM_SPAWN_INTERVAL * 4

// Скорость притягивания магнитом
const MAGNET_SPEED_MULTIPLIER = 2

const BONUS_SPAWN_INTERVAL_SECONDS = 12
const MAGNET_DURATION_SECONDS = 8

const BONUS_SPAWN_INTERVAL = BONUS_SPAWN_INTERVAL_SECONDS * 1000
const MAGNET_DURATION = MAGNET_DURATION_SECONDS * 1000

const LOOSE_SOUND = '/audio/sfx/blya.MP3'
const START_SOUND = '/audio/sfx/pognali.MP3'
const WIN_SOUND = '/audio/sfx/winSound.MP3'
const COIN_SOUND = '/audio/sfx/coin.mp3'
const HANDCUFFS_SOUND = '/audio/sfx/handcuffs.mp3'
const BRICK_SOUND = '/audio/sfx/brick.mp3'
const FULL_BASKET_SOUND = '/audio/sfx/fullBasket.mp3'
const BONUS_SOUND = '/audio/sfx/bonus.mp3'
const CATCH_SOUND = '/audio/sfx/location-footsteps.ogg'

const GOOD_ITEMS = [
  cameraImage,
  coinImage,
  laptopImage,
  diamondImage,
  phoneImage,
  ringImage,
  sweetsImage,
  watchImage
]

const BAD_ITEMS = [handcuffsImage, brickImage]

// Пока используем gemImage как временную картинку бонусов
const BONUS_IMAGES = {
  x2: x2Image,
  magnet: magnetImage,
}

const initialState: GameState = {
  basketX: 50,
  items: [],
  score: 0,
  basketLoad: 0,
  deliveryProgress: 0,
  lives: MAX_LIVES,
  gameOver: false,
  won: false,
  x2Active: false,
  magnetUntil: null,
}

function isAtDropZone(game: GameState, side: 'left' | 'right') {
  return side === 'left'
    ? game.basketX <= DROP_ZONE_WIDTH
    : game.basketX >= 100 - DROP_ZONE_WIDTH
}

function basketDropZoneClass(game: GameState, side: 'left' | 'right') {
  if (!isAtDropZone(game, side) || game.basketLoad === 0) return ''

  return game.deliveryProgress > 0
    ? 'is-charging'
    : 'is-ready'
}

function dropProgressPercent(game: GameState, side: 'left' | 'right') {
  return isAtDropZone(game, side)
    ? (game.deliveryProgress / DROP_DURATION) * 100
    : 0
}

export function FruitBasketGame({ onComplete }: Props) {
  const [game, setGame] = useState(initialState)
  const [started, setStarted] = useState(false)
  const screenRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const screen = screenRef.current
    if (!screen) return

    // Scale the whole logical playfield together, including sprites and HUD.
    // Gameplay coordinates and timing stay independent of the window size.
    const observer = new ResizeObserver(([entry]) => {
      screen.style.setProperty('--fruit-basket-scale', String(entry.contentRect.width / 976))
    })
    observer.observe(screen)
    return () => observer.disconnect()
  }, [])

  const addPawCoins = usePawCoinStore((state) => state.addPawCoins)

  const gameRef = useRef(game)
  const completeRef = useRef(onComplete)
  const addPawCoinsRef = useRef(addPawCoins)

  const nextId = useRef(0)

  const controlsRef = useRef({
    left: false,
    right: false,
  })

  const basketSpeedRef = useRef(BASKET_SPEED)
  const lastDirectionRef = useRef(0)

  const startupSpawnCountRef = useRef(0)

  const startGame = () => {
    if (started) return
    setStarted(true)
    playOneShotSound(START_SOUND, BASKET_GAME_KEY)
  }

  useEffect(() => {
    gameRef.current = game
  }, [game])

  useEffect(() => {
    completeRef.current = onComplete
  }, [onComplete])

  useEffect(() => {
    addPawCoinsRef.current = addPawCoins
  }, [addPawCoins])

  // Управление корзиной
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === 'ArrowLeft' ||
        event.key.toLowerCase() === 'a' ||
        event.key.toLowerCase() === 'ф'
      ) {
        event.preventDefault()
        controlsRef.current.left = true
      }

      if (
        event.key === 'ArrowRight' ||
        event.key.toLowerCase() === 'd' ||
        event.key.toLowerCase() === 'в'
      ) {
        event.preventDefault()
        controlsRef.current.right = true
      }
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      if (
        event.key === 'ArrowLeft' ||
        event.key.toLowerCase() === 'a' ||
        event.key.toLowerCase() === 'ф'
      ) {
        controlsRef.current.left = false
      }

      if (
        event.key === 'ArrowRight' ||
        event.key.toLowerCase() === 'd' ||
        event.key.toLowerCase() === 'в'
      ) {
        controlsRef.current.right = false
      }
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

  // Обычный спавн предметов
  useEffect(() => {
    let spawnTimer: number

    const spawnItem = () => {
      const current = gameRef.current

      if (started && !current.gameOver && !current.won) {
        const isGood = Math.random() > 0.28
        const magnetActive =
          current.magnetUntil !== null &&
          Date.now() < current.magnetUntil

        const item: FallingItem = {
          id: nextId.current++,
          x:
            ITEM_SPAWN_MIN_X +
            Math.random() *
            (ITEM_SPAWN_MAX_X - ITEM_SPAWN_MIN_X),
          y: -8,
          kind: isGood ? 'good' : 'bad',
          image: isGood
            ? GOOD_ITEMS[
            Math.floor(
              Math.random() * GOOD_ITEMS.length,
            )
            ]
            : BAD_ITEMS[
            Math.floor(
              Math.random() * BAD_ITEMS.length,
            )
            ],
          speed: 0.7 + Math.random() * 0.35,

          // Все новые хорошие предметы сразу летят
          // к корзине, пока магнит активен.
          magnetized: isGood && magnetActive,
        }

        setGame((state) => ({
          ...state,
          items: [...state.items, item],
        }))

        startupSpawnCountRef.current += 1
      }

      const isStartup =
        startupSpawnCountRef.current < STARTUP_SPAWN_COUNT

      const delay = isStartup
        ? STARTUP_ITEM_SPAWN_INTERVAL
        : current.basketLoad >= MAX_BASKET_LOAD / 2 + 1
          ? FULL_BASKET_SPAWN_INTERVAL
          : ITEM_SPAWN_INTERVAL

      spawnTimer = window.setTimeout(spawnItem, delay)
    }

    spawnTimer = window.setTimeout(
      spawnItem,
      STARTUP_ITEM_SPAWN_INTERVAL,
    )

    return () => {
      window.clearTimeout(spawnTimer)
    }
  }, [started])

  // Отдельный спавн бонусов
  useEffect(() => {
    let bonusTimer: number

    const spawnBonus = () => {
      const current = gameRef.current

      if (started && !current.gameOver && !current.won) {
        // 50/50 между x2 и магнитом
        const bonusType: 'x2' | 'magnet' =
          Math.random() < 0.5 ? 'x2' : 'magnet'

        const bonus: FallingItem = {
          id: nextId.current++,
          x:
            ITEM_SPAWN_MIN_X +
            Math.random() * (ITEM_SPAWN_MAX_X - ITEM_SPAWN_MIN_X),
          y: -8,
          kind: 'bonus',
          bonusType,
          image: BONUS_IMAGES[bonusType],
          speed: 0.65 + Math.random() * 0.25,
        }

        setGame((state) => ({
          ...state,
          items: [...state.items, bonus],
        }))
      }

      bonusTimer = window.setTimeout(
        spawnBonus,
        BONUS_SPAWN_INTERVAL,
      )
    }

    bonusTimer = window.setTimeout(
      spawnBonus,
      BONUS_SPAWN_INTERVAL,
    )

    return () => {
      window.clearTimeout(bonusTimer)
    }
  }, [started])

  // Игровой цикл
  useEffect(() => {
    const frameTimer = window.setInterval(() => {
      setGame((current) => {
        if (!started || current.gameOver || current.won) {
          return current
        }

        const now = Date.now()

        // Проверяем, активен ли магнит
        const magnetActive =
          current.magnetUntil !== null &&
          now < current.magnetUntil

        const direction =
          Number(controlsRef.current.right) -
          Number(controlsRef.current.left)

        if (
          direction === 0 ||
          direction !== lastDirectionRef.current
        ) {
          basketSpeedRef.current = BASKET_SPEED
        } else {
          basketSpeedRef.current = Math.min(
            MAX_BASKET_SPEED,
            basketSpeedRef.current +
            BASKET_ACCELERATION,
          )
        }

        lastDirectionRef.current = direction

        const basketX = Math.max(
          8,
          Math.min(
            92,
            current.basketX +
            direction * basketSpeedRef.current,
          ),
        )

        let score = current.score
        let basketLoad = current.basketLoad
        let lives = current.lives
        let x2Active = current.x2Active

        const atDropZone =
          basketX <= DROP_ZONE_WIDTH ||
          basketX >= 100 - DROP_ZONE_WIDTH

        const deliveryProgress =
          atDropZone && basketLoad > 0
            ? current.deliveryProgress + 32
            : 0

        const remainingItems: FallingItem[] = []

        let magnetWasCaught = false

        for (const item of current.items) {
          let nextX = item.x
          let nextY: number

          // Если магнит активен, хороший предмет
          // должен притягиваться к корзине.
          const shouldMagnetize =
            item.kind === 'good' &&
            (item.magnetized || magnetActive)

          if (shouldMagnetize) {
            const magnetSpeed =
              item.speed *
              MAGNET_SPEED_MULTIPLIER

            const xDistance =
              basketX + BASKET_CATCH_OFFSET - item.x

            nextX =
              Math.abs(xDistance) <= 1
                ? basketX + BASKET_CATCH_OFFSET
                : item.x +
                Math.sign(xDistance) *
                Math.min(
                  Math.abs(xDistance),
                  magnetSpeed * 1.5,
                )

            nextY =
              item.y + magnetSpeed
          } else {
            nextY = item.y + item.speed
          }

          if (
            !item.overflowed &&
            isCaught(item, { x: nextX, y: nextY }, current.basketX, basketX)
          ) {
            // Хороший предмет
            if (item.kind === 'good') {
              if (basketLoad < MAX_BASKET_LOAD) {
                playOneShotSound(CATCH_SOUND, BASKET_GAME_KEY)
                basketLoad += 1
                if (basketLoad === MAX_BASKET_LOAD) {
                  playOneShotSound(FULL_BASKET_SOUND, BASKET_GAME_KEY)
                }
                continue
              }

              // A full basket cannot absorb another item. Let it visibly
              // fall past the character; it counts as a missed item below.
              remainingItems.push({
                ...item,
                x: nextX,
                y: nextY,
                overflowed: true,
              })
              continue
            }

            // Бонус
            if (item.kind === 'bonus') {
              playOneShotSound(BONUS_SOUND, 'basket-bonus')
              if (
                item.bonusType === 'x2'
              ) {
                // x2 действует на текущую
                // корзину.
                x2Active = true
              }

              if (
                item.bonusType === 'magnet'
              ) {
                magnetWasCaught = true
              }

              continue
            }

            // Плохой предмет
            if (item.kind === 'bad') {
              playOneShotSound(
                item.image === brickImage ? BRICK_SOUND : HANDCUFFS_SOUND,
                'basket-bad-item',
              )
              lives -= 1
              continue
            }
          }

          if (isMissed(nextY)) {
            // Хороший предмет пропущен
            if (item.kind === 'good') {
              lives -= 1
            }

            continue
          }

          remainingItems.push({
            ...item,
            x: nextX,
            y: nextY,

            // Если магнит активен,
            // помечаем предмет.
            magnetized:
              item.kind === 'good'
                ? shouldMagnetize
                : item.magnetized,
          })
        }

        /*
         * Поймали магнит.
         *
         * Все хорошие предметы, которые сейчас
         * находятся на поле, начинают лететь
         * к корзине.
         */
        const magnetUntil =
          magnetWasCaught
            ? now + MAGNET_DURATION
            : current.magnetUntil

        const finalItems = magnetWasCaught
          ? remainingItems.map((item) =>
            item.kind === 'good'
              ? {
                ...item,
                magnetized: true,
              }
              : item,
          )
          : remainingItems

        /*
         * Сдача корзины.
         *
         * x2 применяется только к этой корзине.
         */
        if (
          deliveryProgress >= DROP_DURATION
        ) {
          score +=
            basketLoad *
            (x2Active ? 2 : 1)
          playOneShotSound(COIN_SOUND, 'basket-coin', 0.1)
          basketLoad = 0

          // После сдачи x2 обязательно
          // сбрасывается.
          x2Active = false
        }

        /*
         * Если магнит закончился,
         * снимаем magnetized с предметов,
         * которые ещё не успели долететь.
         */
        const activeItems =
          magnetUntil !== null &&
            now < magnetUntil
            ? finalItems
            : finalItems.map((item) =>
              item.kind === 'good'
                ? {
                  ...item,
                  magnetized: false,
                }
                : item,
            )

        const won =
          score >= TARGET_SCORE

        const gameOver =
          lives <= 0

        if (won) {
          addPawCoinsRef.current(1)
          completeRef.current()
        }

        if (gameOver && !current.gameOver) {
          playOneShotSound(LOOSE_SOUND, BASKET_GAME_KEY)
        } else if (won && !current.gameOver) {
          playOneShotSound(WIN_SOUND, BASKET_GAME_KEY)
        }

        return {
          ...current,
          basketX,
          items: activeItems,
          score,
          basketLoad,
          deliveryProgress:
            basketLoad === 0
              ? 0
              : Math.min(
                deliveryProgress,
                DROP_DURATION,
              ),
          lives: Math.max(0, lives),
          gameOver,
          won,
          x2Active,
          magnetUntil:
            magnetUntil !== null &&
              now < magnetUntil
              ? magnetUntil
              : null,
        }
      })
    }, 32)

    return () => {
      window.clearInterval(frameTimer)
    }
  }, [started])

  const restart = () => {
    controlsRef.current.left = false
    controlsRef.current.right = false

    basketSpeedRef.current = BASKET_SPEED
    lastDirectionRef.current = 0
    startupSpawnCountRef.current = 0

    setGame(initialState)
    gameRef.current = initialState
    setStarted(false)
  }

  return (
    <div
      className="fruit-basket-game"
      ref={screenRef}
      style={{
        '--fruit-basket-width': FRUIT_BASKET_LAYOUT.width,
        '--fruit-basket-height': FRUIT_BASKET_LAYOUT.height,
        '--fruit-basket-x': FRUIT_BASKET_LAYOUT.x,
        '--fruit-basket-y': FRUIT_BASKET_LAYOUT.y,
      } as React.CSSProperties}
    >
      <div
        className="fruit-basket-game__field"
        aria-label="Игровое поле"
      >
        <img className="fruit-basket-game__sky" src={skyImage} alt="" aria-hidden="true" />
        <img className="fruit-basket-game__building" src={buildingImage} alt="" aria-hidden="true" />
        <img className="fruit-basket-game__ground-image" src={groundImage} alt="" aria-hidden="true" />

        <div className="fruit-basket-game__hud" aria-label="Состояние игры">
          <span aria-label={`Сдано ${game.score} из ${TARGET_SCORE}`}>
            {game.score}/{TARGET_SCORE}
          </span>
          <span aria-label={`В корзине ${game.basketLoad} из ${MAX_BASKET_LOAD}`}>
            {game.basketLoad}/{MAX_BASKET_LOAD}
          </span>
          <span className="fruit-basket-game__hearts" aria-label={`${game.lives} из ${MAX_LIVES} жизней`}>
            {'♥'.repeat(game.lives)}
            <span className="fruit-basket-game__empty-hearts">
              {'♡'.repeat(MAX_LIVES - game.lives)}
            </span>
          </span>
          {game.x2Active && <span className="fruit-basket-game__bonus-active">x2</span>}
        </div>

        {!started && !game.gameOver && !game.won && (
          <div className="fruit-basket-game__start-screen">
            <strong>Корзинка удачи</strong>
            <p>Управление персонажем на A и D или стрелками. Лови ценности, складывай их в корзину и сдавай груз по краям поля. Наручники и кирпичи пропускай. Бонус x2 удваивает все очки в корзине при сдаче, действует один раз.</p>
            <button type="button" onClick={startGame}>Начать игру</button>
          </div>
        )}

        <div
          className={`fruit-basket-game__drop-zone fruit-basket-game__drop-zone--left ${basketDropZoneClass(
            game,
            'left',
          )}`}
        >
          <strong>СДАТЬ</strong>
          <span>←</span>

          <i
            style={{
              height: `${dropProgressPercent(
                game,
                'left',
              )}%`,
            }}
          />
        </div>

        <div
          className={`fruit-basket-game__drop-zone fruit-basket-game__drop-zone--right ${basketDropZoneClass(
            game,
            'right',
          )}`}
        >
          <strong>СДАТЬ</strong>
          <span>→</span>

          <i
            style={{
              height: `${dropProgressPercent(
                game,
                'right',
              )}%`,
            }}
          />
        </div>

        {game.items.map((item) => (
          <span
            key={item.id}
            className={[
              'fruit-basket-game__item',
              `fruit-basket-game__item--${item.kind}`,
              item.magnetized
                ? 'fruit-basket-game__item--magnetized'
                : '',
              item.bonusType
                ? `fruit-basket-game__item--bonus-${item.bonusType}`
                : '',
            ]
              .filter(Boolean)
              .join(' ')}
            style={{
              left: `${item.x}%`,
              top: `${item.y}%`,
            }}
            aria-hidden="true"
          >
            <img src={item.image} alt="" />
          </span>
        ))}

        <div
          className={`fruit-basket-game__basket ${game.basketLoad >= MAX_BASKET_LOAD
            ? 'is-full'
            : ''
            }`}
          style={{
            left: `${game.basketX}%`,
          }}
          aria-hidden="true"
        >
          <img src={playerImage} alt="" />
          <i>●</i>
        </div>

        <div
          className="fruit-basket-game__ground"
          aria-hidden="true"
        />

        {(game.gameOver || game.won) && (
          <div className="fruit-basket-game__result">
            <span className="fruit-basket-game__result-icon">
              {game.won ? '🌟' : '🍂'}
            </span>

            <h2>
              {game.won
                ? 'Ценности собраны!'
                : 'Попытка окончена'}
            </h2>

            <p>
              {game.won
                ? 'Отличная работа: всё ценное у тебя.'
                : 'Попробуй ещё раз и береги жизни.'}
            </p>

            <button
              type="button"
              onClick={restart}
            >
              Сыграть снова
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
