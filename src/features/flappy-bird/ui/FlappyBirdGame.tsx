import { useCallback, useEffect, useRef, useState } from 'react'
import './FlappyBirdGame.css'
import { usePawCoinStore } from '@/features/currency/model/store'

type Props = { onComplete: () => void }

type Pipe = {
  id: number
  x: number
  gapTop: number
  counted: boolean
}

type GameState = {
  birdY: number
  birdVelocity: number
  pipes: Pipe[]
  nextPipeId: number
  passedPipes: number
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
const FIRST_PIPE_X = 480

const createInitialState = (): GameState => ({
  birdY: GAME_HEIGHT / 2 - BIRD_SIZE / 2,
  birdVelocity: 0,
  pipes: [],
  nextPipeId: 1,
  passedPipes: 0,
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

export function FlappyBirdGame({ onComplete }: Props) {
  const addPawCoins = usePawCoinStore((state) => state.addPawCoins)
  const [game, setGame] = useState<GameState>(createInitialState)
  const [stageScale, setStageScale] = useState(1)
  const gameRef = useRef(game)
  const stageRef = useRef<HTMLButtonElement>(null)
  const onCompleteRef = useRef(onComplete)
  const addPawCoinsRef = useRef(addPawCoins)
  const frameRef = useRef<number | null>(null)
  const lastTimeRef = useRef<number | null>(null)
  const pipeTimerRef = useRef(0)

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
    addPawCoinsRef.current = addPawCoins
  }, [addPawCoins, onComplete])

  const updateGame = useCallback((nextGame: GameState) => {
    gameRef.current = nextGame
    setGame(nextGame)
  }, [])

  const flap = useCallback(() => {
    const current = gameRef.current
    if (current.gameOver) {
      updateGame(createInitialState())
      lastTimeRef.current = null
      pipeTimerRef.current = 0
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

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code !== 'Space') return
      event.preventDefault()
      flap()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [flap])

  useEffect(() => {
    const tick = (time: number) => {
      const current = gameRef.current
      const previousTime = lastTimeRef.current ?? time
      const delta = Math.min((time - previousTime) / 1000, 0.04)
      lastTimeRef.current = time

      if (current.running && !current.gameOver) {
        pipeTimerRef.current += delta
        const birdVelocity = current.birdVelocity + GRAVITY * delta
        const birdY = current.birdY + birdVelocity * delta
        let pipes = current.pipes.map((pipe) => ({ ...pipe, x: pipe.x - PIPE_SPEED * delta }))
        let nextPipeId = current.nextPipeId

        if (pipeTimerRef.current >= 1.55) {
          pipes = [...pipes, createPipe(nextPipeId, GAME_WIDTH + 24)]
          nextPipeId += 1
          pipeTimerRef.current = 0
        }

        let passedPipes = current.passedPipes
        let reward = 0
        pipes = pipes
          .map((pipe) => {
            if (!pipe.counted && pipe.x + PIPE_WIDTH < BIRD_X) {
              const nextPassedPipes = passedPipes + 1
              passedPipes = nextPassedPipes
              if (nextPassedPipes % 10 === 0) reward += 1
              return { ...pipe, counted: true }
            }
            return pipe
          })
          .filter((pipe) => pipe.x > -PIPE_WIDTH - 10)

        if (reward > 0) addPawCoinsRef.current(reward)
        if (passedPipes >= 10 && !current.completed) {
          onCompleteRef.current()
        }

        const birdBottom = birdY + BIRD_SIZE
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
          nextPipeId,
          passedPipes,
          gameOver,
          completed: current.completed || passedPipes >= 10,
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
  }

  return (
    <div className="flappy-bird-game">
      <div className="flappy-bird-game__header">
        <div>
          <span className="flappy-bird-game__eyebrow">Островная аркада</span>
          <h1>Полёт над лагуной</h1>
        </div>
        <div className="flappy-bird-game__score" aria-label={`Пройдено труб: ${game.passedPipes}`}>
          <span>ТРУБЫ</span>
          <strong>{game.passedPipes}</strong>
        </div>
      </div>

      <button
        type="button"
        className={`flappy-bird-game__stage ${game.gameOver ? 'is-game-over' : ''}`}
        onClick={flap}
        aria-label="Прыгнуть или начать полёт"
        ref={stageRef}
      >
        <span className="flappy-bird-game__world" style={{ transform: `scale(${stageScale})` }}>
          <span className="flappy-bird-game__sun" aria-hidden />
          <span
            className="flappy-bird-game__bird"
            style={{
              transform: `translate(${BIRD_X}px, ${game.birdY}px) rotate(${Math.max(-18, Math.min(76, game.birdVelocity / 8))}deg)`,
            }}
            aria-hidden
          >
            🐦
          </span>
          {game.pipes.map((pipe) => (
            <span
              key={pipe.id}
              className="flappy-bird-game__pipe-pair"
              style={{ transform: `translateX(${pipe.x}px)` }}
              aria-hidden
            >
              <span
                className="flappy-bird-game__pipe flappy-bird-game__pipe--top"
                style={{ height: pipe.gapTop }}
              />
              <span
                className="flappy-bird-game__pipe flappy-bird-game__pipe--bottom"
                style={{ height: GAME_HEIGHT - pipe.gapTop - PIPE_GAP }}
              />
            </span>
          ))}
          <span className="flappy-bird-game__ground" aria-hidden />
          {!game.running && !game.gameOver && (
            <span className="flappy-bird-game__message">
              <strong>Прыг!</strong>
              <small>Пробел или левая кнопка мыши</small>
            </span>
          )}
          {game.gameOver && (
            <span className="flappy-bird-game__message">
              <strong>Бух в воду!</strong>
              <small>Нажми, чтобы попробовать ещё раз</small>
            </span>
          )}
        </span>
      </button>

      <div className="flappy-bird-game__footer">
        <span>Каждые 10 труб = 1 🐾 монетка</span>
        {game.completed && <strong>Награда получена</strong>}
        {game.gameOver && (
          <button type="button" onClick={restart}>
            Начать заново
          </button>
        )}
      </div>
    </div>
  )
}
