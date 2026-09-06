import { useCallback, useEffect, useRef, useState } from 'react'
import './Arkanoid.css'

type Props = {
  onComplete: () => void
}

type BrickType =
  | 'normal'
  | 'hard'
  | 'strong'
  | 'indestructible'

type PowerUpType =
  | 'wide'
  | 'triple'
  | 'shot'
  | 'fire'

type Brick = {
  x: number
  y: number
  width: number
  height: number
  type: BrickType
  hp: number
  maxHp: number
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

const LEVEL_LAYOUTS: number[][][] = [
  [
    [0, 0, 1, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 1, 1, 1, 1, 1, 0],
    [1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1],
  ],

  [
    [9, 0, 1, 2, 1, 2, 1, 0, 9],
    [1, 1, 2, 1, 1, 1, 2, 1, 1],
    [0, 2, 1, 1, 3, 1, 1, 2, 0],
    [1, 1, 1, 2, 1, 2, 1, 1, 1],
    [9, 1, 1, 1, 1, 1, 1, 1, 9],
  ],

  [
    [9, 2, 1, 3, 1, 3, 1, 2, 9],
    [2, 1, 3, 1, 9, 1, 3, 1, 2],
    [1, 3, 1, 2, 2, 2, 1, 3, 1],
    [2, 1, 3, 1, 9, 1, 3, 1, 2],
    [9, 2, 1, 3, 1, 3, 1, 2, 9],
  ],

  [
    [9, 9, 2, 3, 1, 3, 2, 9, 9],
    [9, 2, 3, 1, 9, 1, 3, 2, 9],
    [2, 3, 1, 9, 9, 9, 1, 3, 2],
    [9, 2, 3, 1, 9, 1, 3, 2, 9],
    [9, 9, 2, 3, 1, 3, 2, 9, 9],
  ],

  [
    [9, 3, 2, 1, 9, 9, 1, 2, 3, 9],
    [3, 2, 1, 9, 2, 2, 9, 1, 2, 3],
    [2, 1, 9, 3, 1, 1, 3, 9, 1, 2],
    [3, 2, 1, 9, 2, 2, 9, 1, 2, 3],
    [9, 3, 2, 1, 9, 9, 1, 2, 3, 9],
  ],
]

function getBallSpeed(level: number) {
  const speeds = [2.8, 3.0, 3.2, 3.4, 3.6]

  return speeds[
    Math.min(level - 1, speeds.length - 1)
  ]
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
  // 4% шанс вообще получить паверап
  if (Math.random() > 0.08) {
    return undefined
  }

  // Распределение типов:
  // W = 40%
  // 3 = 30%
  // S = 20%
  // F = 10%

  const roll = Math.random()

  if (roll < 0.40) {
    return 'wide'
  }

  if (roll < 0.70) {
    return 'triple'
  }

  if (roll < 0.90) {
    return 'shot'
  }

  return 'fire'
}

function createBricks(level: number): Brick[] {
  const layout =
    LEVEL_LAYOUTS[
      Math.min(
        level - 1,
        LEVEL_LAYOUTS.length - 1,
      )
    ]

  const gap = 6
  const marginX = 65
  const top = 70

  const rows = layout.length
  const columns =
    layout[0]?.length ?? 0

  const brickWidth =
    (CANVAS_WIDTH -
      marginX * 2 -
      gap * (columns - 1)) /
    columns

  const brickHeight = 28

  const bricks: Brick[] = []

  for (
    let row = 0;
    row < rows;
    row++
  ) {
    for (
      let column = 0;
      column < columns;
      column++
    ) {
      const value =
        layout[row][column]

      if (value === 0) {
        continue
      }

      const stats =
        getBrickStats(value)

      bricks.push({
        x:
          marginX +
          column *
            (brickWidth + gap),

        y:
          top +
          row *
            (brickHeight + gap),

        width: brickWidth,
        height: brickHeight,

        type: stats.type,

        hp: stats.hp,
        maxHp: stats.hp,

        powerUp:
          stats.type !==
          'indestructible'
            ? randomPowerUp()
            : undefined,
      })
    }
  }

  return bricks
}

function createInitialGame(
  level: number,
): GameState {
  const paddleWidth =
    PADDLE_BASE_WIDTH

  const paddle = {
    x:
      CANVAS_WIDTH / 2 -
      paddleWidth / 2,

    y:
      CANVAS_HEIGHT - 45,

    width: paddleWidth,
    height: PADDLE_HEIGHT,

    baseWidth: paddleWidth,

    speed: 8,
  }

  const speed =
    getBallSpeed(level)

  const ball: Ball = {
    x: CANVAS_WIDTH / 2,

    y:
      paddle.y -
      BALL_RADIUS -
      3,

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

    bricks:
      createBricks(level),

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
    const saved =
      localStorage.getItem(
        STORAGE_KEY,
      )

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

function saveProgress(
  currentLevel: number,
  unlockedLevel: number,
  completed: boolean,
) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      currentLevel,
      unlockedLevel,
      completed,
    }),
  )
}

