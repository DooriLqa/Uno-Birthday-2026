import { useCallback, useEffect, useRef, useState } from 'react'
import playerImage from '@/shared/assets/games/flappy-bird/dachshund-wings-up.png'
import playerWingsDownImage from '@/shared/assets/games/flappy-bird/dachshund-wings-down.png'
import coinImage from '@/shared/assets/games/flappy-bird/coin-bone.png'
import backgroundImage1 from '@/shared/assets/games/flappy-bird/bg1.png'
import backgroundImage2 from '@/shared/assets/games/flappy-bird/bg2.png'
import pipeImage1 from '@/shared/assets/games/flappy-bird/pipe1.png'
import pipeImage2 from '@/shared/assets/games/flappy-bird/pipe2.png'
import screamSound from '@/shared/assets/games/flappy-bird/audio/scream.mp3'
import startSound from '@/shared/assets/games/flappy-bird/audio/bird.mp3'
import winSound from '@/shared/assets/common/audio/win-sound.mp3'
import coinSound from '@/shared/assets/common/audio/coin.mp3'
import insertCoinSound from '@/shared/assets/common/audio/insert-coin.mp3'

import { FLAPPY_BIRD_LAYOUT, FLAPPY_WORLD, type FlappyBirdLayout } from '../model/layout'
import { playOneShotSound } from '@/shared/lib/audio/playOneShotSound'
import { usePawCoinStore } from '@/features/currency/model/store'
import './FlappyBirdGame.css'

type Props = { onComplete: () => void; layout?: FlappyBirdLayout }

type Pipe = {
  id: number
  x: number
  gapTop: number
  counted: boolean
  image: string
}

type GameCoin = {
  id: number
  x: number
  y: number
}

type GameState = {
  birdY: number
  birdVelocity: number
  pipes: Pipe[]
  coins: GameCoin[]
  nextPipeId: number
  nextCoinId: number
  passedPipes: number
  collectedCoins: number
  running: boolean
  gameOver: boolean
  completed: boolean
  lives: number
}

const FLAPPY_GAME_KEY = 'flappy-game'
const FLAPPY_START_SOUND_KEY = `${FLAPPY_GAME_KEY}:start`
const FLAPPY_COIN_INSERT_SOUND_KEY = `${FLAPPY_GAME_KEY}:coin-insert`
const FLAPPY_COIN_SOUND_KEY = `${FLAPPY_GAME_KEY}:coin`
const GAME_WIDTH = FLAPPY_WORLD.width
const GAME_HEIGHT = FLAPPY_WORLD.height
const BIRD_X = 154
const BIRD_WIDTH = 69
const BIRD_HEIGHT = 37
const BIRD_HITBOX_INSET_X = 4
const BIRD_HITBOX_INSET_Y = 3
const PIPE_WIDTH = 99
const PIPE_GAP = 160
const PIPE_VISUAL_EXTENSION = 44
const PIPE_SPEED = 190
const GRAVITY = 1080
const FLAP_VELOCITY = -470
const GLIDE_SPEED = 55
const FIRST_PIPE_X = 480
const COINS_TO_COMPLETE = 20
const COIN_SPAWN_INTERVAL = 1.1
const COIN_SIZE = 24
const COIN_SPEED = PIPE_SPEED
const BACKGROUND_SWITCH_INTERVAL_MS = 1000
const GAME_BACKGROUND_IMAGES = [backgroundImage1, backgroundImage2]
const PIPE_IMAGES = [pipeImage1, pipeImage2]
const PIPE_ALPHA_BOUNDS = {
  [pipeImage1]: { left: 362 / 1024, right: 662 / 1024, bottom: 1447 / 1536 },
  [pipeImage2]: { left: 305 / 1024, right: 707 / 1024, bottom: 1450 / 1536 },
}
const SCREAM_SOUND = screamSound
const START_SOUND = startSound
const WIN_SOUND = winSound
const COIN_SOUND = coinSound
const COIN_INSERT_SOUND = insertCoinSound

