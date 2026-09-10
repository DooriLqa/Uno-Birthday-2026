import { useCallback, useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { ARKANOID_LAYOUT } from '../model/layout'
import arkanoidSound1 from '@/shared/assets/games/arkanoid/Arkanoid_1.wav'
import arkanoidSound2 from '@/shared/assets/games/arkanoid/Arkanoid_2.wav'
import arkanoidSound3 from '@/shared/assets/games/arkanoid/Arkanoid_3.wav'
import arkanoidSound4 from '@/shared/assets/games/arkanoid/Arkanoid_4.wav'
import arkanoidSound5 from '@/shared/assets/games/arkanoid/Arkanoid_5.wav'
import arkanoidSound6 from '@/shared/assets/games/arkanoid/Arkanoid_6.wav'
import arkanoidSound7 from '@/shared/assets/games/arkanoid/Arkanoid_7.wav'
import arkanoidSound8 from '@/shared/assets/games/arkanoid/Arkanoid_8.wav'
import './Arkanoid.css'

type Props = {
  onComplete: () => void
}

type BrickType = 'normal' | 'hard' | 'strong' | 'indestructible'

type BrickColor = 'green' | 'blue' | 'red' | 'brown' | 'black'

type PowerUpType = 'wide' | 'triple' | 'shot' | 'fire'

type Brick = {
  x: number
  y: number
  width: number
  height: number
  type: BrickType
  hp: number
  maxHp: number
  color: BrickColor
  powerUp?: PowerUpType
}

type Ball = {
  x: number
  y: number
  radius: number
  vx: number
  vy: number
  fire?: boolean
}

type FallingPowerUp = {
  x: number
  y: number
  width: number
  height: number
  type: PowerUpType
  speed: number
}

type GameState = {
  level: number
  score: number
  lives: number

  paddle: {
    x: number
    y: number
    width: number
    height: number
    baseWidth: number
    speed: number
  }

  balls: Ball[]
  bricks: Brick[]
  powerUps: FallingPowerUp[]

  wideTimer: number

  fireShotsRemaining: number
  fireShotTimer: number

  running: boolean
  started: boolean
  won: boolean
  gameOver: boolean
}

const CANVAS_WIDTH = 900
const CANVAS_HEIGHT = 600

// Очень низкое внутреннее разрешение создаёт выраженный pixel-art эффект
// при растягивании Canvas до размера игрового поля: один логический пиксель
// превращается примерно в 3x3 физических пикселя.
const PIXEL_CANVAS_WIDTH = 300
const PIXEL_CANVAS_HEIGHT = 200
const PIXEL_SCALE = PIXEL_CANVAS_WIDTH / CANVAS_WIDTH

const STORAGE_KEY = 'arkanoid-progress-v1'

const TOTAL_LEVELS = 5

const PADDLE_BASE_WIDTH = 110
const PADDLE_HEIGHT = 16

const BALL_RADIUS = 8

const POWERUP_SIZE = 28
const POWERUP_SPEED = 2.1

const WIDE_DURATION = 600

const FIRE_SHOT_INTERVAL = 500
const FIRE_SHOT_COUNT = 10

const colors = {
  green: '#5A8D3E',
  blue: '#0346FD',
  red: '#C80651',
  brown: '#6E4125',
  black: '#010101',
}

/*
 * =========================================================
 * HP КИРПИЧЕЙ
 *
 * 0 = пусто
 * 1 = обычный кирпич, 1 HP
 * 2 = крепкий кирпич, 2 HP
 * 3 = крепкий кирпич, 3 HP
 * 9 = неразрушимый кирпич
 * =========================================================
 */

const LEVEL_LAYOUTS: number[][][] = [
  // Уровень 1
  [
    [0, 0, 1, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 1, 1, 1, 1, 1, 0],
    [1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1],
  ],

  // Уровень 2
  [
    [9, 0, 1, 2, 1, 2, 1, 0, 9],
    [1, 1, 2, 1, 1, 1, 2, 1, 1],
    [0, 2, 1, 1, 3, 1, 1, 2, 0],
    [1, 1, 1, 2, 1, 2, 1, 1, 1],
    [9, 1, 1, 1, 1, 1, 1, 1, 9],
  ],

  // Уровень 3
  [
    [9, 2, 1, 3, 1, 3, 1, 2, 9],
    [2, 1, 3, 1, 9, 1, 3, 1, 2],
    [1, 3, 1, 2, 2, 2, 1, 3, 1],
    [2, 1, 3, 1, 9, 1, 3, 1, 2],
    [9, 2, 1, 3, 1, 3, 1, 2, 9],
  ],

  // Уровень 4
  [
    [9, 9, 2, 3, 1, 3, 2, 9, 9],
    [9, 2, 3, 1, 9, 1, 3, 2, 9],
    [2, 3, 1, 9, 9, 9, 1, 3, 2],
    [9, 2, 3, 1, 9, 1, 3, 2, 9],
    [9, 9, 2, 3, 1, 3, 2, 9, 9],
  ],

  // Уровень 5
  [
    [9, 3, 2, 1, 9, 9, 1, 2, 3, 9],
    [3, 2, 1, 9, 2, 2, 9, 1, 2, 3],
    [2, 1, 9, 3, 1, 1, 3, 9, 1, 2],
    [3, 2, 1, 9, 2, 2, 9, 1, 2, 3],
    [9, 3, 2, 1, 9, 9, 1, 2, 3, 9],
  ],
]

/*
 * =========================================================
 * ЦВЕТА КИРПИЧЕЙ
 *
 * Здесь НЕ хранится HP.
 * Здесь только рисунок.
 *
 * null = пустое место
 * green = зелёный
 * blue = синий
 * red = красный
 * black = чёрный
 *
 * Цвет не изменяется при повреждении кирпича.
 * =========================================================
 */

const LEVEL_COLOR_LAYOUTS: (BrickColor | null)[][][] = [
  // Уровень 1
  [
    [null, null, 'red', 'red', 'blue', null, null, null, null],
    [null, 'green', 'green', 'green', 'green', 'green', 'green', 'green', null],
    ['red', 'blue', 'green', 'green', 'green', 'green', 'green', 'blue', 'red'],
    ['red', 'blue', 'green', 'green', 'green', 'green', 'green', 'blue', 'red'],
  ],

  // Уровень 2
  [
    ['black', null, 'red', 'blue', 'red', 'blue', 'red', null, 'black'],
    ['green', 'green', 'blue', 'green', 'green', 'green', 'blue', 'green', 'green'],
    [null, 'blue', 'red', 'black', 'red', 'black', 'red', 'blue', null],
    ['green', 'green', 'blue', 'red', 'green', 'red', 'blue', 'green', 'green'],
    ['black', 'red', 'green', 'green', 'green', 'green', 'green', 'green', 'black'],
  ],

  // Уровень 3
  [
    ['black', 'red', 'blue', 'red', 'green', 'red', 'green', 'blue', 'black'],
    ['red', 'blue', 'green', 'red', 'black', 'red', 'green', 'blue', 'red'],
    ['blue', 'green', 'red', 'black', 'black', 'black', 'red', 'green', 'blue'],
    ['red', 'blue', 'green', 'red', 'black', 'red', 'green', 'blue', 'red'],
    ['black', 'red', 'blue', 'red', 'green', 'red', 'green', 'blue', 'black'],
  ],

  // Уровень 4
  [
    ['black', 'black', 'blue', 'red', 'green', 'red', 'blue', 'black', 'black'],
    ['black', 'blue', 'red', 'green', 'black', 'green', 'red', 'blue', 'black'],
    ['blue', 'red', 'green', 'black', 'black', 'black', 'green', 'red', 'blue'],
    ['black', 'blue', 'red', 'green', 'black', 'green', 'red', 'blue', 'black'],
    ['black', 'black', 'blue', 'red', 'green', 'red', 'blue', 'black', 'black'],
  ],

  // Уровень 5
  [
    ['black', 'red', 'blue', 'green', 'black', 'black', 'green', 'blue', 'red', 'black'],
    ['red', 'blue', 'green', 'black', 'blue', 'blue', 'black', 'green', 'blue', 'red'],
    ['blue', 'green', 'black', 'red', 'green', 'green', 'red', 'black', 'green', 'blue'],
    ['red', 'blue', 'green', 'black', 'blue', 'blue', 'black', 'green', 'blue', 'red'],
    ['black', 'red', 'blue', 'green', 'black', 'black', 'green', 'blue', 'red', 'black'],
  ],
]

function getBallSpeed(level: number) {
  const speeds = [2.8, 3.0, 3.2, 3.4, 3.6]

  return speeds[Math.min(level - 1, speeds.length - 1)]
}

function getBrickStats(value: number): {
  type: BrickType
  hp: number
} {
  switch (value) {
    case 9:
      return {
        type: 'indestructible',
        hp: Infinity,
      }

    case 3:
      return {
        type: 'strong',
        hp: 3,
      }

    case 2:
      return {
        type: 'hard',
        hp: 2,
      }

    default:
      return {
        type: 'normal',
        hp: 1,
      }
  }
}

function randomPowerUp(): PowerUpType | undefined {
  if (Math.random() > 0.08) {
    return undefined
  }

  const roll = Math.random()

  if (roll < 0.4) {
    return 'wide'
  }

  if (roll < 0.7) {
    return 'triple'
  }

  if (roll < 0.9) {
    return 'shot'
  }

  return 'fire'
}

function createBricks(level: number): Brick[] {
  const levelIndex = Math.min(level - 1, LEVEL_LAYOUTS.length - 1)

  const layout = LEVEL_LAYOUTS[levelIndex]

  const colorLayout = LEVEL_COLOR_LAYOUTS[levelIndex]

  const gap = 6
  const marginX = 65
  const top = 70

  const rows = layout.length
  const columns = layout[0]?.length ?? 0

  const brickWidth = (CANVAS_WIDTH - marginX * 2 - gap * (columns - 1)) / columns

  const brickHeight = 28

  const bricks: Brick[] = []

  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++) {
      const value = layout[row][column]

      if (value === 0) {
        continue
      }

      const stats = getBrickStats(value)

      const color = colorLayout?.[row]?.[column] ?? 'blue'

      bricks.push({
        x: marginX + column * (brickWidth + gap),

        y: top + row * (brickHeight + gap),

        width: brickWidth,
        height: brickHeight,

        type: stats.type,

        hp: stats.hp,
        maxHp: stats.hp,

        color,

        powerUp: stats.type !== 'indestructible' ? randomPowerUp() : undefined,
      })
    }
  }

  return bricks
}

