import { useState } from 'react'
import './RobotMazeGame.css'

type Props = {
  onComplete: () => void
}

const WALL = 0
const EXIT = 3
const CHEST = 4

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
}

// =========================================================
// УРОВНИ
// =========================================================

const levels: Level[] = [
  {
    maze: [
      [0, 0, 0, 0, 0, 0, 0],
      [0, 2, 1, 4, 1, 3, 0],
      [0, 0, 0, 0, 0, 0, 0],
    ],
    startRow: 1,
    startCol: 1,
    startDirection: 'right',
  },

  {
    maze: [
      [0, 0, 0, 0, 0, 0, 0],
      [0, 2, 1, 0, 1, 3, 0],
      [0, 0, 1, 0, 1, 0, 0],
      [0, 0, 1, 1, 1, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
    ],
    startRow: 1,
    startCol: 1,
    startDirection: 'right',
  },

  {
    maze: [
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 2, 1, 1, 0, 1, 1, 1, 0],
      [0, 0, 0, 1, 0, 1, 0, 1, 0],
      [0, 3, 1, 1, 0, 1, 0, 1, 0],
      [0, 0, 0, 0, 0, 1, 0, 1, 0],
      [0, 1, 1, 1, 1, 1, 0, 1, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
    ],
    startRow: 1,
    startCol: 1,
    startDirection: 'right',
  },

  {
    maze: [
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 2, 1, 1, 1, 0, 1, 1, 0],
      [0, 0, 0, 0, 1, 0, 1, 0, 0],
      [0, 1, 1, 0, 1, 1, 1, 0, 0],
      [0, 1, 0, 0, 0, 0, 1, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 3, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
    ],
    startRow: 1,
    startCol: 1,
    startDirection: 'right',
  },

  {
    maze: [
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 2, 1, 1, 0, 0, 1, 1, 1, 3, 0],
      [0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0],
      [0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ],
    startRow: 1,
    startCol: 1,
    startDirection: 'right',
  },

  {
    maze: [
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 2, 1, 1, 0, 1, 1, 1, 0, 0, 0],
      [0, 0, 0, 1, 0, 1, 0, 1, 0, 3, 0],
      [0, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0],
      [0, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ],
    startRow: 1,
    startCol: 1,
    startDirection: 'right',
  },

  {
    maze: [
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 2, 1, 1, 1, 0, 1, 1, 1, 1, 0],
      [0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0],
      [0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0],
      [0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 0, 1, 3, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ],
    startRow: 1,
    startCol: 1,
    startDirection: 'right',
  },

  {
    maze: [
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 2, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0],
      [0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 3, 0],
      [0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 0, 0],
      [0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ],
    startRow: 1,
    startCol: 1,
    startDirection: 'right',
  },

  {
    maze: [
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 2, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0],
      [0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
      [0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0],
      [0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ],
    startRow: 1,
    startCol: 1,
    startDirection: 'right',
  },

  // Уровень с сундуком
  {
    maze: [
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 2, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0],
      [0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 3, 0],
      [0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 0, 0],
      [0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 0],
      [0, 1, 1, 1, 1, 4, 1, 1, 0, 0, 0, 1, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ],
    startRow: 1,
    startCol: 1,
    startDirection: 'right',
  },
]

const MAX_COMMANDS = 20
const CELL_SIZE = 48

export function RobotMazeGame({ onComplete }: Props) {
  const [levelIndex, setLevelIndex] = useState(0)

  const maze = levels[levelIndex].maze

  const [robot, setRobot] = useState({
    row: levels[0].startRow,
    col: levels[0].startCol,
  })

  const [direction, setDirection] = useState<Direction>(levels[0].startDirection)

  const [commands, setCommands] = useState<Command[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [currentCommand, setCurrentCommand] = useState(-1)
  const [moves, setMoves] = useState(0)
  const [chestOpened, setChestOpened] = useState(false)

  const [message, setMessage] = useState('Составьте программу для робота')

  // =========================================================
  // ДОБАВЛЕНИЕ КОМАНД
  // =========================================================

  const addCommand = (type: CommandType) => {
    if (isRunning) return
    if (commands.length >= MAX_COMMANDS) return

    const icons = {
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
    if (isRunning) return

    setCommands((prev) => prev.slice(0, -1))
  }

  // =========================================================
  // СБРОС УРОВНЯ
  // =========================================================

  const resetLevel = () => {
    const current = levels[levelIndex]

    setRobot({
      row: current.startRow,
      col: current.startCol,
    })

    setDirection(current.startDirection)

    setCommands([])
    setCurrentCommand(-1)
    setMoves(0)
    setChestOpened(false)
    setMessage('Составьте программу для робота')
    setIsRunning(false)
  }

  // =========================================================
  // СЛЕДУЮЩИЙ УРОВЕНЬ
  // =========================================================

  const nextLevel = () => {
    if (levelIndex >= levels.length - 1) {
      onComplete()
      return
    }

    const nextIndex = levelIndex + 1
    const next = levels[nextIndex]

    setLevelIndex(nextIndex)

    setRobot({
      row: next.startRow,
      col: next.startCol,
    })

    setDirection(next.startDirection)

    setCommands([])
    setCurrentCommand(-1)
    setMoves(0)
    setChestOpened(false)
    setMessage('Новый уровень')
    setIsRunning(false)
  }

  // =========================================================
  // ПОВОРОТЫ
  // =========================================================

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

  // =========================================================
  // НАПРАВЛЕНИЕ ДВИЖЕНИЯ
  // =========================================================

  const getDirectionVector = (current: Direction): { row: number; col: number } => {
    switch (current) {
      case 'up':
        return {
          row: -1,
          col: 0,
        }

      case 'right':
        return {
          row: 0,
          col: 1,
        }

      case 'down':
        return {
          row: 1,
          col: 0,
        }

      case 'left':
        return {
          row: 0,
          col: -1,
        }
    }
  }

  // =========================================================
  // ПРОВЕРКА КЛЕТКИ
  // =========================================================

  const isWalkable = (row: number, col: number) => {
    if (row < 0) return false
    if (row >= maze.length) return false
    if (col < 0) return false
    if (col >= maze[row].length) return false

    return maze[row][col] !== WALL
  }

  // =========================================================
  // ПАУЗА
  // =========================================================

  const wait = (ms: number) =>
    new Promise<void>((resolve) => {
      setTimeout(resolve, ms)
    })

  // =========================================================
  // ЗАПУСК ПРОГРАММЫ
  // =========================================================

  const runProgram = async () => {
    if (isRunning || commands.length === 0) return

    setIsRunning(true)
    setMessage('Робот выполняет программу...')
    setMoves(0)

    let currentRobot = { ...robot }
    let currentDirection = direction

    for (let i = 0; i < commands.length; i++) {
      setCurrentCommand(i)

      const command = commands[i]

      // -----------------------------------------------------
      // ПОВОРОТ ВЛЕВО
      // -----------------------------------------------------

      if (command.type === 'left') {
        currentDirection = turnLeft(currentDirection)

        setDirection(currentDirection)

        setMoves((prev) => prev + 1)

        await wait(350)
      }

      // -----------------------------------------------------
      // ПОВОРОТ ВПРАВО
      // -----------------------------------------------------

      if (command.type === 'right') {
        currentDirection = turnRight(currentDirection)

        setDirection(currentDirection)

        setMoves((prev) => prev + 1)

        await wait(350)
      }

      // -----------------------------------------------------
      // ДВИЖЕНИЕ ВПЕРЁД
      // -----------------------------------------------------

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

          // -------------------------------------------------
          // СУНДУК
          // -------------------------------------------------

          if (maze[currentRobot.row][currentRobot.col] === CHEST) {
            setChestOpened(true)
            setMessage('Сундук открыт')
          }

          // -------------------------------------------------
          // ФИНИШ
          // -------------------------------------------------

          if (maze[currentRobot.row][currentRobot.col] === EXIT) {
            setMoves((prev) => prev + 1)

            setMessage('Уровень пройден!')
            setIsRunning(false)
            setCurrentCommand(-1)

            await wait(800)

            nextLevel()

            return
          }
        }

        if (moved) {
          setMoves((prev) => prev + 1)
        }

        await wait(200)
      }
    }

    // =======================================================
    // ПРОГРАММА ЗАКОНЧИЛАСЬ, НО ФИНИШ НЕ ДОСТИГНУТ
    // =======================================================

    setMessage('Робот не дошёл до финиша. Уровень перезапускается...')

    await wait(800)

    resetLevel()

    setCurrentCommand(-1)
    setIsRunning(false)
  }

  // =========================================================
  // ПОВОРОТ РОБОТА
  // =========================================================

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

  // =========================================================
  // РЕНДЕР
  // =========================================================

  return (
    <div className="RobotMaze">
      <div className="RobotMaze__header">
        <h1 className="RobotMaze__title">Робот-лабиринт</h1>

        <div className="RobotMaze__level">
          Уровень {levelIndex + 1} / {levels.length}
        </div>
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

              return (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={`RobotMaze__cell RobotMaze__cell--${cell}`}
                >
                  {cell === EXIT && <div className="RobotMaze__exit">🚪</div>}

                  {cell === CHEST && (
                    <div
                      className={`RobotMaze__chest ${
                        chestOpened ? 'RobotMaze__chest--opened' : ''
                      }`}
                    >
                      {chestOpened ? '✨' : '📦'}
                    </div>
                  )}

                  {isRobot && (
                    <div
                      className="RobotMaze__robot"
                      style={{
                        transform: `rotate(${getRobotRotation()}deg)`,
                      }}
                    >
                      🤖
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
              length: MAX_COMMANDS,
            }).map((_, index) => {
              const command = commands[index]

              return (
                <div
                  key={index}
                  className={`RobotMaze__slot ${
                    currentCommand === index ? 'RobotMaze__slot--active' : ''
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
              Сбросить
            </button>
          </div>

          <div className="RobotMaze__stats">
            <div>
              Команд:{' '}
              <strong>
                {commands.length} / {MAX_COMMANDS}
              </strong>
            </div>

            <div>
              Выполнено: <strong>{moves}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