const createInitialState = (): GameState => ({
  birdY: GAME_HEIGHT / 2 - BIRD_HEIGHT / 2,
  birdVelocity: 0,
  pipes: [],
  coins: [],
  nextPipeId: 1,
  nextCoinId: 1,
  passedPipes: 0,
  collectedCoins: 0,
  running: false,
  gameOver: false,
  completed: false,
  lives: 3,
})

const createPipe = (id: number, x: number): Pipe => ({
  id,
  x,
  gapTop: id === 1 ? (GAME_HEIGHT - PIPE_GAP) / 2 : 90 + Math.random() * 100,
  counted: false,
  image: PIPE_IMAGES[Math.floor(Math.random() * PIPE_IMAGES.length)],
})

const createCoin = (id: number, pipe: Pipe): GameCoin => ({
  id,
  x: pipe.x + PIPE_WIDTH + 20,
  y: pipe.gapTop + 18 + Math.random() * (PIPE_GAP - COIN_SIZE - 36),
})

export function FlappyBirdGame({ onComplete, layout = FLAPPY_BIRD_LAYOUT }: Props) {
  // The artwork stays centered. Include an off-center screen when limiting its scale.
  const screenHorizontalExtent = Math.max(
    Math.abs(layout.screen.x - layout.artwork.width / 2),
    Math.abs(layout.screen.x + layout.screen.width - layout.artwork.width / 2),
  )
  const screenVerticalExtent = Math.max(
    Math.abs(layout.screen.y - layout.artwork.height / 2),
    Math.abs(layout.screen.y + layout.screen.height - layout.artwork.height / 2),
  )
  const [game, setGame] = useState<GameState>(createInitialState)
  const [backgroundIndex, setBackgroundIndex] = useState(0)
  const [stageScale, setStageScale] = useState(1)
  const [isHolding, setIsHolding] = useState(false)
  const gameRef = useRef(game)
  const stageRef = useRef<HTMLButtonElement>(null)
  const onCompleteRef = useRef(onComplete)
  const frameRef = useRef<number | null>(null)
  const lastTimeRef = useRef<number | null>(null)
  const pipeTimerRef = useRef(0)
  const coinTimerRef = useRef(0)
  const holdingRef = useRef(false)
  const deathLockUntilRef = useRef(0)
  const startDelayRef = useRef(false)

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      if (width > 0 && height > 0) {
        setStageScale(Math.min(width / GAME_WIDTH, height / GAME_HEIGHT))
      }
    })
    observer.observe(stage)
    return () => observer.disconnect()
  }, [layout])

  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  useEffect(() => {
    const interval = window.setInterval(() => {
      setBackgroundIndex((currentIndex) => (currentIndex + 1) % GAME_BACKGROUND_IMAGES.length)
    }, BACKGROUND_SWITCH_INTERVAL_MS)

    return () => window.clearInterval(interval)
  }, [])

  const updateGame = useCallback((nextGame: GameState) => {
    gameRef.current = nextGame
    setGame(nextGame)
  }, [])

  const flap = useCallback(async () => {
    const current = gameRef.current

    // After inserting the coin, keep the game locked for 1 second so
    // accidental clicks/Space presses cannot start it during the delay.
    if (startDelayRef.current) {
      return
    }

    // A life was lost. The existing "Бух в воду!" screen is shown while
    // gameOver is true. The next Space/click starts the next life immediately.
    // No Paw Coin is charged for a retry.
    if (current.gameOver) {
      if (current.lives <= 0) {
        return
      }

      const nextPipe = createPipe(1, FIRST_PIPE_X)

      updateGame({
        ...createInitialState(),
        lives: current.lives,
        running: true,
        gameOver: false,
        completed: false,
        birdVelocity: FLAP_VELOCITY,
        pipes: [nextPipe],
        nextPipeId: 2,
      })

      lastTimeRef.current = null
      pipeTimerRef.current = 0
      coinTimerRef.current = 0

      playOneShotSound(START_SOUND, FLAPPY_START_SOUND_KEY)
      return
    }

    // Completed game: starting a completely new game costs one Paw Coin.
    if (current.completed) {
      updateGame(createInitialState())
      lastTimeRef.current = null
      pipeTimerRef.current = 0
      coinTimerRef.current = 0
      return
    }

    const isFirstFlap = current.pipes.length === 0
    const isGameStart = !current.running

    // Only the first start of the 3-life session costs one Paw Coin.
    if (isGameStart) {
      const { spendPawCoins } = usePawCoinStore.getState()
      if (!spendPawCoins(1)) {
        return
      }

      startDelayRef.current = true
      playOneShotSound(COIN_INSERT_SOUND, FLAPPY_COIN_INSERT_SOUND_KEY, 0.52)

      await new Promise((resolve) => window.setTimeout(resolve, 1000))

      startDelayRef.current = false

      // The game starts only after the full 1-second delay.
      const latest = gameRef.current
      const latestIsFirstFlap = latest.pipes.length === 0

      updateGame({
        ...latest,
        running: true,
        birdVelocity: FLAP_VELOCITY,
        pipes: latestIsFirstFlap
          ? [createPipe(1, FIRST_PIPE_X)]
          : latest.pipes,
        nextPipeId: latestIsFirstFlap ? 2 : latest.nextPipeId,
      })

      playOneShotSound(START_SOUND, FLAPPY_START_SOUND_KEY)
      return
    }

    updateGame({
      ...current,
      running: true,
      birdVelocity: FLAP_VELOCITY,
      pipes: isFirstFlap ? [createPipe(1, FIRST_PIPE_X)] : current.pipes,
      nextPipeId: isFirstFlap ? 2 : current.nextPipeId,
    })
  }, [updateGame])

  const startHolding = useCallback(() => {
    // Ignore the first second after death to protect against an accidental
    // click/Space event that caused the death.
    if (Date.now() < deathLockUntilRef.current) return
    if (holdingRef.current) return
    holdingRef.current = true
    setIsHolding(true)
    flap()
  }, [flap])

  const stopHolding = useCallback(() => {
    holdingRef.current = false
    setIsHolding(false)
  }, [])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code !== 'Space') return
      event.preventDefault()
      if (!event.repeat) startHolding()
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.code === 'Space') stopHolding()
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [startHolding, stopHolding])

  useEffect(() => {
    const tick = (time: number) => {
      const current = gameRef.current
      const previousTime = lastTimeRef.current ?? time
      const delta = Math.min((time - previousTime) / 1000, 0.04)
      lastTimeRef.current = time

      if (current.running && !current.gameOver) {
        pipeTimerRef.current += delta
        coinTimerRef.current += delta
        const birdVelocity = holdingRef.current
          ? Math.min(current.birdVelocity + GRAVITY * delta, GLIDE_SPEED)
          : current.birdVelocity + GRAVITY * delta
        const birdY = current.birdY + birdVelocity * delta
        let pipes = current.pipes.map((pipe) => ({ ...pipe, x: pipe.x - PIPE_SPEED * delta }))
        let coins = current.coins.map((coin) => ({ ...coin, x: coin.x - COIN_SPEED * delta }))
        let nextPipeId = current.nextPipeId
        let nextCoinId = current.nextCoinId

        if (pipeTimerRef.current >= 1.55) {
          pipes = [...pipes, createPipe(nextPipeId, GAME_WIDTH + 24)]
          nextPipeId += 1
          pipeTimerRef.current = 0
        }

        const coinSourcePipe = pipes.find((pipe) => pipe.x >= GAME_WIDTH)
        if (coinTimerRef.current >= COIN_SPAWN_INTERVAL && coinSourcePipe) {
          coins = [...coins, createCoin(nextCoinId, coinSourcePipe)]
          nextCoinId += 1
          coinTimerRef.current = 0
        }

        let passedPipes = current.passedPipes
        pipes = pipes
          .map((pipe) => {
            const alphaBounds = PIPE_ALPHA_BOUNDS[pipe.image]
            const visibleRight = pipe.x + PIPE_WIDTH * alphaBounds.right
            if (!pipe.counted && visibleRight < BIRD_X) {
              const nextPassedPipes = passedPipes + 1
              passedPipes = nextPassedPipes
              return { ...pipe, counted: true }
            }
            return pipe
          })
          .filter((pipe) => pipe.x > -PIPE_WIDTH - 10)

        const birdLeft = BIRD_X + BIRD_HITBOX_INSET_X
        const birdRight = BIRD_X + BIRD_WIDTH - BIRD_HITBOX_INSET_X
        const birdTop = birdY + BIRD_HITBOX_INSET_Y
        const birdBottom = birdY + BIRD_HEIGHT - BIRD_HITBOX_INSET_Y
        let collectedCoins = current.collectedCoins
        coins = coins.filter((coin) => {
          const overlapsBird =
            birdRight > coin.x &&
            birdLeft < coin.x + COIN_SIZE &&
            birdBottom > coin.y &&
            birdTop < coin.y + COIN_SIZE

          if (overlapsBird) {
            collectedCoins += 1
            playOneShotSound(COIN_SOUND, FLAPPY_COIN_SOUND_KEY, 0.1)
            return false
          }
          return coin.x > -COIN_SIZE - 10
        })

        if (collectedCoins >= COINS_TO_COMPLETE && !current.completed) {
          onCompleteRef.current()
        }

        const birdHitPipe = pipes.some((pipe) => {
          const alphaBounds = PIPE_ALPHA_BOUNDS[pipe.image]
          const pipeLeft = pipe.x + PIPE_WIDTH * alphaBounds.left
          const pipeRight = pipe.x + PIPE_WIDTH * alphaBounds.right
          if (birdRight <= pipeLeft || birdLeft >= pipeRight) return false

          const topPipeBottom = pipe.gapTop * alphaBounds.bottom
          const bottomPipeHeight = GAME_HEIGHT - pipe.gapTop - PIPE_GAP + PIPE_VISUAL_EXTENSION
          const bottomPipeTop = pipe.gapTop + PIPE_GAP + (1 - alphaBounds.bottom) * bottomPipeHeight

          return birdTop < topPipeBottom || birdBottom > bottomPipeTop
        })
        const hitBoundary = birdBottom >= GAME_HEIGHT
        const gameOver = hitBoundary || birdHitPipe

        if (gameOver && !current.gameOver) {
          playOneShotSound(SCREAM_SOUND, FLAPPY_GAME_KEY)

          const remainingLives = Math.max(0, current.lives - 1)

          // After the third death return to the normal start screen.
          // This also restores the three-life session and prevents the
          // game-over state from becoming a dead end.
          if (remainingLives === 0) {
            updateGame(createInitialState())
          } else {
            updateGame({
              ...current,
              birdY: Math.max(0, Math.min(GAME_HEIGHT - BIRD_HEIGHT, birdY)),
              birdVelocity,
              pipes,
              coins,
              nextPipeId,
              nextCoinId,
              passedPipes,
              collectedCoins,
              gameOver: true,
              running: false,
              completed: false,
              lives: remainingLives,
            })
          }

          lastTimeRef.current = null
          pipeTimerRef.current = 0
          coinTimerRef.current = 0
          deathLockUntilRef.current = Date.now() + 1000
          holdingRef.current = false
          setIsHolding(false)
        } else if (collectedCoins >= COINS_TO_COMPLETE && !current.completed) {
          playOneShotSound(WIN_SOUND, FLAPPY_GAME_KEY)

          updateGame({
            ...current,
            birdY: Math.max(0, Math.min(GAME_HEIGHT - BIRD_HEIGHT, birdY)),
            birdVelocity,
            pipes,
            coins,
            nextPipeId,
            nextCoinId,
            passedPipes,
            collectedCoins,
            gameOver: false,
            running: false,
            completed: true,
            lives: current.lives,
          })
        } else {
          updateGame({
            ...current,
            birdY: Math.max(0, Math.min(GAME_HEIGHT - BIRD_HEIGHT, birdY)),
            birdVelocity,
            pipes,
            coins,
            nextPipeId,
            nextCoinId,
            passedPipes,
            collectedCoins,
            gameOver,
            running: collectedCoins < COINS_TO_COMPLETE,
            completed: current.completed || collectedCoins >= COINS_TO_COMPLETE,
            lives: current.lives,
          })
        }
      }

      frameRef.current = requestAnimationFrame(tick)
    }

    frameRef.current = requestAnimationFrame(tick)
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
    }
  }, [updateGame])

  return (
    <div
      className="flappy-bird-game"
      style={
        {
          '--flappy-artwork-ratio': layout.artwork.width / layout.artwork.height,
          '--flappy-scene-max-width': `${((layout.maxScreenViewportWidth * layout.artwork.width) / (2 * screenHorizontalExtent)) * 100}vw`,
          '--flappy-scene-height-limit': `${((layout.maxScreenViewportHeight * layout.artwork.width) / (2 * screenVerticalExtent)) * 100}dvh`,
          '--flappy-screen-x': `${(layout.screen.x / layout.artwork.width) * 100}%`,
          '--flappy-screen-y': `${(layout.screen.y / layout.artwork.height) * 100}%`,
          '--flappy-screen-width': `${(layout.screen.width / layout.artwork.width) * 100}%`,
          '--flappy-screen-height': `${(layout.screen.height / layout.artwork.height) * 100}%`,
          '--flappy-screen-radius': `${(layout.screen.radius / layout.screen.width) * 100}% / ${(layout.screen.radius / layout.screen.height) * 100}%`,
          '--flappy-world-width': `${GAME_WIDTH}px`,
          '--flappy-world-height': `${GAME_HEIGHT}px`,
          '--flappy-bird-width': `${BIRD_WIDTH}px`,
          '--flappy-bird-height': `${BIRD_HEIGHT}px`,
          '--flappy-crt-scanline-opacity': layout.crt.scanlineOpacity,
          '--flappy-crt-grille-opacity': layout.crt.grilleOpacity,
          '--flappy-crt-vignette-opacity': layout.crt.vignetteOpacity,
          '--flappy-crt-contrast': layout.crt.contrast,
          '--flappy-crt-saturation': layout.crt.saturation,
        } as React.CSSProperties
      }
    >
      {layout.crt.enabled && (
        <svg className="flappy-bird-game__crt-definitions" aria-hidden="true">
          <defs>
            <filter
              id="flappy-crt-filter"
              x="-2%"
              y="-2%"
              width="104%"
              height="104%"
              colorInterpolationFilters="sRGB"
            >
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.003 0.16"
                numOctaves="1"
                seed="7"
                result="crtNoise"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="crtNoise"
                scale={layout.crt.displacement}
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
          </defs>
        </svg>
      )}
      <style>{`
        .flappy-bird-game__lives {
          position: absolute;
          top: 10px;
          left: 10px;
          z-index: 10;
          font-size: 20px;
          line-height: 1;
          letter-spacing: 2px;
          pointer-events: none;
          user-select: none;
          text-shadow: 1px 1px 0 rgba(0, 0, 0, 0.55);
        }
      `}</style>
      <div className="flappy-bird-game__cabinet">
        <img
          className="flappy-bird-game__cabinet-image"
          src={layout.image}
          alt=""
          aria-hidden="true"
          draggable={false}
        />
        <button
          type="button"
          className={`flappy-bird-game__stage ${game.gameOver ? 'is-game-over' : ''}`}
          onPointerDown={(event) => {
            event.preventDefault()
            startHolding()
          }}
          onPointerUp={stopHolding}
          onPointerLeave={stopHolding}
          onPointerCancel={stopHolding}
          aria-label="Прыгнуть или начать полёт"
          ref={stageRef}
        >
          <span
            className="flappy-bird-game__world"
            style={{ transform: `translate(-50%, -50%) scale(${stageScale})` }}
          >
            <span className={`flappy-bird-game__display ${layout.crt.enabled ? 'has-crt' : ''}`}>
              <span
                className="flappy-bird-game__score"
                aria-label={`Собрано монет: ${game.collectedCoins} из ${COINS_TO_COMPLETE}`}
              >
                {game.collectedCoins}/{COINS_TO_COMPLETE}
              </span>
              <span
                className="flappy-bird-game__lives"
                aria-label={`Жизни: ${game.lives} из 3`}
              >
                {'❤️'.repeat(game.lives)}
              </span>
              <img
                className="flappy-bird-game__background"
                src={GAME_BACKGROUND_IMAGES[backgroundIndex]}
                alt=""
                aria-hidden="true"
              />
              <span className="flappy-bird-game__sun" aria-hidden />
              <span
                className="flappy-bird-game__bird"
                style={{
                  transform: `translate(${BIRD_X}px, ${game.birdY}px) rotate(${Math.max(-18, Math.min(76, game.birdVelocity / 8))}deg)`,
                }}
              >
                <img src={isHolding ? playerImage : playerWingsDownImage} alt="" aria-hidden />
              </span>
              {game.coins.map((coin) => (
                <span
                  key={coin.id}
                  className="flappy-bird-game__coin"
                  style={{ transform: `translate(${coin.x}px, ${coin.y}px)` }}
                  aria-hidden
                >
                  <img src={coinImage} alt="" aria-hidden="true" />
                </span>
              ))}
              {game.pipes.map((pipe) => (
                <span
                  key={pipe.id}
                  className="flappy-bird-game__pipe-pair"
                  style={
                    {
                      '--flappy-pipe-width': `${PIPE_WIDTH}px`,
                      transform: `translateX(${pipe.x}px)`,
                    } as React.CSSProperties
                  }
                  aria-hidden
                >
                  <img
                    className="flappy-bird-game__pipe flappy-bird-game__pipe--top"
                    src={pipe.image}
                    alt=""
                    style={{ height: pipe.gapTop }}
                  />
                  <img
                    className="flappy-bird-game__pipe flappy-bird-game__pipe--bottom"
                    src={pipe.image}
                    alt=""
                    style={{ height: GAME_HEIGHT - pipe.gapTop - PIPE_GAP + PIPE_VISUAL_EXTENSION }}
                  />
                </span>
              ))}
              <span className="flappy-bird-game__ground" aria-hidden />
              {!game.running && !game.gameOver && !game.completed && game.lives === 3 && (
                <span className="flappy-bird-game__message">
                  <strong>Прыг!</strong>
                  <small>
                    Пробел или левая кнопка мыши. Чтобы парить, продолжай удерживать кнопку после
                    прыжка
                  </small>
                </span>
              )}
              {game.gameOver && !game.completed && (
                <span className="flappy-bird-game__message">
                  <strong>Бух в воду!</strong>
                  <small>Нажми, чтобы попробовать ещё раз</small>
                </span>
              )}
              {game.completed && (
                <span className="flappy-bird-game__message flappy-bird-game__message--won">
                  <strong>Полёт завершён!</strong>
                  <small>Ты собрал все {COINS_TO_COMPLETE} монет</small>
                </span>
              )}
            </span>
          </span>
        </button>
      </div>
    </div>
  )
}
