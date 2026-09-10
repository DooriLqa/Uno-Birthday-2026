import { useCallback, useEffect, useRef, useState } from 'react'
import playerImage from '@/assets/flappy-bird/dachshund-wings-up.png'
import playerWingsDownImage from '@/assets/flappy-bird/dachshund-wings-down.png'
import coinImage from '@/assets/flappy-bird/coin-bone.png'
import backgroundImage1 from '@/assets/flappy-bird/bg1.png'
import backgroundImage2 from '@/assets/flappy-bird/bg2.png'
import pipeImage1 from '@/assets/flappy-bird/pipe1.png'
import pipeImage2 from '@/assets/flappy-bird/pipe2.png'
import { FLAPPY_BIRD_LAYOUT } from '../model/layout'
import { playOneShotSound } from '@/shared/lib/audio/playOneShotSound'
import './FlappyBirdGame.css'

type Props = { onComplete: () => void }

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
}

const FLAPPY_GAME_KEY = 'flappy-game'
const GAME_WIDTH = 720
const GAME_HEIGHT = 440
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
const SCREAM_SOUND = '/audio/sfx/scream.MP3'
const START_SOUND = '/audio/sfx/bird.MP3'
const WIN_SOUND = '/audio/sfx/winSound.MP3'
const COIN_SOUND = '/audio/sfx/coin.mp3'

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

export function FlappyBirdGame({ onComplete }: Props) {
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

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return

    const updateStageScale = () => {
      setStageScale(stage.clientWidth / GAME_WIDTH)
    }

    updateStageScale()
    const observer = new ResizeObserver(updateStageScale)
    observer.observe(stage)
    return () => observer.disconnect()
  }, [])

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

  const flap = useCallback(() => {
    const current = gameRef.current
    if (current.gameOver || current.completed) {
      updateGame(createInitialState())
      lastTimeRef.current = null
      pipeTimerRef.current = 0
      coinTimerRef.current = 0
      return
    }

    const isFirstFlap = current.pipes.length === 0
    const isGameStart = !current.running
    updateGame({
      ...current,
      running: true,
      birdVelocity: FLAP_VELOCITY,
      pipes: isFirstFlap ? [createPipe(1, FIRST_PIPE_X)] : current.pipes,
      nextPipeId: isFirstFlap ? 2 : current.nextPipeId,
    })
    if (isGameStart) playOneShotSound(START_SOUND, FLAPPY_GAME_KEY)
  }, [updateGame])

  const startHolding = useCallback(() => {
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
        pipes = pipes.map((pipe) => {
          const alphaBounds = PIPE_ALPHA_BOUNDS[pipe.image]
          const visibleRight = pipe.x + PIPE_WIDTH * alphaBounds.right
          if (!pipe.counted && visibleRight < BIRD_X) {
            const nextPassedPipes = passedPipes + 1
            passedPipes = nextPassedPipes
            return { ...pipe, counted: true }
          }
          return pipe
        }).filter((pipe) => pipe.x > -PIPE_WIDTH - 10)

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
            playOneShotSound(COIN_SOUND, FLAPPY_GAME_KEY, 0.1)
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
          const bottomPipeTop =
            pipe.gapTop + PIPE_GAP + (1 - alphaBounds.bottom) * bottomPipeHeight

          return birdTop < topPipeBottom || birdBottom > bottomPipeTop
        })
        const hitBoundary = birdBottom >= GAME_HEIGHT
        const gameOver = hitBoundary || birdHitPipe

        if (gameOver && !current.gameOver) {
          playOneShotSound(SCREAM_SOUND, FLAPPY_GAME_KEY)
        } else if (collectedCoins >= COINS_TO_COMPLETE && !current.completed) {
          playOneShotSound(WIN_SOUND, FLAPPY_GAME_KEY)
        }

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
        })
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
      style={{
        '--flappy-width': FLAPPY_BIRD_LAYOUT.width,
        '--flappy-height': FLAPPY_BIRD_LAYOUT.height,
        '--flappy-x': FLAPPY_BIRD_LAYOUT.x,
        '--flappy-y': FLAPPY_BIRD_LAYOUT.y,
        '--flappy-bird-width': `${BIRD_WIDTH}px`,
        '--flappy-bird-height': `${BIRD_HEIGHT}px`,
      } as React.CSSProperties}
    >
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
        <span className="flappy-bird-game__score" aria-label={`Собрано монет: ${game.collectedCoins} из ${COINS_TO_COMPLETE}`}>
          {game.collectedCoins}/{COINS_TO_COMPLETE}
        </span>
        <img
          className="flappy-bird-game__background"
          src={GAME_BACKGROUND_IMAGES[backgroundIndex]}
          alt=""
          aria-hidden="true"
        />
        <span className="flappy-bird-game__world" style={{ transform: `scale(${stageScale})` }}>
          <span className="flappy-bird-game__sun" aria-hidden />
          <span
            className="flappy-bird-game__bird"
            style={{ transform: `translate(${BIRD_X}px, ${game.birdY}px) rotate(${Math.max(-18, Math.min(76, game.birdVelocity / 8))}deg)` }}
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
              style={{
                '--flappy-pipe-width': `${PIPE_WIDTH}px`,
                transform: `translateX(${pipe.x}px)`,
              } as React.CSSProperties}
              aria-hidden
            >
              <img className="flappy-bird-game__pipe flappy-bird-game__pipe--top" src={pipe.image} alt="" style={{ height: pipe.gapTop }} />
              <img
                className="flappy-bird-game__pipe flappy-bird-game__pipe--bottom"
                src={pipe.image}
                alt=""
                style={{ height: GAME_HEIGHT - pipe.gapTop - PIPE_GAP + PIPE_VISUAL_EXTENSION }}
              />
            </span>
          ))}
          <span className="flappy-bird-game__ground" aria-hidden />
          {!game.running && !game.gameOver && !game.completed && (
            <span className="flappy-bird-game__message">
              <strong>Прыг!</strong>
              <small>Пробел или левая кнопка мыши. Чтобы парить, продолжай удерживать кнопку после прыжка</small>
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
      </button>
    </div>
  )
}
