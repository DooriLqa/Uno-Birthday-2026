import treasureOpen from '@/shared/assets/robot/treasure-open.png'
import treasurePile from '@/shared/assets/robot/treasure-pile.png'
import { useEffect, useState } from 'react'
import './RobotMazeGame.css'

type Props = {
  onComplete: () => void
}

const WALL = 0
const EXIT = 3
const CHEST = 4

const STORAGE_KEY = 'robotMazeProgress'
const CELL_SIZE = 72

type Direction = 'up' | 'right' | 'down' | 'left'
type CommandType = 'forward' | 'left' | 'right'

type Command = {
  type: CommandType
  icon: string
}

type Level = {
  maze: number[][]
  startRow: number
  startCol: number
  startDirection: Direction
  maxCommands: number
}

type SavedProgress = {
  playedLevels: number[]
  levelCoins: Record<number, number>
}

type GamePhase = 'playing' | 'summary' | 'replay' | 'finished'

const levels: Level[] = [
  {
    maze: [
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 1, 4, 1, 0, 0],
      [0, 0, 1, 0, 1, 0, 0],
      [0, 2, 1, 0, 1, 0, 0],
      [0, 0, 1, 0, 1, 0, 0],
      [0, 0, 1, 1, 1, 1, 3],
      [0, 0, 0, 0, 0, 0, 0],
    ],
    startRow: 3,
    startCol: 1,
    startDirection: 'right',
    maxCommands: 10,
  },

  {
    maze: [
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 1, 1, 1, 4, 0],
      [0, 0, 1, 0, 0, 1, 0],
      [0, 2, 1, 0, 0, 1, 0],
      [0, 0, 1, 1, 1, 1, 0],
      [0, 0, 0, 0, 0, 3, 0],
      [0, 0, 0, 0, 0, 0, 0],
    ],
    startRow: 3,
    startCol: 1,
    startDirection: 'right',
    maxCommands: 12,
  },

  {
    maze: [
      [0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 1, 1, 1, 1, 1, 4, 1, 1, 1, 0],
      [0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0],
      [0, 0, 0, 0, 1, 1, 1, 1, 4, 1, 0],
      [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ],
    startRow: 6,
    startCol: 9,
    startDirection: 'up',
    maxCommands: 25,
  },

  {
    maze: [
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 2, 1, 1, 0, 1, 4, 0],
      [0, 0, 0, 1, 0, 1, 1, 0],
      [0, 1, 1, 1, 1, 1, 0, 0],
      [0, 1, 0, 0, 0, 1, 0, 0],
      [0, 1, 1, 1, 1, 1, 3, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
    ],
    startRow: 1,
    startCol: 1,
    startDirection: 'right',
    maxCommands: 16,
  },

  {
    maze: [
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 1, 0, 1, 1, 4, 1, 0],
      [0, 0, 1, 0, 1, 0, 1, 0, 0],
      [0, 2, 1, 0, 1, 1, 1, 0, 0],
      [0, 0, 1, 1, 1, 0, 1, 0, 0],
      [0, 0, 0, 0, 1, 1, 1, 3, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
    ],
    startRow: 3,
    startCol: 1,
    startDirection: 'right',
    maxCommands: 16,
  },

  {
    maze: [
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 3, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 1, 1, 1, 4, 1, 1, 1, 1, 0],
      [0, 1, 0, 1, 0, 0, 0, 0, 1, 0],
      [0, 1, 1, 1, 1, 1, 4, 0, 1, 0],
      [0, 0, 0, 0, 0, 1, 0, 0, 1, 0],
      [0, 0, 0, 0, 0, 1, 1, 1, 1, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 2, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ],
    startRow: 7,
    startCol: 8,
    startDirection: 'up',
    maxCommands: 24,
  },

  {
    maze: [
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 2, 1, 1, 0, 1, 1, 4, 1, 1, 0],
      [0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0],
      [0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0],
      [0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0],
      [0, 1, 1, 1, 1, 4, 1, 1, 1, 3, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ],
    startRow: 1,
    startCol: 1,
    startDirection: 'right',
    maxCommands: 25,
  },

  {
    maze: [
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 2, 1, 1, 0, 1, 1, 4, 0],
      [0, 0, 0, 1, 0, 1, 0, 1, 0],
      [0, 4, 1, 1, 1, 1, 0, 1, 0],
      [0, 0, 0, 0, 0, 1, 1, 1, 0],
      [0, 0, 0, 0, 0, 0, 0, 3, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
    ],
    startRow: 1,
    startCol: 1,
    startDirection: 'right',
    maxCommands: 14,
  },

  {
    maze: [
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 2, 1, 1, 0, 1, 0, 1, 4, 0],
      [0, 0, 0, 1, 0, 1, 1, 1, 1, 0],
      [0, 1, 4, 1, 1, 1, 1, 0, 1, 0],
      [0, 1, 0, 0, 0, 0, 1, 0, 1, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 3],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ],
    startRow: 1,
    startCol: 1,
    startDirection: 'right',
    maxCommands: 19,
  },

  {
    maze: [
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 2, 1, 1, 0, 1, 1, 1, 4, 1, 1, 0],
      [0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 1, 0],
      [0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0],
      [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
      [0, 1, 1, 1, 1, 4, 1, 1, 0, 1, 1, 0],
      [0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 3, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ],
    startRow: 1,
    startCol: 1,
    startDirection: 'right',
    maxCommands: 28,
  },

  {
    maze: [
      [0, 3, 0, 0, 0, 0, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 1, 1, 1, 1, 1, 0],
      [0, 0, 4, 0, 0, 1, 0, 0],
      [0, 4, 1, 1, 1, 2, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
    ],
    startRow: 4,
    startCol: 5,
    startDirection: 'up',
    maxCommands: 20,
  },

  {
    maze: [
      [0, 3, 0, 0, 0, 0, 0, 0],
      [0, 1, 1, 1, 1, 1, 4, 0],
      [0, 4, 0, 1, 0, 1, 0, 0],
      [0, 0, 1, 1, 0, 1, 1, 0],
      [0, 2, 1, 1, 1, 1, 1, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
    ],
    startRow: 4,
    startCol: 1,
    startDirection: 'right',
    maxCommands: 20,
  },

  {
    maze: [
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 1, 1, 1, 1, 0],
      [0, 0, 1, 0, 0, 1, 0],
      [0, 0, 1, 4, 1, 1, 0],
      [0, 2, 1, 0, 1, 1, 3],
      [0, 0, 1, 0, 1, 0, 0],
      [0, 0, 1, 1, 1, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
    ],
    startRow: 4,
    startCol: 1,
    startDirection: 'right',
    maxCommands: 20,
  },
]

export function RobotMazeGame({ onComplete }: Props) {
  const [playedLevels, setPlayedLevels] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)

      if (!saved) {
        return []
      }

      const progress: SavedProgress = JSON.parse(saved)

      return Array.isArray(progress.playedLevels) ? progress.playedLevels : []
    } catch {
      return []
    }
  })

  const [levelCoins, setLevelCoins] = useState<Record<number, number>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)

      if (!saved) {
        return {}
      }

      const progress: SavedProgress = JSON.parse(saved)

      return progress.levelCoins ?? {}
    } catch {
      return {}
    }
  })

  const getRandomLevel = (availableLevels: number[]) => {
    if (availableLevels.length === 0) {
      return -1
    }

    const randomIndex = Math.floor(Math.random() * availableLevels.length)

    return availableLevels[randomIndex]
  }

  const initialAvailableLevels = levels
    .map((_, index) => index)
    .filter((index) => !playedLevels.includes(index))

  const initialLevel =
    initialAvailableLevels.length > 0 ? getRandomLevel(initialAvailableLevels) : 0

  const [gamePhase, setGamePhase] = useState<GamePhase>(
    playedLevels.length >= levels.length ? 'summary' : 'playing',
  )

  const [levelIndex, setLevelIndex] = useState(initialLevel)

  const [robot, setRobot] = useState(() => {
    const level = levels[initialLevel]

    return {
      row: level.startRow,
      col: level.startCol,
    }
  })

  const [direction, setDirection] = useState<Direction>(levels[initialLevel].startDirection)

  const [commands, setCommands] = useState<Command[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [currentCommand, setCurrentCommand] = useState(-1)
  const [moves, setMoves] = useState(0)
  const [openedChests, setOpenedChests] = useState<string[]>([])
  const [message, setMessage] = useState('Составьте программу для робота')

  const maze = levels[levelIndex].maze

  useEffect(() => {
    const progress: SavedProgress = {
      playedLevels,
      levelCoins,
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
  }, [playedLevels, levelCoins])

  const totalCoins = levels.reduce(
    (sum, level) => sum + level.maze.flat().filter((cell) => cell === CHEST).length,
    0,
  )

  const collectedCoins = Object.values(levelCoins).reduce((sum, count) => sum + count, 0)

  const addCommand = (type: CommandType) => {
    if (isRunning) {
      return
    }

    if (commands.length >= levels[levelIndex].maxCommands) {
      return
    }

    const icons: Record<CommandType, string> = {
      forward: '↑',
      left: '↶',
      right: '↷',
    }

    setCommands((prev) => [
      ...prev,
      {
        type,
        icon: icons[type],
      },
    ])
  }

  const removeLastCommand = () => {
    if (isRunning) {
      return
    }

    setCommands((prev) => prev.slice(0, -1))
  }

  const resetLevel = () => {
    const currentLevel = levels[levelIndex]

    setRobot({
      row: currentLevel.startRow,
      col: currentLevel.startCol,
    })

    setDirection(currentLevel.startDirection)
    setCommands([])
    setCurrentCommand(-1)
    setMoves(0)
    setOpenedChests([])
    setMessage('Составьте программу для робота')
    setIsRunning(false)
  }

  const startLevel = (index: number, text = 'Новый уровень') => {
    if (index < 0 || index >= levels.length) {
      return
    }

    const nextLevel = levels[index]

    setLevelIndex(index)

    setRobot({
      row: nextLevel.startRow,
      col: nextLevel.startCol,
    })

    setDirection(nextLevel.startDirection)
    setCommands([])
    setCurrentCommand(-1)
    setMoves(0)
    setOpenedChests([])
    setMessage(text)
    setIsRunning(false)
  }

  const resetProgress = () => {
    localStorage.removeItem(STORAGE_KEY)

    setPlayedLevels([])
    setLevelCoins({})
    setGamePhase('playing')
    setLevelIndex(0)

    const firstLevel = levels[0]

    setRobot({
      row: firstLevel.startRow,
      col: firstLevel.startCol,
    })

    setDirection(firstLevel.startDirection)
    setCommands([])
    setCurrentCommand(-1)
    setMoves(0)
    setOpenedChests([])
    setMessage('Прогресс сброшен')
    setIsRunning(false)
  }

  const finishCurrentLevel = (collectedOnLevel: number) => {
    const updatedPlayedLevels = playedLevels.includes(levelIndex)
      ? playedLevels
      : [...playedLevels, levelIndex]

    const previousBest = levelCoins[levelIndex] ?? 0

    const bestResult = Math.max(previousBest, collectedOnLevel)

    const updatedCoins = {
      ...levelCoins,
      [levelIndex]: bestResult,
    }

    setPlayedLevels(updatedPlayedLevels)
    setLevelCoins(updatedCoins)

    const newTotalCoins = Object.values(updatedCoins).reduce((sum, count) => sum + count, 0)

    if (newTotalCoins >= totalCoins) {
      setGamePhase('finished')
      setMessage('Все монеты собраны!')

      setTimeout(() => {
        onComplete()
      }, 1000)

      return
    }

    if (updatedPlayedLevels.length < levels.length) {
      const availableLevels = levels
        .map((_, index) => index)
        .filter((index) => !updatedPlayedLevels.includes(index))

      const nextIndex = getRandomLevel(availableLevels)

      startLevel(nextIndex, 'Новый случайный уровень')

      return
    }

    setGamePhase('summary')
    setMessage('Все уровни пройдены!')
  }

  const startReplay = () => {
    const incompleteLevels = levels
      .map((_, index) => index)
      .filter((index) => {
        const maxCoins = levels[index].maze.flat().filter((cell) => cell === CHEST).length

        const collected = levelCoins[index] ?? 0

        return collected < maxCoins
      })

    if (incompleteLevels.length === 0) {
      setGamePhase('finished')
      onComplete()
      return
    }

    const nextIndex = getRandomLevel(incompleteLevels)

    setGamePhase('replay')

    startLevel(nextIndex, 'Перепрохождение уровня')
  }

  const turnLeft = (current: Direction): Direction => {
    const directions: Direction[] = ['up', 'left', 'down', 'right']

    const index = directions.indexOf(current)

    return directions[(index + 1) % directions.length]
  }

  const turnRight = (current: Direction): Direction => {
    const directions: Direction[] = ['up', 'right', 'down', 'left']

    const index = directions.indexOf(current)

    return directions[(index + 1) % directions.length]
  }

  const getDirectionVector = (current: Direction) => {
    switch (current) {
      case 'up':
        return { row: -1, col: 0 }

      case 'right':
        return { row: 0, col: 1 }

      case 'down':
        return { row: 1, col: 0 }

      case 'left':
        return { row: 0, col: -1 }
    }
  }

  const isWalkable = (row: number, col: number) => {
    if (row < 0 || row >= maze.length) {
      return false
    }

    if (col < 0 || col >= maze[row].length) {
      return false
    }

    return maze[row][col] !== WALL
  }

  const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

  const runProgram = async () => {
    if (isRunning || commands.length === 0) {
      return
    }

    setIsRunning(true)
    setMessage('Робот выполняет программу...')
    setMoves(0)

    let currentRobot = { ...robot }
    let currentDirection = direction

    const collectedChestKeys = new Set(openedChests)

    for (let i = 0; i < commands.length; i++) {
      setCurrentCommand(i)

      const command = commands[i]

      if (command.type === 'left') {
        currentDirection = turnLeft(currentDirection)

        setDirection(currentDirection)
        setMoves((prev) => prev + 1)

        await wait(350)
      }

      if (command.type === 'right') {
        currentDirection = turnRight(currentDirection)

        setDirection(currentDirection)
        setMoves((prev) => prev + 1)

        await wait(350)
      }

      if (command.type === 'forward') {
        const { row, col } = getDirectionVector(currentDirection)

        let moved = false

        while (true) {
          const nextRow = currentRobot.row + row

          const nextCol = currentRobot.col + col

          if (!isWalkable(nextRow, nextCol)) {
            break
          }

          moved = true

          currentRobot = {
            row: nextRow,
            col: nextCol,
          }

          setRobot(currentRobot)

          await wait(120)

          const currentCell = maze[currentRobot.row][currentRobot.col]

          if (currentCell === CHEST) {
            const chestKey = `${currentRobot.row}-${currentRobot.col}`

            if (!collectedChestKeys.has(chestKey)) {
              collectedChestKeys.add(chestKey)

              setOpenedChests(Array.from(collectedChestKeys))

              setMessage('Сундук открыт')
            }
          }

          if (currentCell === EXIT) {
            setMoves((prev) => prev + 1)
            setMessage('Уровень пройден!')

            setIsRunning(false)
            setCurrentCommand(-1)

            await wait(800)

            finishCurrentLevel(collectedChestKeys.size)

            return
          }
        }

        if (moved) {
          setMoves((prev) => prev + 1)
        }

        await wait(200)
      }
    }

    setMessage('Робот не дошёл до финиша. Уровень перезапускается...')

    await wait(800)

    resetLevel()

    setCurrentCommand(-1)
    setIsRunning(false)
  }

  const getRobotRotation = () => {
    switch (direction) {
      case 'up':
        return -90

      case 'right':
        return 0

      case 'down':
        return 90

      case 'left':
        return 180
    }
  }

  if (gamePhase === 'finished') {
    return (
      <div className="RobotMaze">
        <div className="RobotMaze__summary">
          <h1 className="RobotMaze__summary-title">Поздравляем!</h1>

          <div className="RobotMaze__summary-text">Вы собрали все монеты</div>

          <div className="RobotMaze__summary-coins">
            {collectedCoins} / {totalCoins} 🪙
          </div>

          <button className="RobotMaze__button" onClick={resetProgress}>
            Сбросить прогресс
          </button>
        </div>
      </div>
    )
  }

  if (gamePhase === 'summary') {
    return (
      <div className="RobotMaze">
        <div className="RobotMaze__summary">
          <h1 className="RobotMaze__summary-title">Поздравляем!</h1>

          <div className="RobotMaze__summary-text">Вы прошли все уровни</div>

          <div className="RobotMaze__summary-coins">
            Собрано: {collectedCoins} / {totalCoins} 🪙
          </div>

          {collectedCoins < totalCoins ? (
            <>
              <div className="RobotMaze__summary-text">
                Вы можете перепройти уровни, где собрали не все монеты.
              </div>

              <button className="RobotMaze__button RobotMaze__button--run" onClick={startReplay}>
                Перепройти уровни
              </button>
            </>
          ) : (
            <button
              className="RobotMaze__button RobotMaze__button--run"
              onClick={() => {
                setGamePhase('finished')
                onComplete()
              }}
            >
              Завершить
            </button>
          )}

          <button className="RobotMaze__button" onClick={resetProgress}>
            Сбросить прогресс
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="RobotMaze">
      <div className="RobotMaze__header">
        <div className="RobotMaze__levels">
          <div className="RobotMaze__level">
            Пройдено: {playedLevels.length} / {levels.length}
          </div>

          <div className="RobotMaze__level">
            Монеты: {collectedCoins} / {totalCoins} 🪙
          </div>
        </div>

        <h1 className="RobotMaze__title">Робот-лабиринт</h1>
      </div>

      <div className="RobotMaze__content">
        <div
          className="RobotMaze__maze"
          style={{
            gridTemplateColumns: `repeat(${maze[0].length}, ${CELL_SIZE}px)`,
            gridTemplateRows: `repeat(${maze.length}, ${CELL_SIZE}px)`,
          }}
        >
          {maze.map((row, rowIndex) =>
            row.map((cell, colIndex) => {
              const isRobot = robot.row === rowIndex && robot.col === colIndex

              const chestKey = `${rowIndex}-${colIndex}`

              const isChestOpened = openedChests.includes(chestKey)

              return (
                <div key={chestKey} className={`RobotMaze__cell RobotMaze__cell--${cell}`}>
                  {cell === EXIT && <div className="RobotMaze__exit">🚪</div>}

                  {cell === CHEST && (
                    <div
                      className={`RobotMaze__chest ${isChestOpened ? 'RobotMaze__chest--opened' : ''
                        }`}
                    >
                      <img
                        src={isChestOpened ? treasureOpen : treasurePile}
                        alt={isChestOpened ? 'Открытое сокровище' : 'Зарытое сокровище'}
                      />
                    </div>
                  )}

                  {isRobot && (
                    <div
                      className="RobotMaze__robot"
                      style={{
                        transform: `rotate(${getRobotRotation()}deg)`,
                      }}
                    >
                      <img
                        src="/corgi-pirate.png"
                        alt="Корги-пират"
                      />
                    </div>
                  )}
                </div>
              )
            }),
          )}
        </div>

        <div className="RobotMaze__panel">
          <div className="RobotMaze__status">{message}</div>

          <div className="RobotMaze__program-title">Программа</div>

          <div className="RobotMaze__program">
            {Array.from({
              length: levels[levelIndex].maxCommands,
            }).map((_, index) => {
              const command = commands[index]

              return (
                <div
                  key={index}
                  className={`RobotMaze__slot ${currentCommand === index ? 'RobotMaze__slot--active' : ''
                    }`}
                >
                  {command?.icon ?? ''}
                </div>
              )
            })}
          </div>

          <div className="RobotMaze__command-buttons">
            <button
              className="RobotMaze__command"
              onClick={() => addCommand('forward')}
              disabled={isRunning}
            >
              <span className="RobotMaze__command-icon">↑</span>
              Вперёд
            </button>

            <button
              className="RobotMaze__command"
              onClick={() => addCommand('left')}
              disabled={isRunning}
            >
              <span className="RobotMaze__command-icon">↶</span>
              Влево
            </button>

            <button
              className="RobotMaze__command"
              onClick={() => addCommand('right')}
              disabled={isRunning}
            >
              <span className="RobotMaze__command-icon">↷</span>
              Вправо
            </button>
          </div>

          <div className="RobotMaze__buttons">
            <button
              className="RobotMaze__button RobotMaze__button--run"
              onClick={runProgram}
              disabled={isRunning || commands.length === 0}
            >
              Запустить
            </button>

            <button
              className="RobotMaze__button"
              onClick={removeLastCommand}
              disabled={isRunning || commands.length === 0}
            >
              Удалить
            </button>

            <button className="RobotMaze__button" onClick={resetLevel} disabled={isRunning}>
              Сбросить уровень
            </button>

            <button className="RobotMaze__button" onClick={resetProgress} disabled={isRunning}>
              Сбросить прогресс
            </button>
          </div>

          <div className="RobotMaze__stats">
            <div>
              Команд:{' '}
              <strong>
                {commands.length} / {levels[levelIndex].maxCommands}
              </strong>
            </div>

            <div>
              Выполнено: <strong>{moves}</strong>
            </div>

            <div>
              Монеты уровня:{' '}
              <strong>
                {openedChests.length} / {maze.flat().filter((cell) => cell === CHEST).length}
              </strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
