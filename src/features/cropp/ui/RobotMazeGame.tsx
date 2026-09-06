import { useState } from 'react'
import './RobotMazeGame.css'

type Props = {
  onComplete: () => void
}

// Типы клеток
const WALL = 0
const EXIT = 3
const CHEST = 4

type Direction = 'up' | 'down' | 'left' | 'right'

type Command = {
  direction: Direction
  icon: string
}

// Лабиринт
const maze = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 2, 1, 1, 1, 0, 1, 3, 0],
  [0, 0, 0, 0, 1, 0, 1, 0, 0],
  [0, 4, 1, 1, 1, 1, 1, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
]

const MIN_MOVES = 8
const MAX_COMMANDS = 12

export function RobotMazeGame({ onComplete }: Props) {
  const [robot, setRobot] = useState({
    row: 1,
    col: 1,
  })

  const [commands, setCommands] = useState<Command[]>([])

  const [isRunning, setIsRunning] = useState(false)

  const [currentCommand, setCurrentCommand] = useState(-1)

  const [moves, setMoves] = useState(0)

  const [chestOpened, setChestOpened] = useState(false)

  const [message, setMessage] = useState('Составьте программу для робота')

  // Добавление команды
  const addCommand = (direction: Direction) => {
    if (isRunning) return
    if (commands.length >= MAX_COMMANDS) return

    const icons: Record<Direction, string> = {
      up: '↑',
      down: '↓',
      left: '←',
      right: '→',
    }

    setCommands((prev) => [
      ...prev,
      {
        direction,
        icon: icons[direction],
      },
    ])

    setMessage('Программа готова к запуску')
  }

  // Удаление последней команды
  const removeLastCommand = () => {
    if (isRunning) return

    setCommands((prev) => prev.slice(0, -1))
  }

  // Сброс игры
  const resetGame = () => {
    setRobot({
      row: 1,
      col: 1,
    })

    setCommands([])
    setIsRunning(false)
    setCurrentCommand(-1)
    setMoves(0)
    setChestOpened(false)

    setMessage('Составьте программу для робота')
  }

  // Получить следующую позицию
  const getNextPosition = (row: number, col: number, direction: Direction) => {
    let nextRow = row
    let nextCol = col

    if (direction === 'up') {
      nextRow--
    }

    if (direction === 'down') {
      nextRow++
    }

    if (direction === 'left') {
      nextCol--
    }

    if (direction === 'right') {
      nextCol++
    }

    return {
      row: nextRow,
      col: nextCol,
    }
  }

  // Можно ли пройти в клетку
  const isWalkable = (row: number, col: number) => {
    if (row < 0 || row >= maze.length) {
      return false
    }

    if (col < 0 || col >= maze[0].length) {
      return false
    }

    return maze[row][col] !== WALL
  }

  // Задержка
  const wait = (ms: number) => {
    return new Promise<void>((resolve) => {
      setTimeout(resolve, ms)
    })
  }

  // Запуск программы
  const runProgram = async () => {
    if (commands.length === 0) {
      setMessage('Добавьте хотя бы одну команду')
      return
    }

    if (isRunning) return

    setIsRunning(true)
    setCurrentCommand(-1)
    setMoves(0)
    setMessage('Робот выполняет программу...')

    let currentRow = 1
    let currentCol = 1

    let currentMoves = 0
    let openedChest = false

    for (let i = 0; i < commands.length; i++) {
      setCurrentCommand(i)

      await wait(350)

      const command = commands[i]

      const next = getNextPosition(currentRow, currentCol, command.direction)

      currentMoves++

      setMoves(currentMoves)

      // Столкновение со стеной
      if (!isWalkable(next.row, next.col)) {
        await wait(250)

        setMessage('Робот столкнулся со стеной')

        continue
      }

      // Движение
      currentRow = next.row
      currentCol = next.col

      setRobot({
        row: currentRow,
        col: currentCol,
      })

      await wait(350)

      // Открытие сундука
      if (maze[currentRow][currentCol] === CHEST && !openedChest) {
        openedChest = true

        setChestOpened(true)

        setMessage('Сундук открыт! Продолжайте к выходу')

        await wait(500)
      }

      // Выход
      if (maze[currentRow][currentCol] === EXIT) {
        if (openedChest) {
          setCurrentCommand(-1)

          setMessage('Вы выбрались из лабиринта!')

          await wait(700)

          setIsRunning(false)

          onComplete()

          return
        }

        setMessage('Сначала нужно открыть сундук')

        await wait(400)
      }
    }

    setCurrentCommand(-1)
    setIsRunning(false)

    setMessage('Программа закончилась. Попробуйте другой маршрут')
  }

  return (
    <div className="RobotMaze">
      <div className="RobotMaze__title">ЛАБИРИНТ</div>

      <div className="RobotMaze__content">
        {/* Лабиринт */}

        <div
          className="RobotMaze__maze"
          style={{
            gridTemplateColumns: `repeat(${maze[0].length}, 48px)`,
            gridTemplateRows: `repeat(${maze.length}, 48px)`,
          }}
        >
          {maze.map((row, rowIndex) =>
            row.map((cell, colIndex) => {
              const isRobot = robot.row === rowIndex && robot.col === colIndex

              return (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={`
                    RobotMaze__cell
                    RobotMaze__cell--${cell}
                  `}
                >
                  {/* Робот */}

                  {isRobot && <div className="RobotMaze__robot">🤖</div>}

                  {/* Сундук */}

                  {cell === CHEST && (
                    <div
                      className={`
                        RobotMaze__chest
                        ${chestOpened ? 'RobotMaze__chest--opened' : ''}
                      `}
                    >
                      {chestOpened ? '📦' : '💰'}
                    </div>
                  )}

                  {/* Выход */}

                  {cell === EXIT && <div className="RobotMaze__exit">🚪</div>}
                </div>
              )
            }),
          )}
        </div>

        {/* Панель управления */}

        <div className="RobotMaze__panel">
          {/* Сообщение */}

          <div className="RobotMaze__status">{message}</div>

          {/* Программа */}

          <div className="RobotMaze__program-title">ПРОГРАММА</div>

          <div className="RobotMaze__program">
            {Array.from({
              length: MAX_COMMANDS,
            }).map((_, index) => {
              const command = commands[index]

              return (
                <div
                  key={index}
                  className={`
                    RobotMaze__slot
                    ${currentCommand === index ? 'RobotMaze__slot--active' : ''}
                  `}
                >
                  {command?.icon}
                </div>
              )
            })}
          </div>

          {/* Стрелки */}

          <div className="RobotMaze__controls">
            <button
              className="RobotMaze__arrow"
              onClick={() => addCommand('up')}
              disabled={isRunning}
            >
              ↑
            </button>

            <div className="RobotMaze__horizontal-controls">
              <button
                className="RobotMaze__arrow"
                onClick={() => addCommand('left')}
                disabled={isRunning}
              >
                ←
              </button>

              <button
                className="RobotMaze__arrow"
                onClick={() => addCommand('down')}
                disabled={isRunning}
              >
                ↓
              </button>

              <button
                className="RobotMaze__arrow"
                onClick={() => addCommand('right')}
                disabled={isRunning}
              >
                →
              </button>
            </div>
          </div>

          {/* Кнопки */}

          <div className="RobotMaze__buttons">
            <button
              className="RobotMaze__button RobotMaze__button--run"
              onClick={runProgram}
              disabled={isRunning || commands.length === 0}
            >
              {isRunning ? 'ВЫПОЛНЕНИЕ...' : 'ЗАПУСТИТЬ'}
            </button>

            <button
              className="RobotMaze__button"
              onClick={removeLastCommand}
              disabled={isRunning || commands.length === 0}
            >
              ← УДАЛИТЬ
            </button>

            <button className="RobotMaze__button" onClick={resetGame} disabled={isRunning}>
              СБРОС
            </button>
          </div>

          {/* Статистика */}

          <div className="RobotMaze__stats">
            <div>
              ХОДОВ: <strong>{moves}</strong>
            </div>

            <div>
              МИНИМУМ: <strong>{MIN_MOVES}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
