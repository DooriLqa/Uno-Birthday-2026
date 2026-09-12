import treasureOpen from '@/shared/assets/games/robot-maze/treasure-open.png'
import treasurePile from '@/shared/assets/games/robot-maze/treasure-pile.png'

import wall1 from '@/shared/assets/games/robot-maze/wall.png'
import wall2 from '@/shared/assets/games/robot-maze/wall2.png'
import wall3 from '@/shared/assets/games/robot-maze/wall3.png'
import wall4 from '@/shared/assets/games/robot-maze/wall4.png'
import wall5 from '@/shared/assets/games/robot-maze/wall5.png'

import corgiUp from '@/shared/assets/games/robot-maze/corgi-pirate-up.png'
import corgiRight from '@/shared/assets/games/robot-maze/corgi-pirate-right.png'
import corgiDown from '@/shared/assets/games/robot-maze/corgi-pirate-down.png'
import corgiLeft from '@/shared/assets/games/robot-maze/corgi-pirate-left.png'
import cartTracks from '@/shared/assets/games/robot-maze/cart-tracks.png'
import cartTracksTurn from '@/shared/assets/games/robot-maze/cart-tracks-turn.png'

import WheelSound from '@/shared/assets/games/robot-maze/wheel.mp3'
import ChestSound from '@/shared/assets/games/robot-maze/open-chest.mp3'

import exitCross from '@/shared/assets/games/robot-maze/exit.png'

import { useEffect, useState } from 'react'
import { playOneShotSound } from '@/shared/lib/audio/playOneShotSound'
import './RobotMazeGame.css'

type Props = {
  onComplete: () => void
}

const WALL = 0
const EXIT = 3
const CHEST = 4

const ROBOT_GAME_KEY = 'robot-maze'

const WHEEL_SOUND_KEY = `${ROBOT_GAME_KEY}:coin`
const CHEST_SOUND_KEY = `${ROBOT_GAME_KEY}:chest`

const WHEEL_SOUND = WheelSound
const CHEST_SOUND = ChestSound

const STORAGE_KEY = 'robotMazeProgress'

const CELL_SIZE = 'var(--robot-cell-size)'

const wallImages = [wall1, wall2, wall3, wall4, wall5]

type Direction = 'up' | 'right' | 'down' | 'left'

type CartTrack = {
  row: number
  col: number
  direction: Direction
}

