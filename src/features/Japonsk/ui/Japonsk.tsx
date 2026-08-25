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
      <p>Японский кроссворд</p>

      <div
        className="Japonsk__grid"
        style={{
          gridTemplateColumns: `70px repeat(${solution[0].length}, 45px)`,
        }}
      >
        {/* Пустой угол */}
        <div />

        {/* Подсказки сверху */}
        {columnHints.map((hint, column) => (
          <div className="Japonsk__column-hint" key={column}>
            {hint.map((number, index) => (
              <span key={index}>{number}</span>
            ))}
          </div>
        ))}

        {/* Подсказки слева + клетки */}
        {board.map((row, rowIndex) => (
          <>
            <div className="Japonsk__row-hint" key={`hint-${rowIndex}`}>
              {rowHints[rowIndex].map((number, index) => (
                <span key={index}>{number}</span>
              ))}
            </div>

            {row.map((cell, columnIndex) => (
              <button
                key={`${rowIndex}-${columnIndex}`}
                type="button"
                className={`
                Japonsk__cell
                Japonsk__cell--${cell}
                ${columnIndex === 4 || columnIndex === 9 ? 'Japonsk__cell--right-border' : ''}
                ${rowIndex === 4 || rowIndex === 9 ? 'Japonsk__cell--bottom-border' : ''}
              `}
                onClick={() => clickCell(rowIndex, columnIndex)}
              >
                {cell === 'cross' && '×'}
              </button>
            ))}
          </>
        ))}
      </div>

      <button type="button" className="Japonsk__check" onClick={checkSolution}>
        Проверить
      </button>
    </div>
  )
}
