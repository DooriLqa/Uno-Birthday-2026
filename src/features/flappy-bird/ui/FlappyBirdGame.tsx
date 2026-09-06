import { useCallback, useEffect, useRef, useState } from 'react'
import playerImage from '@/assets/flappy-bird/aaaa.png'
import './FlappyBirdGame.css'

type Props = { onComplete: () => void }

type Pipe = {
  id: number
  x: number
  gapTop: number
  counted: boolean
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

const GAME_WIDTH = 720
const GAME_HEIGHT = 440
const BIRD_X = 154
const BIRD_SIZE = 28
const PIPE_WIDTH = 66
const PIPE_GAP = 170
const PIPE_SPEED = 190
const GRAVITY = 1080
const FLAP_VELOCITY = -500
const GLIDE_SPEED = 55
const FIRST_PIPE_X = 480
const COINS_TO_COMPLETE = 20
const COIN_SPAWN_INTERVAL = 1.1
const COIN_SIZE = 24
const COIN_SPEED = PIPE_SPEED

const createInitialState = (): GameState => ({
  birdY: GAME_HEIGHT / 2 - BIRD_SIZE / 2,
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
  gapTop: id === 1 ? (GAME_HEIGHT - PIPE_GAP) / 2 : 90 + Math.random() * 70,
  counted: false,
})

const createCoin = (id: number, pipe: Pipe): GameCoin => ({
  id,
  x: pipe.x + PIPE_WIDTH + 20,
  y: pipe.gapTop + 18 + Math.random() * (PIPE_GAP - COIN_SIZE - 36),
})

export function FlappyBirdGame({ onComplete }: Props) {
  const [game, setGame] = useState<GameState>(createInitialState)
  const [stageScale, setStageScale] = useState(1)
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
    updateGame({
      ...current,
      running: true,
      birdVelocity: FLAP_VELOCITY,
      pipes: isFirstFlap ? [createPipe(1, FIRST_PIPE_X)] : current.pipes,
      nextPipeId: isFirstFlap ? 2 : current.nextPipeId,
    })
  }, [updateGame])

  const startHolding = useCallback(() => {
    if (holdingRef.current) return
    holdingRef.current = true
    flap()
  }, [flap])

  const stopHolding = useCallback(() => {
    holdingRef.current = false
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
          if (!pipe.counted && pipe.x + PIPE_WIDTH < BIRD_X) {
            const nextPassedPipes = passedPipes + 1
            passedPipes = nextPassedPipes
            return { ...pipe, counted: true }
          }
          return pipe
        }).filter((pipe) => pipe.x > -PIPE_WIDTH - 10)

        const birdBottom = birdY + BIRD_SIZE
        const birdRight = BIRD_X + BIRD_SIZE
        let collectedCoins = current.collectedCoins
        coins = coins.filter((coin) => {
          const overlapsBird =
            birdRight > coin.x &&
            BIRD_X < coin.x + COIN_SIZE &&
            birdBottom > coin.y &&
            birdY < coin.y + COIN_SIZE

          if (overlapsBird) {
            collectedCoins += 1
            return false
          }
          return coin.x > -COIN_SIZE - 10
        })

        if (collectedCoins >= COINS_TO_COMPLETE && !current.completed) {
          onCompleteRef.current()
        }

        const birdHitPipe = pipes.some((pipe) => {
          const overlapsPipe = BIRD_X + BIRD_SIZE > pipe.x && BIRD_X < pipe.x + PIPE_WIDTH
          const birdCenter = birdY + BIRD_SIZE / 2
          const gapPadding = 10
          const outsideGap =
            birdCenter < pipe.gapTop + gapPadding ||
            birdCenter > pipe.gapTop + PIPE_GAP - gapPadding
          return overlapsPipe && outsideGap
        })
        const hitBoundary = birdBottom >= GAME_HEIGHT
        const gameOver = hitBoundary || birdHitPipe

        updateGame({
          ...current,
          birdY: Math.max(0, Math.min(GAME_HEIGHT - BIRD_SIZE, birdY)),
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

  const restart = () => {
    updateGame(createInitialState())
    lastTimeRef.current = null
    pipeTimerRef.current = 0
    coinTimerRef.current = 0
  }

  return (
    <div className="flappy-bird-game">
      <div className="flappy-bird-game__header">
        <div>
          <span className="flappy-bird-game__eyebrow">Островная аркада</span>
          <h1>Полёт над лагуной</h1>
        </div>
        <div className="flappy-bird-game__score" aria-label={`Собрано монет: ${game.collectedCoins} из ${COINS_TO_COMPLETE}`}>
          <span>МОНЕТЫ</span>
          <strong>{game.collectedCoins}/{COINS_TO_COMPLETE}</strong>
        </div>
      </div>

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
        <span className="flappy-bird-game__world" style={{ transform: `scale(${stageScale})` }}>
          <span className="flappy-bird-game__sun" aria-hidden />
          <span
            className="flappy-bird-game__bird"
            style={{ transform: `translate(${BIRD_X}px, ${game.birdY}px) rotate(${Math.max(-18, Math.min(76, game.birdVelocity / 8))}deg)` }}
          >
            <img src={playerImage} alt="" aria-hidden />
          </span>
          {game.coins.map((coin) => (
            <span
              key={coin.id}
              className="flappy-bird-game__coin"
              style={{ transform: `translate(${coin.x}px, ${coin.y}px)` }}
              aria-hidden
            >
              🪙
            </span>
          ))}
          {game.pipes.map((pipe) => (
            <span key={pipe.id} className="flappy-bird-game__pipe-pair" style={{ transform: `translateX(${pipe.x}px)` }} aria-hidden>
              <span className="flappy-bird-game__pipe flappy-bird-game__pipe--top" style={{ height: pipe.gapTop }} />
              <span className="flappy-bird-game__pipe flappy-bird-game__pipe--bottom" style={{ height: GAME_HEIGHT - pipe.gapTop - PIPE_GAP }} />
            </span>
          ))}
          <span className="flappy-bird-game__ground" aria-hidden />
          {!game.running && !game.gameOver && (
            <span className="flappy-bird-game__message">
              <strong>Прыг!</strong>
              <small>Пробел или левая кнопка мыши</small>
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

      <div className="flappy-bird-game__footer">
        <span>Собери {COINS_TO_COMPLETE} монет внутри игры</span>
        {game.completed && <strong>Награда получена</strong>}
        {(game.gameOver || game.completed) && <button type="button" onClick={restart}>Начать заново</button>}
      </div>
    </div>
  )
}