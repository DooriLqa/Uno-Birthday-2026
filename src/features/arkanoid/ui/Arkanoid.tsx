import { useCallback, useEffect, useRef, useState } from 'react'
import './Arkanoid.css'

export type ArkanoidProps = { onComplete: () => void }

const WIDTH = 720
const HEIGHT = 480
const PADDLE_WIDTH = 96
const PADDLE_HEIGHT = 12
const BALL_RADIUS = 7
const INITIAL_LIVES = 3
const ROWS = 5
const COLUMNS = 10
const BRICK_WIDTH = 62
const BRICK_HEIGHT = 22
const BRICK_GAP = 7
const BRICK_TOP = 48
const BRICK_LEFT = (WIDTH - (COLUMNS * BRICK_WIDTH + (COLUMNS - 1) * BRICK_GAP)) / 2

type Brick = { x: number; y: number; width: number; height: number; alive: boolean }
type GameState = {
  paddleX: number
  ballX: number
  ballY: number
  ballVX: number
  ballVY: number
  lives: number
  score: number
  bricks: Brick[]
}

const createBricks = (): Brick[] =>
  Array.from({ length: ROWS * COLUMNS }, (_, i) => {
    const row = Math.floor(i / COLUMNS)
    const column = i % COLUMNS
    return {
      x: BRICK_LEFT + column * (BRICK_WIDTH + BRICK_GAP),
      y: BRICK_TOP + row * (BRICK_HEIGHT + BRICK_GAP),
      width: BRICK_WIDTH,
      height: BRICK_HEIGHT,
      alive: true,
    }
  })

const createGame = (): GameState => ({
  paddleX: WIDTH / 2 - PADDLE_WIDTH / 2,
  ballX: WIDTH / 2,
  ballY: HEIGHT - 72,
  ballVX: Math.random() > 0.5 ? 4.2 : -4.2,
  ballVY: -4.2,
  lives: INITIAL_LIVES,
  score: 0,
  bricks: createBricks(),
})