function createInitialGame(level: number): GameState {
  const paddleWidth = PADDLE_BASE_WIDTH

  const paddle = {
    x: CANVAS_WIDTH / 2 - paddleWidth / 2,

    y: CANVAS_HEIGHT - 45,

    width: paddleWidth,
    height: PADDLE_HEIGHT,

    baseWidth: paddleWidth,

    speed: 8,
  }

  const speed = getBallSpeed(level)

  const ball: Ball = {
    x: CANVAS_WIDTH / 2,

    y: paddle.y - BALL_RADIUS - 3,

    radius: BALL_RADIUS,

    vx: speed * 0.7,
    vy: -speed,

    fire: false,
  }

  return {
    level,

    score: 0,
    lives: 3,

    paddle,

    balls: [ball],

    bricks: createBricks(level),

    powerUps: [],

    wideTimer: 0,

    fireShotsRemaining: 0,
    fireShotTimer: 0,

    running: false,
    started: false,
    won: false,
    gameOver: false,
  }
}

function loadProgress() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)

    if (!saved) {
      return {
        currentLevel: 1,
        unlockedLevel: 1,
        completed: false,
      }
    }

    return JSON.parse(saved)
  } catch {
    return {
      currentLevel: 1,
      unlockedLevel: 1,
      completed: false,
    }
  }
}