export function Arkanoid({
  onComplete,
}: Props) {
  const canvasRef =
    useRef<HTMLCanvasElement | null>(
      null,
    )

  const animationRef =
    useRef<number | null>(null)

  const gameRef =
    useRef<GameState | null>(null)

  const keysRef = useRef({
    left: false,
    right: false,
  })

  const [unlockedLevel, setUnlockedLevel] =
    useState(
      () =>
        loadProgress()
          .unlockedLevel,
    )

  const [selectedLevel, setSelectedLevel] =
    useState(
      () =>
        loadProgress()
          .currentLevel,
    )

  const [level, setLevel] =
    useState(
      () =>
        loadProgress()
          .currentLevel,
    )

  const [score, setScore] =
    useState(0)

  const [lives, setLives] =
    useState(3)

  const [won, setWon] =
    useState(false)

  const [gameOver, setGameOver] =
    useState(false)

  const [started, setStarted] =
    useState(false)

  const [activePowerUps, setActivePowerUps] =
    useState<PowerUpType[]>([])

  const drawPowerUpIcon =
    useCallback(
      (
        ctx: CanvasRenderingContext2D,
        powerUp: FallingPowerUp,
      ) => {
        const centerX =
          powerUp.x +
          powerUp.width / 2

        const centerY =
          powerUp.y +
          powerUp.height / 2

        ctx.save()

        ctx.beginPath()

        ctx.arc(
          centerX,
          centerY,
          powerUp.width / 2,
          0,
          Math.PI * 2,
        )

        if (
          powerUp.type ===
          'wide'
        ) {
          ctx.fillStyle =
            '#39d98a'
        } else if (
          powerUp.type ===
          'triple'
        ) {
          ctx.fillStyle =
            '#4d9cff'
        } else if (
          powerUp.type ===
          'shot'
        ) {
          ctx.fillStyle =
            '#ffbd3d'
        } else {
          ctx.fillStyle =
            '#ff553d'
        }

        ctx.fill()

        ctx.strokeStyle =
          '#ffffff'

        ctx.lineWidth = 2

        ctx.stroke()

        ctx.fillStyle =
          '#ffffff'

        ctx.font =
          'bold 17px Arial'

        ctx.textAlign =
          'center'

        ctx.textBaseline =
          'middle'

        if (
          powerUp.type ===
          'wide'
        ) {
          ctx.fillText(
            'W',
            centerX,
            centerY,
          )
        }

        if (
          powerUp.type ===
          'triple'
        ) {
          ctx.fillText(
            '3',
            centerX,
            centerY,
          )
        }

        if (
          powerUp.type ===
          'shot'
        ) {
          ctx.fillText(
            'S',
            centerX,
            centerY,
          )
        }

        if (
          powerUp.type ===
          'fire'
        ) {
          ctx.fillText(
            'F',
            centerX,
            centerY,
          )
        }

        ctx.restore()
      },
      [],
    )

  const drawBrick =
    useCallback(
      (
        ctx: CanvasRenderingContext2D,
        brick: Brick,
      ) => {
        ctx.save()

        if (
          brick.type ===
          'indestructible'
        ) {
          ctx.fillStyle =
            '#565b63'

          ctx.strokeStyle =
            '#9ba1a8'
        } else if (
          brick.type ===
          'strong'
        ) {
          ctx.fillStyle =
            brick.hp === 3
              ? '#9b59b6'
              : '#6f3d84'

          ctx.strokeStyle =
            '#d8a9ec'
        } else if (
          brick.type ===
          'hard'
        ) {
          ctx.fillStyle =
            brick.hp === 2
              ? '#e67e22'
              : '#a65312'

          ctx.strokeStyle =
            '#ffc078'
        } else {
          ctx.fillStyle =
            '#3b82f6'

          ctx.strokeStyle =
            '#9bc5ff'
        }

        ctx.lineWidth = 2

        ctx.fillRect(
          brick.x,
          brick.y,
          brick.width,
          brick.height,
        )

        ctx.strokeRect(
          brick.x,
          brick.y,
          brick.width,
          brick.height,
        )

        if (
          brick.type ===
          'indestructible'
        ) {
          ctx.strokeStyle =
            '#d7dbe0'

          ctx.lineWidth = 3

          ctx.beginPath()

          ctx.moveTo(
            brick.x + 7,
            brick.y + 7,
          )

          ctx.lineTo(
            brick.x +
              brick.width -
              7,
            brick.y +
              brick.height -
              7,
          )

          ctx.moveTo(
            brick.x +
              brick.width -
              7,
            brick.y + 7,
          )

          ctx.lineTo(
            brick.x + 7,
            brick.y +
              brick.height -
              7,
          )

          ctx.stroke()
        }

        if (
          brick.type !==
            'normal' &&
          brick.type !==
            'indestructible'
        ) {
          ctx.fillStyle =
            '#ffffff'

          ctx.font =
            'bold 14px Arial'

          ctx.textAlign =
            'center'

          ctx.textBaseline =
            'middle'

          ctx.fillText(
            String(brick.hp),
            brick.x +
              brick.width / 2,
            brick.y +
              brick.height / 2,
          )
        }

        if (brick.powerUp) {
          ctx.fillStyle =
            '#ffffff'

          ctx.beginPath()

          ctx.arc(
            brick.x +
              brick.width -
              8,
            brick.y + 8,
            4,
            0,
            Math.PI * 2,
          )

          ctx.fill()
        }

        ctx.restore()
      },
      [],
    )

  const draw =
    useCallback(
      (
        ctx: CanvasRenderingContext2D,
        game: GameState,
      ) => {
        ctx.clearRect(
          0,
          0,
          CANVAS_WIDTH,
          CANVAS_HEIGHT,
        )

        const gradient =
          ctx.createLinearGradient(
            0,
            0,
            0,
            CANVAS_HEIGHT,
          )

        gradient.addColorStop(
          0,
          '#101827',
        )

        gradient.addColorStop(
          1,
          '#05080d',
        )

        ctx.fillStyle =
          gradient

        ctx.fillRect(
          0,
          0,
          CANVAS_WIDTH,
          CANVAS_HEIGHT,
        )

        ctx.strokeStyle =
          'rgba(255,255,255,0.04)'

        ctx.lineWidth = 1

        for (
          let x = 0;
          x < CANVAS_WIDTH;
          x += 45
        ) {
          ctx.beginPath()

          ctx.moveTo(x, 0)

          ctx.lineTo(
            x,
            CANVAS_HEIGHT,
          )

          ctx.stroke()
        }

        for (
          let y = 0;
          y < CANVAS_HEIGHT;
          y += 45
        ) {
          ctx.beginPath()

          ctx.moveTo(0, y)

          ctx.lineTo(
            CANVAS_WIDTH,
            y,
          )

          ctx.stroke()
        }

        for (
          const brick of game.bricks
        ) {
          drawBrick(
            ctx,
            brick,
          )
        }

        ctx.save()

        ctx.fillStyle =
          game.wideTimer > 0
            ? '#39d98a'
            : '#f2f2f2'

        ctx.shadowColor =
          game.wideTimer > 0
            ? '#39d98a'
            : 'transparent'

        ctx.shadowBlur =
          game.wideTimer > 0
            ? 12
            : 0

        ctx.fillRect(
          game.paddle.x,
          game.paddle.y,
          game.paddle.width,
          game.paddle.height,
        )

        ctx.restore()

        for (
          const ball of game.balls
        ) {
          ctx.save()

          ctx.beginPath()

          ctx.arc(
            ball.x,
            ball.y,
            ball.radius,
            0,
            Math.PI * 2,
          )

          if (ball.fire) {
            ctx.fillStyle =
              '#ff4b2b'

            ctx.shadowColor =
              '#ff4b2b'

            ctx.shadowBlur = 15
          } else {
            ctx.fillStyle =
              '#ffffff'

            ctx.shadowColor =
              '#ffffff'

            ctx.shadowBlur = 10
          }

          ctx.fill()

          ctx.restore()
        }

        for (
          const powerUp of game.powerUps
        ) {
          drawPowerUpIcon(
            ctx,
            powerUp,
          )
        }
      },
      [
        drawBrick,
        drawPowerUpIcon,
      ],
    )

  const updateHud =
    useCallback(
      (game: GameState) => {
        setScore(game.score)
        setLives(game.lives)

        const active:
          PowerUpType[] = []

        if (
          game.wideTimer > 0
        ) {
          active.push('wide')
        }

        setActivePowerUps(
          active,
        )
      },
      [],
    )

  const spawnFireBallFromPaddle =
    useCallback(
      (game: GameState) => {
        const speed =
          getBallSpeed(
            game.level,
          )

        const centerX =
          game.paddle.x +
          game.paddle.width / 2

        const startY =
          game.paddle.y -
          BALL_RADIUS -
          4

        game.balls.push({
          x: centerX,
          y: startY,
          radius: BALL_RADIUS,
          vx: 0,
          vy: -speed,
          fire: true,
        })
      },
      [],
    )

  const activatePowerUp =
    useCallback(
      (
        game: GameState,
        type: PowerUpType,
      ) => {
        if (
          type === 'wide'
        ) {
          game.wideTimer =
            WIDE_DURATION

          game.paddle.width =
            game.paddle.baseWidth *
            1.65

          return
        }

        if (
          type === 'triple'
        ) {
          if (
            game.balls.length >= 6
          ) {
            return
          }

          if (
            game.balls.length ===
            0
          ) {
            return
          }

          const source =
            game.balls[
              Math.floor(
                Math.random() *
                  game.balls.length,
              )
            ]

          if (!source) {
            return
          }

          const speed =
            Math.sqrt(
              source.vx *
                source.vx +
                source.vy *
                  source.vy,
            )

          const fire =
            source.fire === true

          game.balls.push(
            {
              x: source.x,
              y: source.y,
              radius:
                BALL_RADIUS,
              vx:
                -speed * 0.75,
              vy:
                -speed * 0.66,
              fire,
            },
            {
              x: source.x,
              y: source.y,
              radius:
                BALL_RADIUS,
              vx: 0,
              vy: -speed,
              fire,
            },
          )

          return
        }

        if (
          type === 'shot'
        ) {
          const speed =
            getBallSpeed(
              game.level,
            )

          const centerX =
            game.paddle.x +
            game.paddle.width / 2

          const startY =
            game.paddle.y -
            BALL_RADIUS -
            4

          game.balls.push(
            {
              x: centerX - 22,
              y: startY,
              radius:
                BALL_RADIUS,
              vx:
                -speed * 0.75,
              vy: -speed,
              fire: false,
            },
            {
              x: centerX,
              y: startY,
              radius:
                BALL_RADIUS,
              vx: 0,
              vy: -speed,
              fire: false,
            },
            {
              x: centerX + 22,
              y: startY,
              radius:
                BALL_RADIUS,
              vx:
                speed * 0.75,
              vy: -speed,
              fire: false,
            },
          )

          return
        }

        if (
          type === 'fire'
        ) {
          game.fireShotsRemaining =
            FIRE_SHOT_COUNT

          game.fireShotTimer =
            FIRE_SHOT_INTERVAL
        }
      },
      [],
    )

  const loseLife =
    useCallback(
      (game: GameState) => {
        game.lives -= 1

        setLives(game.lives)

        game.fireShotsRemaining = 0
        game.fireShotTimer = 0

        if (
          game.lives <= 0
        ) {
          game.running = false
          game.gameOver = true

          setGameOver(true)

          return
        }

        const speed =
          getBallSpeed(
            game.level,
          )

        game.paddle.x =
          CANVAS_WIDTH / 2 -
          game.paddle.width / 2

        game.balls = [
          {
            x:
              CANVAS_WIDTH / 2,

            y:
              game.paddle.y -
              BALL_RADIUS -
              3,

            radius:
              BALL_RADIUS,

            vx:
              speed * 0.7,

            vy:
              -speed,

            fire: false,
          },
        ]

        game.powerUps = []
      },
      [],
    )

  const hitBrick =
    useCallback(
      (
        game: GameState,
        brick: Brick,
        fireBall: boolean,
      ) => {
        if (
          brick.type ===
          'indestructible'
        ) {
          if (fireBall) {
            return false
          }

          return true
        }

        if (fireBall) {
          game.score +=
            brick.type ===
            'strong'
              ? 30
              : brick.type ===
                  'hard'
                ? 20
                : 10

          if (
            brick.powerUp
          ) {
            game.powerUps.push({
              x:
                brick.x +
                brick.width / 2 -
                POWERUP_SIZE / 2,

              y:
                brick.y +
                brick.height,

              width:
                POWERUP_SIZE,

              height:
                POWERUP_SIZE,

              type:
                brick.powerUp,

              speed:
                POWERUP_SPEED,
            })
          }

          brick.hp = 0

          return true
        }

        brick.hp -= 1

        if (
          brick.hp > 0
        ) {
          game.score += 5

          return true
        }

        game.score +=
          brick.type ===
          'strong'
            ? 30
            : brick.type ===
                'hard'
              ? 20
              : 10

        if (
          brick.powerUp
        ) {
          game.powerUps.push({
            x:
              brick.x +
              brick.width / 2 -
              POWERUP_SIZE / 2,

            y:
              brick.y +
              brick.height,

            width:
              POWERUP_SIZE,

            height:
              POWERUP_SIZE,

            type:
              brick.powerUp,

            speed:
              POWERUP_SPEED,
          })
        }

        brick.hp = 0

        return true
      },
      [],
    )

  const checkLevelComplete =
    useCallback(
      (game: GameState) => {
        const remaining =
          game.bricks.some(
            (brick) =>
              brick.type !==
                'indestructible' &&
              brick.hp > 0,
          )

        if (remaining) {
          return false
        }

        game.running = false
        game.won = true

        setWon(true)

        if (
          game.level >=
          TOTAL_LEVELS
        ) {
          saveProgress(
            TOTAL_LEVELS,
            TOTAL_LEVELS,
            true,
          )

          setUnlockedLevel(
            TOTAL_LEVELS,
          )

          return true
        }

        const nextLevel =
          game.level + 1

        const nextUnlocked =
          Math.max(
            unlockedLevel,
            nextLevel,
          )

        saveProgress(
          nextLevel,
          nextUnlocked,
          false,
        )

        setUnlockedLevel(
          nextUnlocked,
        )

        return true
      },
      [unlockedLevel],
    )

  const update =
    useCallback(
      (
        game: GameState,
        deltaTime: number,
      ) => {
        if (!game.running) {
          return
        }

        const dt =
          Math.min(
            deltaTime,
            50,
          )

        if (
          keysRef.current.left
        ) {
          game.paddle.x -=
            game.paddle.speed
        }

        if (
          keysRef.current.right
        ) {
          game.paddle.x +=
            game.paddle.speed
        }

        game.paddle.x =
          Math.max(
            0,
            Math.min(
              CANVAS_WIDTH -
                game.paddle.width,
              game.paddle.x,
            ),
          )

        if (
          game.wideTimer > 0
        ) {
          game.wideTimer--

          game.paddle.width =
            game.paddle.baseWidth *
            1.65
        } else {
          game.paddle.width =
            game.paddle.baseWidth
        }

        if (
          game.fireShotsRemaining >
          0
        ) {
          game.fireShotTimer -=
            dt

          if (
            game.fireShotTimer <=
            0
          ) {
            spawnFireBallFromPaddle(
              game,
            )

            game.fireShotsRemaining -=
              1

            if (
              game.fireShotsRemaining >
              0
            ) {
              game.fireShotTimer +=
                FIRE_SHOT_INTERVAL
            } else {
              game.fireShotTimer = 0
            }
          }
        }

        for (
          let ballIndex =
            game.balls.length - 1;
          ballIndex >= 0;
          ballIndex--
        ) {
          const ball =
            game.balls[
              ballIndex
            ]

          ball.x += ball.vx
          ball.y += ball.vy

          // Левая стена
          if (
            ball.x -
              ball.radius <=
            0
          ) {
            ball.x =
              ball.radius

            ball.vx =
              Math.abs(
                ball.vx,
              )
          }

          // Правая стена
          if (
            ball.x +
              ball.radius >=
            CANVAS_WIDTH
          ) {
            ball.x =
              CANVAS_WIDTH -
              ball.radius

            ball.vx =
              -Math.abs(
                ball.vx,
              )
          }

          // Верхняя стена
          if (
            ball.y -
              ball.radius <=
            0
          ) {
            ball.y =
              ball.radius

            ball.vy =
              Math.abs(
                ball.vy,
              )
          }

          // Палочка
          if (
            ball.vy > 0 &&
            ball.y +
              ball.radius >=
              game.paddle.y &&
            ball.y -
              ball.radius <=
              game.paddle.y +
                game.paddle.height &&
            ball.x >=
              game.paddle.x &&
            ball.x <=
              game.paddle.x +
                game.paddle.width
          ) {
            const hit =
              (ball.x -
                (game.paddle.x +
                  game.paddle.width /
                    2)) /
              (game.paddle.width /
                2)

            const speed =
              Math.sqrt(
                ball.vx *
                  ball.vx +
                  ball.vy *
                    ball.vy,
              )

            ball.vx =
              hit *
              Math.min(
                speed,
                3.8,
              )

            ball.vy =
              -Math.max(
                getBallSpeed(
                  game.level,
                ),
                Math.abs(
                  ball.vy,
                ),
              )

            ball.y =
              game.paddle.y -
              ball.radius -
              1
          }

          // Плитки
          for (
            let brickIndex = 0;
            brickIndex <
            game.bricks.length;
            brickIndex++
          ) {
            const brick =
              game.bricks[
                brickIndex
              ]

            if (
              brick.hp <= 0
            ) {
              continue
            }

            const closestX =
              Math.max(
                brick.x,
                Math.min(
                  ball.x,
                  brick.x +
                    brick.width,
                ),
              )

            const closestY =
              Math.max(
                brick.y,
                Math.min(
                  ball.y,
                  brick.y +
                    brick.height,
                ),
              )

            const dx =
              ball.x -
              closestX

            const dy =
              ball.y -
              closestY

            const distance =
              dx * dx +
              dy * dy

            if (
              distance >
              ball.radius *
                ball.radius
            ) {
              continue
            }

            // =====================================
            // ЖЕЛЕЗНЫЙ КУБИК
            // =====================================

            if (
              brick.type ===
              'indestructible'
            ) {
              // Огненный шар проходит
              // через железо без изменений.
              if (
                ball.fire
              ) {
                continue
              }

              // Запоминаем положение шара
              // до текущего шага.
              const previousX =
                ball.x - ball.vx

              const previousY =
                ball.y - ball.vy

              // Удар в левую сторону
              if (
                previousX +
                  ball.radius <=
                  brick.x &&
                ball.x +
                  ball.radius >=
                  brick.x
              ) {
                ball.x =
                  brick.x -
                  ball.radius

                ball.vx =
                  -Math.abs(
                    ball.vx,
                  )

                break
              }

              // Удар в правую сторону
              if (
                previousX -
                  ball.radius >=
                  brick.x +
                    brick.width &&
                ball.x -
                  ball.radius <=
                  brick.x +
                    brick.width
              ) {
                ball.x =
                  brick.x +
                  brick.width +
                  ball.radius

                ball.vx =
                  Math.abs(
                    ball.vx,
                  )

                break
              }

              // Удар сверху
              if (
                previousY +
                  ball.radius <=
                  brick.y &&
                ball.y +
                  ball.radius >=
                  brick.y
              ) {
                ball.y =
                  brick.y -
                  ball.radius

                ball.vy =
                  -Math.abs(
                    ball.vy,
                  )

                break
              }

              // Удар снизу
              if (
                previousY -
                  ball.radius >=
                  brick.y +
                    brick.height &&
                ball.y -
                  ball.radius <=
                  brick.y +
                    brick.height
              ) {
                ball.y =
                  brick.y +
                  brick.height +
                  ball.radius

                ball.vy =
                  Math.abs(
                    ball.vy,
                  )

                break
              }

              // Если столкновение произошло
              // точно возле угла.
              const overlapLeft =
                ball.x +
                ball.radius -
                brick.x

              const overlapRight =
                brick.x +
                brick.width -
                (ball.x -
                  ball.radius)

              const overlapTop =
                ball.y +
                ball.radius -
                brick.y

              const overlapBottom =
                brick.y +
                brick.height -
                (ball.y -
                  ball.radius)

              const minHorizontal =
                Math.min(
                  overlapLeft,
                  overlapRight,
                )

              const minVertical =
                Math.min(
                  overlapTop,
                  overlapBottom,
                )

              if (
                minHorizontal <
                minVertical
              ) {
                if (
                  ball.x <
                  brick.x +
                    brick.width /
                      2
                ) {
                  ball.x =
                    brick.x -
                    ball.radius

                  ball.vx =
                    -Math.abs(
                      ball.vx,
                    )
                } else {
                  ball.x =
                    brick.x +
                    brick.width +
                    ball.radius

                  ball.vx =
                    Math.abs(
                      ball.vx,
                    )
                }
              } else {
                if (
                  ball.y <
                  brick.y +
                    brick.height /
                      2
                ) {
                  ball.y =
                    brick.y -
                    ball.radius

                  ball.vy =
                    -Math.abs(
                      ball.vy,
                    )
                } else {
                  ball.y =
                    brick.y +
                    brick.height +
                    ball.radius

                  ball.vy =
                    Math.abs(
                      ball.vy,
                    )
                }
              }

              break
            }

            // =====================================
            // ОБЫЧНАЯ ПЛИТКА
            // =====================================

            const wasFireBall =
              ball.fire === true

            const hit =
              hitBrick(
                game,
                brick,
                wasFireBall,
              )

            // Огненный шар после уничтожения
            // разрушаемого кубика исчезает.
            if (
              wasFireBall &&
              hit
            ) {
              game.balls.splice(
                ballIndex,
                1,
              )

              break
            }

            ball.vy =
              -ball.vy

            break
          }
        }

        game.bricks =
          game.bricks.filter(
            (brick) =>
              brick.hp > 0 ||
              brick.type ===
                'indestructible',
          )

        game.balls =
          game.balls.filter(
            (ball) =>
              ball.y -
                ball.radius <=
              CANVAS_HEIGHT,
          )

        if (
          game.balls.length ===
          0
        ) {
          loseLife(game)
        }

        for (
          let i =
            game.powerUps.length -
            1;
          i >= 0;
          i--
        ) {
          const powerUp =
            game.powerUps[i]

          powerUp.y +=
            powerUp.speed

          const caught =
            powerUp.y +
              powerUp.height >=
              game.paddle.y &&
            powerUp.y <=
              game.paddle.y +
                game.paddle.height &&
            powerUp.x +
              powerUp.width >=
              game.paddle.x &&
            powerUp.x <=
              game.paddle.x +
                game.paddle.width

          if (caught) {
            activatePowerUp(
              game,
              powerUp.type,
            )

            game.powerUps.splice(
              i,
              1,
            )

            continue
          }

          if (
            powerUp.y >
            CANVAS_HEIGHT
          ) {
            game.powerUps.splice(
              i,
              1,
            )
          }
        }

        checkLevelComplete(
          game,
        )

        updateHud(game)
      },
      [
        activatePowerUp,
        checkLevelComplete,
        hitBrick,
        loseLife,
        spawnFireBallFromPaddle,
        updateHud,
      ],
    )

  const startGame =
    useCallback(
      (selected: number) => {
        if (
          selected < 1 ||
          selected >
            unlockedLevel
        ) {
          return
        }

        const game =
          createInitialGame(
            selected,
          )

        game.running = true
        game.started = true

        gameRef.current =
          game

        setLevel(selected)
        setSelectedLevel(
          selected,
        )

        setScore(0)
        setLives(3)

        setWon(false)
        setGameOver(false)
        setStarted(true)

        setActivePowerUps(
          [],
        )
      },
      [unlockedLevel],
    )

  const resetCurrentLevel =
    useCallback(() => {
      startGame(level)
    }, [level, startGame])

  const nextLevel =
    useCallback(() => {
      if (
        level >= TOTAL_LEVELS
      ) {
        onComplete()
        return
      }

      const next =
        level + 1

      setSelectedLevel(
        next,
      )

      startGame(next)
    }, [
      level,
      onComplete,
      startGame,
    ])

  useEffect(() => {
    const handleKeyDown = (
      event: KeyboardEvent,
    ) => {
      if (
        event.key ===
          'ArrowLeft' ||
        event.key.toLowerCase() ===
          'a'
      ) {
        keysRef.current.left =
          true

        event.preventDefault()
      }

      if (
        event.key ===
          'ArrowRight' ||
        event.key.toLowerCase() ===
          'd'
      ) {
        keysRef.current.right =
          true

        event.preventDefault()
      }

      if (
        event.code ===
          'Space' &&
        !started
      ) {
        startGame(
          selectedLevel,
        )
      }
    }

    const handleKeyUp = (
      event: KeyboardEvent,
    ) => {
      if (
        event.key ===
          'ArrowLeft' ||
        event.key.toLowerCase() ===
          'a'
      ) {
        keysRef.current.left =
          false
      }

      if (
        event.key ===
          'ArrowRight' ||
        event.key.toLowerCase() ===
          'd'
      ) {
        keysRef.current.right =
          false
      }
    }

    window.addEventListener(
      'keydown',
      handleKeyDown,
    )

    window.addEventListener(
      'keyup',
      handleKeyUp,
    )

    return () => {
      window.removeEventListener(
        'keydown',
        handleKeyDown,
      )

      window.removeEventListener(
        'keyup',
        handleKeyUp,
      )
    }
  }, [
    selectedLevel,
    startGame,
    started,
  ])

  useEffect(() => {
    const canvas =
      canvasRef.current

    if (!canvas) {
      return
    }

    const ctx =
      canvas.getContext('2d')

    if (!ctx) {
      return
    }

    let previousTime:
      number | null = null

    const loop = (
      timestamp: number,
    ) => {
      const game =
        gameRef.current

      if (
        previousTime === null
      ) {
        previousTime =
          timestamp
      }

      const deltaTime =
        timestamp -
        previousTime

      previousTime =
        timestamp

      if (game) {
        update(
          game,
          deltaTime,
        )

        draw(
          ctx,
          game,
        )
      }

      animationRef.current =
        requestAnimationFrame(
          loop,
        )
    }

    animationRef.current =
      requestAnimationFrame(
        loop,
      )

    return () => {
      if (
        animationRef.current !==
        null
      ) {
        cancelAnimationFrame(
          animationRef.current,
        )
      }
    }
  }, [draw, update])

  const getPowerUpName = (
    type: PowerUpType,
  ) => {
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
    <div className="arkanoid">
      <div className="arkanoid__header">
        <div>
          <strong>
            Уровень {level} /{' '}
            {TOTAL_LEVELS}
          </strong>

          <span>
            Очки: {score}
          </span>

          <span>
            Жизни: {lives}
          </span>
        </div>

        <div className="arkanoid__levels">
          {Array.from(
            {
              length:
                TOTAL_LEVELS,
            },
            (_, index) => {
              const current =
                index + 1

              const unlocked =
                current <=
                unlockedLevel

              return (
                <button
                  key={current}
                  type="button"
                  disabled={
                    !unlocked
                  }
                  className={
                    current ===
                    level
                      ? 'arkanoid__level arkanoid__level--active'
                      : 'arkanoid__level'
                  }
                  onClick={() => {
                    if (
                      unlocked
                    ) {
                      startGame(
                        current,
                      )
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
        {activePowerUps.map(
          (powerUp) => (
            <span
              key={powerUp}
              className="arkanoid__powerup-active"
            >
              {getPowerUpName(
                powerUp,
              )}
            </span>
          ),
        )}
      </div>

      <div className="arkanoid__canvas-wrap">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="arkanoid__canvas"
        />

        {!started &&
          !won &&
          !gameOver && (
            <div className="arkanoid__overlay">
              <h2>
                Арканоид
              </h2>

              <p>
                Управление:
                ← → или A / D
              </p>

              <button
                type="button"
                onClick={() =>
                  startGame(
                    selectedLevel,
                  )
                }
              >
                Играть
              </button>
            </div>
          )}

        {gameOver && (
          <div className="arkanoid__overlay">
            <h2>
              Игра окончена
            </h2>

            <p>
              Очки: {score}
            </p>

            <button
              type="button"
              onClick={
                resetCurrentLevel
              }
            >
              Попробовать снова
            </button>
          </div>
        )}

        {won && (
          <div className="arkanoid__overlay">
            <h2>
              {level >=
              TOTAL_LEVELS
                ? 'Все уровни пройдены!'
                : `Уровень ${level} пройден!`}
            </h2>

            <p>
              Очки: {score}
            </p>

            {level <
            TOTAL_LEVELS ? (
              <button
                type="button"
                onClick={
                  nextLevel
                }
              >
                Следующий
                уровень
              </button>
            ) : (
              <button
                type="button"
                onClick={
                  onComplete
                }
              >
                Завершить
              </button>
            )}
          </div>
        )}
      </div>

      <div className="arkanoid__legend">
        <span>
          <b>W</b> — широкая
          палочка
        </span>

        <span>
          <b>3</b> — текущий шар
          разделяется на 3
        </span>

        <span>
          <b>S</b> — из палочки
          вылетают 3 обычных
          шара
        </span>

        <span>
          <b>F</b> — 10 огненных
          шаров по одному каждые
          0,5 сек.
        </span>
      </div>
    </div>
  )
}