type TurnTrack = {
  row: number
  col: number
  from: Direction
  turn: 'left' | 'right'
}

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
      [0, 0, 0, 0, 0, 1, 0],
      [0, 0, 0, 0, 0, 3, 0],
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
      [0, 1, 1, 1, 1, 1, 1, 3],
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
      [0, 0, 0, 0, 1, 1, 1, 1, 3],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
    ],
    startRow: 3,
    startCol: 1,
    startDirection: 'right',
    maxCommands: 16,
  },

  {
    maze: [
      [0, 3, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 1, 1, 1, 4, 1, 1, 1, 1, 0],
      [0, 1, 0, 1, 0, 0, 0, 0, 1, 0],
      [0, 1, 1, 1, 1, 1, 4, 0, 1, 0],
      [0, 0, 0, 0, 0, 1, 0, 0, 1, 0],
      [0, 0, 0, 0, 0, 1, 1, 1, 1, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 2, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ],
    startRow: 6,
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
      [0, 1, 1, 1, 1, 4, 1, 1, 1, 1, 3],
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
      [0, 0, 0, 0, 0, 0, 0, 1, 0],
      [0, 0, 0, 0, 0, 0, 0, 3, 0],
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
      [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 3],
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

/*
 * Выбор случайного уровня.
 *
 * Функция находится ВНЕ компонента,
 * чтобы React ESLint не считал Math.random()
 * вызовом нечистой функции во время render.
 */
const getRandomLevel = (availableLevels: number[]) => {
  if (availableLevels.length === 0) {
    return -1
  }

  const randomIndex = Math.floor(Math.random() * availableLevels.length)

  return availableLevels[randomIndex]
}

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

  const [cartTracksState, setCartTracksState] = useState<CartTrack[]>(() => [
    {
      row: levels[initialLevel].startRow,
      col: levels[initialLevel].startCol,
      direction: levels[initialLevel].startDirection,
    },
  ])

  const [turnTracksState, setTurnTracksState] = useState<TurnTrack[]>([])

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

  const addCartTrack = (row: number, col: number, trackDirection: Direction) => {
    setCartTracksState((prev) => [
      ...prev,
      {
        row,
        col,
        direction: trackDirection,
      },
    ])
  }

  const removeCartTrack = (row: number, col: number) => {
    setCartTracksState((prev) => prev.filter((track) => track.row !== row || track.col !== col))
  }

  const addTurnTrack = (row: number, col: number, from: Direction, turn: 'left' | 'right') => {
    removeCartTrack(row, col)

    setTurnTracksState((prev) => [
      ...prev,
      {
        row,
        col,
        from,
        turn,
      },
    ])
  }

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

    setCartTracksState([
      {
        row: currentLevel.startRow,
        col: currentLevel.startCol,
        direction: currentLevel.startDirection,
      },
    ])

    setTurnTracksState([])
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

    setCartTracksState([
      {
        row: nextLevel.startRow,
        col: nextLevel.startCol,
        direction: nextLevel.startDirection,
      },
    ])

    setTurnTracksState([])
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

    setCartTracksState([
      {
        row: firstLevel.startRow,
        col: firstLevel.startCol,
        direction: firstLevel.startDirection,
      },
    ])

    setTurnTracksState([])
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

    let currentRobot = {
      ...robot,
    }

    let currentDirection = direction

    const collectedChestKeys = new Set(openedChests)

    for (let i = 0; i < commands.length; i++) {
      setCurrentCommand(i)

      const command = commands[i]

      if (command.type === 'left') {
        const previousDirection = currentDirection

        currentDirection = turnLeft(currentDirection)

        addTurnTrack(currentRobot.row, currentRobot.col, previousDirection, 'left')

        await wait(120)

        setDirection(currentDirection)

        setMoves((prev) => prev + 1)

        await wait(350)
      }

      if (command.type === 'right') {
        const previousDirection = currentDirection

        currentDirection = turnRight(currentDirection)

        addTurnTrack(currentRobot.row, currentRobot.col, previousDirection, 'right')

        await wait(120)

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

          await wait(120)

          currentRobot = {
            row: nextRow,
            col: nextCol,
          }

          setRobot(currentRobot)

          playOneShotSound(WHEEL_SOUND, WHEEL_SOUND_KEY, 10)

          addCartTrack(nextRow, nextCol, currentDirection)

          const currentCell = maze[currentRobot.row][currentRobot.col]

          if (currentCell === CHEST) {
            const chestKey = `${currentRobot.row}-${currentRobot.col}`

            if (!collectedChestKeys.has(chestKey)) {
              collectedChestKeys.add(chestKey)

              setOpenedChests(Array.from(collectedChestKeys))

              playOneShotSound(CHEST_SOUND, CHEST_SOUND_KEY, 10)

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

  const getRobotImage = () => {
    switch (direction) {
      case 'up':
        return corgiUp

      case 'right':
        return corgiRight

      case 'down':
        return corgiDown

      case 'left':
        return corgiLeft
    }
  }

  const getwallImage = (row: number, col: number) => {
    const value = Math.abs(Math.sin(row * 12.9898 + col * 78.233 + levelIndex * 37.719))

    const index = Math.floor(value * wallImages.length)

    return wallImages[index]
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
      <div className="RobotMaze__content">
        <aside className="RobotMaze__sidebar">
          <div className="RobotMaze__level">
            Пройдено: {playedLevels.length} / {levels.length}
          </div>

          <div className="RobotMaze__level">
            Монеты: {collectedCoins} / {totalCoins} 💎
          </div>
        </aside>

        <div
          className="RobotMaze__maze"
          style={{
            gridTemplateColumns: `repeat(${maze[0].length}, ${CELL_SIZE})`,

            gridTemplateRows: `repeat(${maze.length}, ${CELL_SIZE})`,
          }}
        >
          {maze.map((row, rowIndex) =>
            row.map((cell, colIndex) => {
              const isRobot = robot.row === rowIndex && robot.col === colIndex

              const chestKey = `${rowIndex}-${colIndex}`

              const isChestOpened = openedChests.includes(chestKey)

              const tracks = cartTracksState.filter(
                (item) => item.row === rowIndex && item.col === colIndex,
              )

              const getTrackRotation = (trackDirection: Direction) => {
                switch (trackDirection) {
                  case 'up':
                    return 0

                  case 'right':
                    return 90

                  case 'down':
                    return 180

                  case 'left':
                    return 270
                }
              }

              return (
                <div
                  key={chestKey}
                  className={`RobotMaze__cell RobotMaze__cell--${cell}`}
                  style={
                    cell === WALL
                      ? {
                          backgroundImage: `url(${getwallImage(rowIndex, colIndex)})`,
                        }
                      : undefined
                  }
                >
                  {tracks.map((track, index) => (
                    <img
                      key={`${track.row}-${track.col}-${index}`}
                      className="RobotMaze__cart-track"
                      src={cartTracks}
                      alt=""
                      style={
                        {
                          '--track-rotation': `${getTrackRotation(track.direction)}deg`,
                        } as React.CSSProperties
                      }
                    />
                  ))}

                  {turnTracksState
                    .filter((track) => track.row === rowIndex && track.col === colIndex)
                    .map((track, index) => {
                      const rightTurnRotations: Record<Direction, number> = {
                        up: 0,
                        right: 90,
                        down: 180,
                        left: 270,
                      }

                      const rotation = rightTurnRotations[track.from]

                      return (
                        <img
                          key={`turn-${track.row}-${track.col}-${index}`}
                          className="RobotMaze__cart-track RobotMaze__turn-track"
                          src={cartTracksTurn}
                          alt=""
                          style={{
                            transform: `translate(-50%, -50%) rotate(${rotation}deg) scaleX(${
                              track.turn === 'left' ? -1 : 1
                            })`,
                          }}
                        />
                      )
                    })}

                  {cell === EXIT && (
                    <div className="RobotMaze__exit">
                      <img src={exitCross} alt="Выход" />
                    </div>
                  )}

                  {cell === CHEST && (
                    <div
                      className={`RobotMaze__chest ${
                        isChestOpened ? 'RobotMaze__chest--opened' : ''
                      }`}
                    >
                      <img
                        src={isChestOpened ? treasureOpen : treasurePile}
                        alt={isChestOpened ? 'Открытое сокровище' : 'Зарытое сокровище'}
                      />
                    </div>
                  )}

                  {isRobot && (
                    <div className="RobotMaze__robot">
                      <img src={getRobotImage()} alt="Корги-пират" />
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