export function Arkanoid({ onComplete }: ArkanoidProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const gameRef = useRef<GameState>(createGame())
  const frameRef = useRef<number | null>(null)
  const runningRef = useRef(false)
  const keysRef = useRef({ left: false, right: false })
  const [started, setStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [won, setWon] = useState(false)
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(INITIAL_LIVES)

  const resetBall = useCallback(() => {
    const g = gameRef.current
    g.ballX = WIDTH / 2
    g.ballY = HEIGHT - 72
    g.ballVX = Math.random() > 0.5 ? 4.2 : -4.2
    g.ballVY = -4.2
  }, [])

  const finish = useCallback(
    (isWin: boolean) => {
      runningRef.current = false
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
      frameRef.current = null
      setStarted(false)
      setWon(isWin)
      setGameOver(!isWin)
      if (isWin) onComplete()
    },
    [onComplete],
  )

  const draw = useCallback((ctx: CanvasRenderingContext2D) => {
    const g = gameRef.current
    ctx.clearRect(0, 0, WIDTH, HEIGHT)
    ctx.fillStyle = '#f8fbff'
    ctx.fillRect(0, 0, WIDTH, HEIGHT)
    ctx.fillStyle = '#263b57'
    ctx.fillRect(0, 0, WIDTH, 6)
    g.bricks.forEach((b, i) => {
      if (!b.alive) return
      ctx.fillStyle = i % COLUMNS < 5 ? '#eb6c9a' : '#6bb7d8'
      ctx.fillRect(b.x, b.y, b.width, b.height)
      ctx.fillStyle = 'rgba(255,255,255,0.35)'
      ctx.fillRect(b.x, b.y, b.width, 3)
    })
    ctx.fillStyle = '#263b57'
    ctx.fillRect(g.paddleX, HEIGHT - 30, PADDLE_WIDTH, PADDLE_HEIGHT)
    ctx.beginPath()
    ctx.arc(g.ballX, g.ballY, BALL_RADIUS, 0, Math.PI * 2)
    ctx.fillStyle = '#f2b84b'
    ctx.fill()
  }, [])

  const update = useCallback(() => {
    const g = gameRef.current
    if (keysRef.current.left) g.paddleX -= 7
    if (keysRef.current.right) g.paddleX += 7
    g.paddleX = Math.max(0, Math.min(WIDTH - PADDLE_WIDTH, g.paddleX))

    let nx = g.ballX + g.ballVX
    let ny = g.ballY + g.ballVY
    if (nx - BALL_RADIUS <= 0 || nx + BALL_RADIUS >= WIDTH) {
      g.ballVX *= -1
      nx = g.ballX + g.ballVX
    }
    if (ny - BALL_RADIUS <= 6) {
      g.ballVY *= -1
      ny = g.ballY + g.ballVY
    }

    const paddleY = HEIGHT - 30
    if (
      ny + BALL_RADIUS >= paddleY &&
      ny - BALL_RADIUS <= paddleY + PADDLE_HEIGHT &&
      nx >= g.paddleX &&
      nx <= g.paddleX + PADDLE_WIDTH &&
      g.ballVY > 0
    ) {
      const hit = (nx - (g.paddleX + PADDLE_WIDTH / 2)) / (PADDLE_WIDTH / 2)
      g.ballVX = hit * 5.5
      g.ballVY = -Math.max(3.8, Math.abs(g.ballVY))
      ny = paddleY - BALL_RADIUS
    }

    for (const b of g.bricks) {
      if (!b.alive) continue
      const hit =
        nx + BALL_RADIUS >= b.x &&
        nx - BALL_RADIUS <= b.x + b.width &&
        ny + BALL_RADIUS >= b.y &&
        ny - BALL_RADIUS <= b.y + b.height
      if (!hit) continue
      b.alive = false
      g.score += 10
      setScore(g.score)
      if (g.ballY + BALL_RADIUS <= b.y || g.ballY - BALL_RADIUS >= b.y + b.height) g.ballVY *= -1
      else g.ballVX *= -1
      break
    }

    g.ballX = nx
    g.ballY = ny
    if (g.bricks.every((b) => !b.alive)) {
      finish(true)
      return
    }
    if (g.ballY - BALL_RADIUS > HEIGHT) {
      g.lives -= 1
      setLives(g.lives)
      if (g.lives <= 0) {
        finish(false)
        return
      }
      resetBall()
    }
  }, [finish, resetBall])

  const loop = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      if (!runningRef.current) return
      update()
      draw(ctx)
      frameRef.current = requestAnimationFrame(() => loop(ctx))
    },
    [draw, update],
  )

  const startGame = useCallback(() => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
    gameRef.current = createGame()
    keysRef.current = { left: false, right: false }
    setScore(0)
    setLives(INITIAL_LIVES)
    setGameOver(false)
    setWon(false)
    setStarted(true)
    runningRef.current = true
    const ctx = canvasRef.current?.getContext('2d')
    if (ctx) {
      draw(ctx)
      frameRef.current = requestAnimationFrame(() => loop(ctx))
    }
  }, [draw, loop])

  const movePaddle = useCallback((clientX: number) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const x = ((clientX - rect.left) * WIDTH) / rect.width
    gameRef.current.paddleX = Math.max(0, Math.min(WIDTH - PADDLE_WIDTH, x - PADDLE_WIDTH / 2))
  }, [])

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d')
    if (ctx) draw(ctx)
    return () => {
      runningRef.current = false
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
    }
  }, [draw])

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') {
        e.preventDefault()
        keysRef.current.left = true
      }
      if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') {
        e.preventDefault()
        keysRef.current.right = true
      }
    }
    const up = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') keysRef.current.left = false
      if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') keysRef.current.right = false
    }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [])

  return (
    <div className="arkanoid">
      <div className="arkanoid__hud">
        <div>
          <span>Счёт</span>
          <strong>{score}</strong>
        </div>
        <div>
          <span>Жизни</span>
          <strong>{'❤️'.repeat(lives)}</strong>
        </div>
      </div>
      <div
        className="arkanoid__canvas-wrap"
        onMouseMove={(e) => movePaddle(e.clientX)}
        onTouchMove={(e) => {
          const t = e.touches[0]
          if (t) movePaddle(t.clientX)
        }}
      >
        <canvas
          ref={canvasRef}
          className="arkanoid__canvas"
          width={WIDTH}
          height={HEIGHT}
          aria-label="Игра Арканоид"
        />
      </div>
      <div className="arkanoid__controls">
        {!started && !won && (
          <button className="arkanoid__button" type="button" onClick={startGame}>
            {gameOver ? 'Играть снова' : 'Начать игру'}
          </button>
        )}
        {won && (
          <>
            <div className="arkanoid__message arkanoid__message--win">Победа! 🎉</div>
            <button className="arkanoid__button" type="button" onClick={startGame}>
              Играть снова
            </button>
          </>
        )}
        {gameOver && !won && (
          <div className="arkanoid__message arkanoid__message--lose">Игра окончена</div>
        )}
        {started && <span className="arkanoid__hint">← → или A / D · мышь или палец</span>}
      </div>
    </div>
  )
}
