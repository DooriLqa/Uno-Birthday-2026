import { useState } from 'react'
import './Japonsk.css'

type Props = {
  onComplete: () => void
}

type Cell = 'empty' | 'filled' | 'cross'

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

export function Japonsk({ onComplete }: Props) {
  const [board, setBoard] = useState<Cell[][]>(solution.map((row) => row.map(() => 'empty')))

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
          return
        }
      }
    }

    onComplete()
  }

  return (
    <div className="Japonsk">
      <div className="Japonsk__scene">
        <div className="Japonsk__crossword">
          {/* Подсказки сверху */}
          <div className="Japonsk__top-hints">
            <div className="Japonsk__hint-corner" />

            {columnHints.map((hint, column) => (
              <div
                className={`
                  Japonsk__column-hint
                  ${column === 4 || column === 9 ? 'Japonsk__column-hint--divider' : ''}
                `}
                key={column}
              >
                {hint.map((number, index) => (
                  <span key={index}>{number}</span>
                ))}
              </div>
            ))}
          </div>

          {/* Подсказки слева + поле */}
          <div className="Japonsk__board-wrapper">
            <div className="Japonsk__left-hints">
              {rowHints.map((hint, rowIndex) => (
                <div
                  className={`
                    Japonsk__row-hint
                    ${rowIndex === 4 || rowIndex === 9 ? 'Japonsk__row-hint--divider' : ''}
                  `}
                  key={rowIndex}
                >
                  {hint.map((number, index) => (
                    <span key={index}>{number}</span>
                  ))}
                </div>
              ))}
            </div>

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

        {/* Кнопка справа */}
        <button type="button" className="Japonsk__check" onClick={checkSolution}>
          ПРОВЕРИТЬ
        </button>
      </div>
    </div>
  )
}
