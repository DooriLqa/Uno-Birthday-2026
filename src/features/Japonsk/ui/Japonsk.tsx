import { useEffect, useState } from 'react'
import './Japonsk.css'
import JaponskBackground from '@/shared/assets/games/japonsk/japonsk-bg.png'
import KeyBall from '@/shared/assets/games/japonsk/answer.png'
import fireSound from '@/shared/assets/games/japonsk/fire.mp3'
import keyAppearSound from '@/shared/assets/games/japonsk/key-appear.wav'
import { playOneShotSound } from '@/shared/lib/audio/playOneShotSound'

type Props = {
  onComplete: () => void
}

type Cell = 'empty' | 'filled' | 'cross'

const JAPANSK_BOARD_STORAGE_KEY = 'japonsk-board-v1'

const solution = [
  [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
  [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1],
  [1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1],
  [1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1],
  [1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1],
  [1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1],
  [1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1],
  [1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
  [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
]

const rowHints = [
  [9],
  [11],
  [13],
  [5, 5],
  [4, 4],
  [3, 5, 3],
  [3, 5, 3],
  [3, 5, 3],
  [3, 5, 3],
  [3, 5, 3],
  [4, 4],
  [5, 5],
  [13],
  [11],
  [9],
]

const columnHints = [
  [9],
  [11],
  [13],
  [5, 5],
  [4, 4],
  [3, 5, 3],
  [3, 5, 3],
  [3, 5, 3],
  [3, 5, 3],
  [3, 5, 3],
  [4, 4],
  [5, 5],
  [13],
  [11],
  [9],
]

const JAPONSK_GAME_KEY = 'japonsk'
const WIN_SOUND_KEY = `${JAPONSK_GAME_KEY}:WIN`
const WIN_SOUND = keyAppearSound

export function Japonsk({ onComplete }: Props) {
  const [board, setBoard] = useState<Cell[][]>(() => {
    try {
      const saved = localStorage.getItem(JAPANSK_BOARD_STORAGE_KEY)

      if (saved) {
        const parsed = JSON.parse(saved) as Cell[][]

        if (
          parsed.length === solution.length &&
          parsed.every(
            (row, index) =>
              row.length === solution[index].length &&
              row.every((cell) => cell === 'empty' || cell === 'filled' || cell === 'cross'),
          )
        ) {
          return parsed
        }
      }
    } catch {
      // Если сохранение повреждено — начинаем пустую игру
    }

    return solution.map((row) => row.map(() => 'empty'))
  })

  useEffect(() => {
    try {
      localStorage.setItem(JAPANSK_BOARD_STORAGE_KEY, JSON.stringify(board))
    } catch {
      // Ничего не делаем, если localStorage недоступен
    }
  }, [board])

  useEffect(() => {
    const audio = new Audio(fireSound)

    audio.loop = true
    audio.volume = 0.25

    const startSound = () => {
      audio.play().catch(() => {})
    }

    window.addEventListener('click', startSound, { once: true })

    return () => {
      audio.pause()
      audio.currentTime = 0
      window.removeEventListener('click', startSound)
    }
  }, [])

  const [showSuccess, setShowSuccess] = useState(false)
  const [showKeyBall, setShowKeyBall] = useState(false)

  const clickCell = (row: number, column: number) => {
    setBoard((current) => {
      const next = current.map((line) => [...line])

      if (next[row][column] === 'empty') {
        next[row][column] = 'filled'
      } else if (next[row][column] === 'filled') {
        next[row][column] = 'cross'
      } else {
        next[row][column] = 'empty'
      }

      return next
    })
  }

  const checkSolution = () => {
    for (let row = 0; row < solution.length; row++) {
      for (let column = 0; column < solution[row].length; column++) {
        const shouldBeFilled = solution[row][column] === 1
        const isFilled = board[row][column] === 'filled'

        if (shouldBeFilled !== isFilled) {
          setShowSuccess(true)
          return
        }
      }
    }

    playOneShotSound(WIN_SOUND, WIN_SOUND_KEY, 0.1)

    setShowKeyBall(true)
    onComplete()
  }

  // Получаем размеры групп закрашенных клеток
  const getGroups = (cells: Cell[]) => {
    const groups: number[] = []
    let currentGroup = 0

    for (const cell of cells) {
      if (cell === 'filled') {
        currentGroup++
      } else {
        if (currentGroup > 0) {
          groups.push(currentGroup)
        }

        currentGroup = 0
      }
    }

    if (currentGroup > 0) {
      groups.push(currentGroup)
    }

    return groups
  }

  // Определяем выполненные подсказки.
  // Порядок групп сохраняется, но незаполненные подсказки
  // можно пропустить.
  const getCompletedHints = (cells: Cell[], hints: number[]) => {
    const groups = getGroups(cells)

    const completed = Array(hints.length).fill(false)

    let hintIndex = 0

    for (const group of groups) {
      for (let i = hintIndex; i < hints.length; i++) {
        if (hints[i] === group) {
          completed[i] = true
          hintIndex = i + 1
          break
        }
      }
    }

    return completed
  }

  return (
    <div className="Japonsk">
      {/* =====================================================
          ФОН
          ===================================================== */}

      <img className="Japonsk__background" src={JaponskBackground} alt="" />

      {/* =====================================================
          СЦЕНА
          ===================================================== */}

      <div className="Japonsk__scene">
        {/* ===================================================
            КРОССВОРД
            =================================================== */}

        <div className="Japonsk__crossword">
          {/* Подсказки сверху */}

          <div className="Japonsk__top-hints">
            <div className="Japonsk__hint-corner" />

            {columnHints.map((hint, column) => {
              const columnCells = board.map((row) => row[column])

              const completedHints = getCompletedHints(columnCells, hint)

              return (
                <div className="Japonsk__column-hint" key={column}>
                  {hint.map((number, index) => (
                    <span
                      key={index}
                      className={
                        completedHints[index]
                          ? 'Japonsk__hint-number Japonsk__hint-number--completed'
                          : 'Japonsk__hint-number'
                      }
                    >
                      {number}
                    </span>
                  ))}
                </div>
              )
            })}
          </div>

          {/* Подсказки слева + поле */}

          <div className="Japonsk__board-wrapper">
            <div className="Japonsk__left-hints">
              {rowHints.map((hint, rowIndex) => {
                const completedHints = getCompletedHints(board[rowIndex], hint)

                return (
                  <div
                    className={`
                      Japonsk__row-hint
                      ${rowIndex === 4 || rowIndex === 9 ? 'Japonsk__row-hint--divider' : ''}
                    `}
                    key={rowIndex}
                  >
                    {hint.map((number, index) => (
                      <span
                        key={index}
                        className={
                          completedHints[index]
                            ? 'Japonsk__hint-number Japonsk__hint-number--completed'
                            : 'Japonsk__hint-number'
                        }
                      >
                        {number}
                      </span>
                    ))}
                  </div>
                )
              })}
            </div>

            {/* Поле */}

            <div className="Japonsk__board">
              {board.map((row, rowIndex) =>
                row.map((cell, columnIndex) => (
                  <button
                    key={`${rowIndex}-${columnIndex}`}
                    type="button"
                    className={`
                      Japonsk__cell
                      Japonsk__cell--${cell}
                      ${
                        columnIndex === 4 || columnIndex === 9 ? 'Japonsk__cell--right-divider' : ''
                      }
                      ${rowIndex === 4 || rowIndex === 9 ? 'Japonsk__cell--bottom-divider' : ''}
                    `}
                    onClick={() => clickCell(rowIndex, columnIndex)}
                    aria-label={`Строка ${rowIndex + 1}, столбец ${columnIndex + 1}`}
                  >
                    {cell === 'cross' && '×'}
                  </button>
                )),
              )}
            </div>
          </div>
        </div>

        {showKeyBall && <img className="Japonsk__key-ball" src={KeyBall} alt="" />}

        {/* ===================================================
            КНОПКА ПРОВЕРКИ
            =================================================== */}

        <button type="button" className="Japonsk__check" onClick={checkSolution}>
          ПРОВЕРИТЬ
        </button>

        {/* ===================================================
            ОКНО ПОБЕДЫ
            =================================================== */}

        {showSuccess && (
          <div className="Japonsk__success">
            <div className="Japonsk__success-title">Неправильно!</div>

            <button
              type="button"
              className="Japonsk__success-close"
              onClick={() => setShowSuccess(false)}
            >
              ЗАКРЫТЬ
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