function saveProgress(currentLevel: number, unlockedLevel: number, completed: boolean) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      currentLevel,
      unlockedLevel,
      completed,
    }),
  )
}

export function Arkanoid({ onComplete }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const animationRef = useRef<number | null>(null)

  const audioRef = useRef({
    launch: null as HTMLAudioElement | null,
    hit: null as HTMLAudioElement | null,
    destroy: null as HTMLAudioElement | null,
    powerUp: null as HTMLAudioElement | null,
    levelComplete: null as HTMLAudioElement | null,
    gameOver: null as HTMLAudioElement | null,
    lifeLost: null as HTMLAudioElement | null,
    platformBounce: null as HTMLAudioElement | null,
  })

  const gameRef = useRef<GameState | null>(createInitialGame(loadProgress().currentLevel))

  const keysRef = useRef({
    left: false,
    right: false,
  })

  const [unlockedLevel, setUnlockedLevel] = useState(() => loadProgress().unlockedLevel)

  const [, setSelectedLevel] = useState(() => loadProgress().currentLevel)

  const [level, setLevel] = useState(() => loadProgress().currentLevel)

  const [score, setScore] = useState(0)

  const [lives, setLives] = useState(3)

  const [won, setWon] = useState(false)

  const [gameOver, setGameOver] = useState(false)

  const [started, setStarted] = useState(false)
  const [completedLevels, setCompletedLevels] = useState(0)

  const [activePowerUps, setActivePowerUps] = useState<PowerUpType[]>([])

  useEffect(() => {
    audioRef.current.launch = new Audio(arkanoidSound1)
    audioRef.current.hit = new Audio(arkanoidSound2)
    audioRef.current.destroy = new Audio(arkanoidSound3)
    audioRef.current.powerUp = new Audio(arkanoidSound4)
    audioRef.current.levelComplete = new Audio(arkanoidSound5)
    audioRef.current.gameOver = new Audio(arkanoidSound6)
    audioRef.current.lifeLost = new Audio(arkanoidSound7)
    audioRef.current.platformBounce = new Audio(arkanoidSound8)

    for (const audio of Object.values(audioRef.current)) {
      if (audio) {
        audio.preload = 'auto'
      }
    }

    return () => {
      for (const audio of Object.values(audioRef.current)) {
        audio?.pause()
      }
    }
  }, [])

  const playSound = useCallback((key: keyof typeof audioRef.current) => {
    const audio = audioRef.current[key]

    if (!audio) {
      return
    }

    audio.currentTime = 0
    void audio.play().catch(() => undefined)
  }, [])

  const drawPowerUpIcon = useCallback((ctx: CanvasRenderingContext2D, powerUp: FallingPowerUp) => {
    const centerX = powerUp.x + powerUp.width / 2

    const centerY = powerUp.y + powerUp.height / 2

    ctx.save()

    ctx.beginPath()

    ctx.arc(centerX, centerY, powerUp.width / 2, 0, Math.PI * 2)

    if (powerUp.type === 'wide') {
      ctx.fillStyle = '#39d98a'
    } else if (powerUp.type === 'triple') {
      ctx.fillStyle = '#4d9cff'
    } else if (powerUp.type === 'shot') {
      ctx.fillStyle = '#ffbd3d'
    } else {
      ctx.fillStyle = '#ff553d'
    }

    ctx.fill()

    ctx.strokeStyle = '#ffffff'

    ctx.lineWidth = 2

    ctx.stroke()

    ctx.fillStyle = '#ffffff'

    ctx.font = 'bold 17px Arial'

    ctx.textAlign = 'center'

    ctx.textBaseline = 'middle'

    if (powerUp.type === 'wide') {
      ctx.fillText('W', centerX, centerY)
    }

    if (powerUp.type === 'triple') {
      ctx.fillText('3', centerX, centerY)
    }

    if (powerUp.type === 'shot') {
      ctx.fillText('S', centerX, centerY)
    }

    if (powerUp.type === 'fire') {
      ctx.fillText('F', centerX, centerY)
    }

    ctx.restore()
  }, [])

  const drawBrick = useCallback((ctx: CanvasRenderingContext2D, brick: Brick) => {
    ctx.save()

    /*
     * Цвет теперь полностью независим
     * от HP кирпича.
     */

    if (brick.type === 'indestructible') {
      ctx.fillStyle = '#565b63'
      ctx.strokeStyle = '#9ba1a8'
    } else {
      ctx.fillStyle = colors[brick.color]

      ctx.strokeStyle = '#ffffff'
    }

    ctx.lineWidth = 2

    ctx.fillRect(brick.x, brick.y, brick.width, brick.height)

    ctx.strokeRect(brick.x, brick.y, brick.width, brick.height)

    /*
     * Неразрушимый кирпич
     */
    if (brick.type === 'indestructible') {
      ctx.strokeStyle = '#d7dbe0'

      ctx.lineWidth = 3

      ctx.beginPath()

      ctx.moveTo(brick.x + 7, brick.y + 7)

      ctx.lineTo(brick.x + brick.width - 7, brick.y + brick.height - 7)

      ctx.moveTo(brick.x + brick.width - 7, brick.y + 7)

      ctx.lineTo(brick.x + 7, brick.y + brick.height - 7)

      ctx.stroke()
    }

    /*
     * Показываем HP только у
     * крепких кирпичей.
     */
    if (brick.type !== 'normal' && brick.type !== 'indestructible') {
      ctx.fillStyle = '#ffffff'

      ctx.font = 'bold 14px Arial'

      ctx.textAlign = 'center'

      ctx.textBaseline = 'middle'

      ctx.fillText(String(brick.hp), brick.x + brick.width / 2, brick.y + brick.height / 2)
    }

    /*
     * Точка показывает наличие
     * Power Up.
     */
    if (brick.powerUp) {
      ctx.fillStyle = '#ffffff'

      ctx.beginPath()

      ctx.arc(brick.x + brick.width - 8, brick.y + 8, 4, 0, Math.PI * 2)

      ctx.fill()
    }

    ctx.restore()
  }, [])

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, game: GameState) => {
      // Рендерим игру в 2 раза меньшем разрешении и затем
      // растягиваем Canvas без сглаживания — получается пиксельная графика.
      ctx.setTransform(PIXEL_SCALE, 0, 0, PIXEL_SCALE, 0, 0)
      ctx.imageSmoothingEnabled = false

      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

      const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT)

      gradient.addColorStop(0, '#101827')

      gradient.addColorStop(1, '#05080d')

      ctx.fillStyle = gradient

      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

      ctx.strokeStyle = 'rgba(255,255,255,0.04)'

      ctx.lineWidth = 1

      for (let x = 0; x < CANVAS_WIDTH; x += 45) {
        ctx.beginPath()

        ctx.moveTo(x, 0)

        ctx.lineTo(x, CANVAS_HEIGHT)

        ctx.stroke()
      }

      for (let y = 0; y < CANVAS_HEIGHT; y += 45) {
        ctx.beginPath()

        ctx.moveTo(0, y)

        ctx.lineTo(CANVAS_WIDTH, y)

        ctx.stroke()
      }

      for (const brick of game.bricks) {
        drawBrick(ctx, brick)
      }

      ctx.save()

      if (game.wideTimer > 0) {
        const remainingRatio = Math.max(0, Math.min(1, game.wideTimer / WIDE_DURATION))
        const whiteRatio = 1 - remainingRatio

        const r = Math.round(57 + (255 - 57) * whiteRatio)
        const g = Math.round(217 + (255 - 217) * whiteRatio)
        const b = Math.round(138 + (255 - 138) * whiteRatio)

        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`
        ctx.shadowColor = `rgb(${r}, ${g}, ${b})`
        ctx.shadowBlur = 12
      } else {
        ctx.fillStyle = '#f2f2f2'
        ctx.shadowColor = 'transparent'
        ctx.shadowBlur = 0
      }

      ctx.fillRect(game.paddle.x, game.paddle.y, game.paddle.width, game.paddle.height)

      ctx.restore()

      // Индикатор оставшихся жизней: на одну меньше текущего значения.
      const remainingLives = Math.max(0, game.lives - 1)
      const lifeRadius = 4
      const lifeGap = 13
      const lifeCenterY = game.paddle.y + game.paddle.height / 2
      const lifeStartX =
        game.paddle.x + game.paddle.width / 2 - ((remainingLives - 1) * lifeGap) / 2

      if (remainingLives > 0) {
        ctx.save()

        ctx.fillStyle = '#ff2f5f'
        ctx.strokeStyle = '#5a071c'
        ctx.lineWidth = 3
        ctx.shadowColor = '#ff69b4'
        ctx.shadowBlur = 12

        for (let index = 0; index < remainingLives; index++) {
          const centerX = lifeStartX + index * lifeGap

          ctx.beginPath()
          ctx.arc(centerX, lifeCenterY, lifeRadius, 0, Math.PI * 2)
          ctx.fill()
          ctx.stroke()
        }

        ctx.restore()
      }

      for (const ball of game.balls) {
        ctx.save()

        ctx.beginPath()

        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2)

        if (ball.fire) {
          ctx.fillStyle = '#ff4b2b'

          ctx.shadowColor = '#ff4b2b'

          ctx.shadowBlur = 15
        } else {
          ctx.fillStyle = '#ffffff'

          ctx.shadowColor = '#ffffff'

          ctx.shadowBlur = 10
        }

        ctx.fill()

        ctx.restore()
      }

      for (const powerUp of game.powerUps) {
        drawPowerUpIcon(ctx, powerUp)
      }
    },
    [drawBrick, drawPowerUpIcon],
  )

  const updateHud = useCallback((game: GameState) => {
    setScore(game.score)

    setLives(game.lives)

    const active: PowerUpType[] = []

    if (game.wideTimer > 0) {
      active.push('wide')
    }

    setActivePowerUps(active)
  }, [])

  const spawnFireBallFromPaddle = useCallback((game: GameState) => {
    const speed = getBallSpeed(game.level)

    const centerX = game.paddle.x + game.paddle.width / 2

    const startY = game.paddle.y - BALL_RADIUS - 4

    game.balls.push({
      x: centerX,
      y: startY,
      radius: BALL_RADIUS,
      vx: 0,
      vy: -speed,
      fire: true,
    })
  }, [])

  const activatePowerUp = useCallback(
    (game: GameState, type: PowerUpType) => {
      playSound('powerUp')

      if (type === 'wide') {
        game.wideTimer = WIDE_DURATION

        game.paddle.width = game.paddle.baseWidth * 1.65

        return
      }

      if (type === 'triple') {
        if (game.balls.length >= 6) {
          return
        }

        if (game.balls.length === 0) {
          return
        }

        const source = game.balls[Math.floor(Math.random() * game.balls.length)]

        if (!source) {
          return
        }

        const speed = Math.sqrt(source.vx * source.vx + source.vy * source.vy)

        const fire = source.fire === true

        game.balls.push(
          {
            x: source.x,
            y: source.y,
            radius: BALL_RADIUS,
            vx: -speed * 0.75,
            vy: -speed * 0.66,
            fire,
          },
          {
            x: source.x,
            y: source.y,
            radius: BALL_RADIUS,
            vx: 0,
            vy: -speed,
            fire,
          },
        )

        return
      }

      if (type === 'shot') {
        const speed = getBallSpeed(game.level)

        const centerX = game.paddle.x + game.paddle.width / 2

        const startY = game.paddle.y - BALL_RADIUS - 4

        game.balls.push(
          {
            x: centerX - 22,
            y: startY,
            radius: BALL_RADIUS,
            vx: -speed * 0.75,
            vy: -speed,
            fire: false,
          },
          {
            x: centerX,
            y: startY,
            radius: BALL_RADIUS,
            vx: 0,
            vy: -speed,
            fire: false,
          },
          {
            x: centerX + 22,
            y: startY,
            radius: BALL_RADIUS,
            vx: speed * 0.75,
            vy: -speed,
            fire: false,
          },
        )

        return
      }

      if (type === 'fire') {
        game.fireShotsRemaining = FIRE_SHOT_COUNT

        game.fireShotTimer = FIRE_SHOT_INTERVAL
      }
    },
    [playSound],
  )

  const loseLife = useCallback(
    (game: GameState) => {
      game.lives -= 1

      setLives(game.lives)

      game.fireShotsRemaining = 0
      game.fireShotTimer = 0

      if (game.lives <= 0) {
        const passedLevels = Math.max(0, game.level - 1)

        game.running = false
        game.gameOver = true

        setCompletedLevels(passedLevels)
        playSound('gameOver')
        setGameOver(true)

        // После потери всех жизней прогресс полностью сбрасывается.
        saveProgress(1, 1, false)
        setUnlockedLevel(1)
        setSelectedLevel(1)
        setLevel(1)

        return
      }

      playSound('lifeLost')

      const speed = getBallSpeed(game.level)

      game.paddle.x = CANVAS_WIDTH / 2 - game.paddle.width / 2

      game.balls = [
        {
          x: CANVAS_WIDTH / 2,

          y: game.paddle.y - BALL_RADIUS - 3,

          radius: BALL_RADIUS,

          vx: 0,

          vy: -speed,

          fire: false,
        },
      ]

      game.running = false
      game.started = false
      setStarted(false)

      game.powerUps = []
    },
    [playSound],
  )

  const hitBrick = useCallback(
    (game: GameState, brick: Brick, fireBall: boolean) => {
      if (brick.type === 'indestructible') {
        if (fireBall) {
          return false
        }

        return true
      }

      if (fireBall) {
        playSound('destroy')
        game.score += brick.type === 'strong' ? 30 : brick.type === 'hard' ? 20 : 10

        if (brick.powerUp) {
          game.powerUps.push({
            x: brick.x + brick.width / 2 - POWERUP_SIZE / 2,

            y: brick.y + brick.height,

            width: POWERUP_SIZE,

            height: POWERUP_SIZE,

            type: brick.powerUp,

            speed: POWERUP_SPEED,
          })
        }

        brick.hp = 0

        return true
      }

      brick.hp -= 1

      if (brick.hp > 0) {
        playSound('hit')
        game.score += 5

        return true
      }

      playSound('destroy')
      game.score += brick.type === 'strong' ? 30 : brick.type === 'hard' ? 20 : 10

      if (brick.powerUp) {
        game.powerUps.push({
          x: brick.x + brick.width / 2 - POWERUP_SIZE / 2,

          y: brick.y + brick.height,

          width: POWERUP_SIZE,

          height: POWERUP_SIZE,

          type: brick.powerUp,

          speed: POWERUP_SPEED,
        })
      }

      brick.hp = 0

      return true
    },
    [playSound],
  )

  const checkLevelComplete = useCallback(
    (game: GameState) => {
      const remaining = game.bricks.some((brick) => brick.type !== 'indestructible' && brick.hp > 0)

      if (remaining) {
        return false
      }

      game.running = false
      game.won = true

      setWon(true)
      setCompletedLevels(game.level)
      playSound('levelComplete')

      if (game.level >= TOTAL_LEVELS) {
        saveProgress(TOTAL_LEVELS, TOTAL_LEVELS, true)

        setUnlockedLevel(TOTAL_LEVELS)

        return true
      }

      const nextLevel = game.level + 1

      const nextUnlocked = Math.max(unlockedLevel, nextLevel)

      saveProgress(nextLevel, nextUnlocked, false)

      setUnlockedLevel(nextUnlocked)

      return true
    },
    [playSound, unlockedLevel],
  )

  const update = useCallback(
    (game: GameState, deltaTime: number) => {
      const dt = Math.min(deltaTime, 50)

      if (keysRef.current.left) {
        game.paddle.x -= game.paddle.speed
      }

      if (keysRef.current.right) {
        game.paddle.x += game.paddle.speed
      }

      game.paddle.x = Math.max(0, Math.min(CANVAS_WIDTH - game.paddle.width, game.paddle.x))

      if (!game.running) {
        const waitingBall = game.balls[0]

        if (waitingBall) {
          waitingBall.x = game.paddle.x + game.paddle.width / 2
          waitingBall.y = game.paddle.y - BALL_RADIUS - 3
          waitingBall.vx = 0
          waitingBall.vy = 0
        }

        return
      }

      if (game.wideTimer > 0) {
        game.wideTimer--

        game.paddle.width = game.paddle.baseWidth * 1.65
      } else {
        game.paddle.width = game.paddle.baseWidth
      }

      if (game.fireShotsRemaining > 0) {
        game.fireShotTimer -= dt

        if (game.fireShotTimer <= 0) {
          spawnFireBallFromPaddle(game)

          game.fireShotsRemaining -= 1

          if (game.fireShotsRemaining > 0) {
            game.fireShotTimer += FIRE_SHOT_INTERVAL
          } else {
            game.fireShotTimer = 0
          }
        }
      }

      for (let ballIndex = game.balls.length - 1; ballIndex >= 0; ballIndex--) {
        const ball = game.balls[ballIndex]

        ball.x += ball.vx
        ball.y += ball.vy

        if (ball.x - ball.radius <= 0) {
          ball.x = ball.radius

          ball.vx = Math.abs(ball.vx)
        }

        if (ball.x + ball.radius >= CANVAS_WIDTH) {
          ball.x = CANVAS_WIDTH - ball.radius

          ball.vx = -Math.abs(ball.vx)
        }

        if (ball.y - ball.radius <= 0) {
          ball.y = ball.radius

          ball.vy = Math.abs(ball.vy)
        }

        if (
          ball.vy > 0 &&
          ball.y + ball.radius >= game.paddle.y &&
          ball.y - ball.radius <= game.paddle.y + game.paddle.height &&
          ball.x >= game.paddle.x &&
          ball.x <= game.paddle.x + game.paddle.width
        ) {
          playSound('platformBounce')
          const hit = (ball.x - (game.paddle.x + game.paddle.width / 2)) / (game.paddle.width / 2)

          const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy)

          ball.vx = hit * Math.min(speed, 3.8)

          ball.vy = -Math.max(getBallSpeed(game.level), Math.abs(ball.vy))

          ball.y = game.paddle.y - ball.radius - 1
        }

        for (let brickIndex = 0; brickIndex < game.bricks.length; brickIndex++) {
          const brick = game.bricks[brickIndex]

          if (brick.hp <= 0) {
            continue
          }

          const closestX = Math.max(brick.x, Math.min(ball.x, brick.x + brick.width))

          const closestY = Math.max(brick.y, Math.min(ball.y, brick.y + brick.height))

          const dx = ball.x - closestX

          const dy = ball.y - closestY

          const distance = dx * dx + dy * dy

          if (distance > ball.radius * ball.radius) {
            continue
          }

          if (brick.type === 'indestructible') {
            if (ball.fire) {
              continue
            }

            const previousX = ball.x - ball.vx

            const previousY = ball.y - ball.vy

            if (previousX + ball.radius <= brick.x && ball.x + ball.radius >= brick.x) {
              ball.x = brick.x - ball.radius

              ball.vx = -Math.abs(ball.vx)

              break
            }

            if (
              previousX - ball.radius >= brick.x + brick.width &&
              ball.x - ball.radius <= brick.x + brick.width
            ) {
              ball.x = brick.x + brick.width + ball.radius

              ball.vx = Math.abs(ball.vx)

              break
            }

            if (previousY + ball.radius <= brick.y && ball.y + ball.radius >= brick.y) {
              ball.y = brick.y - ball.radius

              ball.vy = -Math.abs(ball.vy)

              break
            }

            if (
              previousY - ball.radius >= brick.y + brick.height &&
              ball.y - ball.radius <= brick.y + brick.height
            ) {
              ball.y = brick.y + brick.height + ball.radius

              ball.vy = Math.abs(ball.vy)

              break
            }

            const overlapLeft = ball.x + ball.radius - brick.x

            const overlapRight = brick.x + brick.width - (ball.x - ball.radius)

            const overlapTop = ball.y + ball.radius - brick.y

            const overlapBottom = brick.y + brick.height - (ball.y - ball.radius)

            const minHorizontal = Math.min(overlapLeft, overlapRight)

            const minVertical = Math.min(overlapTop, overlapBottom)

            if (minHorizontal < minVertical) {
              if (ball.x < brick.x + brick.width / 2) {
                ball.x = brick.x - ball.radius

                ball.vx = -Math.abs(ball.vx)
              } else {
                ball.x = brick.x + brick.width + ball.radius

                ball.vx = Math.abs(ball.vx)
              }
            } else {
              if (ball.y < brick.y + brick.height / 2) {
                ball.y = brick.y - ball.radius

                ball.vy = -Math.abs(ball.vy)
              } else {
                ball.y = brick.y + brick.height + ball.radius

                ball.vy = Math.abs(ball.vy)
              }
            }

            break
          }

          const wasFireBall = ball.fire === true

          const hit = hitBrick(game, brick, wasFireBall)

          if (wasFireBall && hit) {
            game.balls.splice(ballIndex, 1)

            break
          }

          ball.vy = -ball.vy

          break
        }
      }

      game.bricks = game.bricks.filter((brick) => brick.hp > 0 || brick.type === 'indestructible')

      game.balls = game.balls.filter((ball) => ball.y - ball.radius <= CANVAS_HEIGHT)

      if (game.balls.length === 0) {
        loseLife(game)
      }

      for (let i = game.powerUps.length - 1; i >= 0; i--) {
        const powerUp = game.powerUps[i]

        powerUp.y += powerUp.speed

        const caught =
          powerUp.y + powerUp.height >= game.paddle.y &&
          powerUp.y <= game.paddle.y + game.paddle.height &&
          powerUp.x + powerUp.width >= game.paddle.x &&
          powerUp.x <= game.paddle.x + game.paddle.width

        if (caught) {
          activatePowerUp(game, powerUp.type)

          game.powerUps.splice(i, 1)

          continue
        }

        if (powerUp.y > CANVAS_HEIGHT) {
          game.powerUps.splice(i, 1)
        }
      }

      checkLevelComplete(game)

      updateHud(game)
    },
    [activatePowerUp, checkLevelComplete, hitBrick, loseLife, spawnFireBallFromPaddle, updateHud],
  )

  const startGame = useCallback(
    (selected: number) => {
      if (selected < 1 || selected > unlockedLevel) {
        return
      }

      const game = createInitialGame(selected)

      game.running = false
      game.started = false

      gameRef.current = game

      setLevel(selected)
      setSelectedLevel(selected)

      setScore(0)
      setLives(3)
      setCompletedLevels(Math.max(0, selected - 1))

      setWon(false)
      setGameOver(false)
      setStarted(false)

      setActivePowerUps([])
    },
    [unlockedLevel],
  )

  const launchBall = useCallback(() => {
    const game = gameRef.current

    if (!game || game.gameOver || game.won || game.running) {
      return
    }

    const ball = game.balls[0]

    if (!ball) {
      return
    }

    const speed = getBallSpeed(game.level)

    playSound('launch')

    ball.x = game.paddle.x + game.paddle.width / 2
    ball.y = game.paddle.y - BALL_RADIUS - 3
    ball.vx = 0
    ball.vy = -speed
    ball.fire = false

    game.running = true
    game.started = true
    setStarted(true)
  }, [playSound])

  const nextLevel = useCallback(() => {
    if (level >= TOTAL_LEVELS) {
      onComplete()
      return
    }

    const next = level + 1

    setSelectedLevel(next)

    startGame(next)
  }, [level, onComplete, startGame])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase()

      if (event.key === 'ArrowLeft' || key === 'a' || key === 'ф') {
        keysRef.current.left = true
        event.preventDefault()
      }

      if (event.key === 'ArrowRight' || key === 'd' || key === 'в') {
        keysRef.current.right = true
        event.preventDefault()
      }

      if (event.code === 'Space') {
        event.preventDefault()
        if (!event.repeat) {
          launchBall()
        }
      }
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase()

      if (event.key === 'ArrowLeft' || key === 'a' || key === 'ф') {
        keysRef.current.left = false
      }

      if (event.key === 'ArrowRight' || key === 'd' || key === 'в') {
        keysRef.current.right = false
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [launchBall])

  useEffect(() => {
    const canvas = canvasRef.current

    if (!canvas) {
      return
    }

    const ctx = canvas.getContext('2d')

    if (!ctx) {
      return
    }

    let previousTime: number | null = null

    const loop = (timestamp: number) => {
      const game = gameRef.current

      if (previousTime === null) {
        previousTime = timestamp
      }

      const deltaTime = timestamp - previousTime

      previousTime = timestamp

      if (game) {
        update(game, deltaTime)

        draw(ctx, game)
      }

      animationRef.current = requestAnimationFrame(loop)
    }

    animationRef.current = requestAnimationFrame(loop)

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [draw, update])

  const getPowerUpName = (type: PowerUpType) => {
    switch (type) {
      case 'wide':
        return 'Широкая палочка'

      case 'triple':
        return 'Разделение шара'

      case 'shot':
        return 'Три обычных шара'

      case 'fire':
        return 'Огненная стрельба'

      default:
        return ''
    }
  }

  return (
    <div
      className="arkanoid"
      style={
        {
          '--arkanoid-width': ARKANOID_LAYOUT.width,
          '--arkanoid-height': ARKANOID_LAYOUT.height,
          '--arkanoid-x': ARKANOID_LAYOUT.x,
          '--arkanoid-y': ARKANOID_LAYOUT.y,
        } as CSSProperties
      }
    >
      <div className="arkanoid__header">
        <div>
          <strong>
            Уровень {level} / {TOTAL_LEVELS}
          </strong>

          <span>Очки: {score}</span>

          <span>Жизни: {lives}</span>
        </div>

        <div className="arkanoid__levels">
          {Array.from(
            {
              length: TOTAL_LEVELS,
            },
            (_, index) => {
              const current = index + 1

              const unlocked = current <= unlockedLevel

              return (
                <button
                  key={current}
                  type="button"
                  disabled={!unlocked}
                  className={
                    current === level
                      ? 'arkanoid__level arkanoid__level--active'
                      : 'arkanoid__level'
                  }
                  onClick={() => {
                    if (unlocked) {
                      startGame(current)
                    }
                  }}
                >
                  {current}
                </button>
              )
            },
          )}
        </div>
      </div>

      <div className="arkanoid__powerups">
        {activePowerUps.map((powerUp) => (
          <span key={powerUp} className="arkanoid__powerup-active">
            {getPowerUpName(powerUp)}
          </span>
        ))}
      </div>

      <div className="arkanoid__canvas-wrap">
        <canvas
          ref={canvasRef}
          width={PIXEL_CANVAS_WIDTH}
          height={PIXEL_CANVAS_HEIGHT}
          className="arkanoid__canvas"
          style={{
            width: '100%',
            height: '100%',
            imageRendering: 'pixelated',
            filter: 'contrast(1.18) saturate(1.22) brightness(0.97)',
          }}
        />

        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 2,
            background: `repeating-linear-gradient(
              to bottom,
              rgba(255, 255, 255, 0.065) 0px,
              rgba(255, 255, 255, 0.065) 1px,
              transparent 1px,
              transparent 3px
            )`,
            boxShadow: `
              inset 0 0 32px rgba(255, 70, 150, 0.20),
              inset 0 0 80px rgba(30, 110, 255, 0.15)
            `,
            mixBlendMode: 'screen',
          }}
        />

        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 2,
            background: `radial-gradient(
              ellipse at center,
              transparent 58%,
              rgba(0, 0, 0, 0.18) 78%,
              rgba(0, 0, 0, 0.52) 100%
            )`,
          }}
        />

        {!started && !won && !gameOver && (
          <div
            className="arkanoid__overlay arkanoid__overlay--ready"
            style={{ background: 'transparent', pointerEvents: 'none' }}
          >
            <p>Нажмите Space, чтобы запустить шар</p>
          </div>
        )}

        {gameOver && (
          <div className="arkanoid__overlay">
            <h2>Игра окончена</h2>

            <p>Очки: {score}</p>
            <p>
              Пройдено уровней: {completedLevels} из {TOTAL_LEVELS}
            </p>

            <button type="button" onClick={() => startGame(1)}>
              Попробовать снова
            </button>
          </div>
        )}

        {won && (
          <div className="arkanoid__overlay">
            <h2>{level >= TOTAL_LEVELS ? 'Все уровни пройдены!' : `Уровень ${level} пройден!`}</h2>

            <p>Очки: {score}</p>
            <p>
              Пройдено уровней: {completedLevels} из {TOTAL_LEVELS}
            </p>

            {level < TOTAL_LEVELS ? (
              <button type="button" onClick={nextLevel}>
                Следующий уровень
              </button>
            ) : (
              <button type="button" onClick={onComplete}>
                Завершить
              </button>
            )}
          </div>
        )}
      </div>

      <div className="arkanoid__legend">
        <span>
          <b>W</b> — широкая палочка
        </span>

        <span>
          <b>3</b> — текущий шар разделяется на 3
        </span>

        <span>
          <b>S</b> — из палочки вылетают 3 обычных шара
        </span>

        <span>
          <b>F</b> — 10 огненных шаров по одному каждые 0,5 сек.
        </span>
      </div>
    </div>
  )
}
