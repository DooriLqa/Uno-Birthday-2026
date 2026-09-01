import { useState, useEffect, useMemo, useCallback } from 'react'
import './FalloutHackingGame.css'

type Props = {
  onComplete: () => void
}

interface Word {
  word: string
  likeness: number
}

const WORDS = [
  'ACCESS',
  'BREACH',
  'CIPHER',
  'DECODE',
  'ENCRYPT',
  'FIREWALL',
  'HACKER',
  'SECURE',
  'SYSTEM',
  'TARGET',
  'MEMORY',
  'PORTAL',
  'VIRTUAL',
  'NETWORK',
  'CRYPTO',
  'DATA',
  'LOGIC',
  'MATRIX',
  'DIGITAL',
  'BINARY',
]

const SYMBOLS = [
  '!',
  '@',
  '#',
  '$',
  '%',
  '^',
  '&',
  '*',
  '(',
  ')',
  '-',
  '+',
  '=',
  '[',
  ']',
  '{',
  '}',
  '<',
  '>',
  '?',
  '/',
  '|',
  '\\',
  ';',
  ':',
  '"',
  "'",
  ',',
  '.',
  '~',
  '`',
]

export function FalloutHackingGame({ onComplete }: Props) {
  const [password, setPassword] = useState('')
  const [attempts, setAttempts] = useState(4)
  const [selectedWord, setSelectedWord] = useState<string | null>(null)
  const [guessHistory, setGuessHistory] = useState<Word[]>([])
  const [gameState, setGameState] = useState<'playing' | 'success' | 'failed'>('playing')
  const [terminalLines, setTerminalLines] = useState<string[]>([])
  const [addresses, setAddresses] = useState<string[]>([])
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 })
  const [bracketPairs, setBracketPairs] = useState<
    Array<{ open: number; close: number; word: string }>
  >([])

  // Инициализация терминала
  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    initGame()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const generateInitialGameData = (words: string[]) => {
    const randomPassword = words[Math.floor(Math.random() * words.length)]

    const generatedAddresses = Array.from(
      { length: 16 },
      () => `0x${Math.random().toString(16).slice(2, 6).toUpperCase()}`,
    )

    return { randomPassword, generatedAddresses }
  }

  const initGame = () => {
    // Получаем сгенерированные данные из внешней функции
    const { randomPassword, generatedAddresses } = generateInitialGameData(WORDS)

    setPassword(randomPassword)
    setAddresses(generatedAddresses)

    const lines = generateTerminalLines(randomPassword)
    setTerminalLines(lines)

    const brackets = findBracketPairs(lines.join(''))
    setBracketPairs(brackets)

    setAttempts(4)
    setGuessHistory([])
    setGameState('playing')
    setSelectedWord(null)
    setCursorPosition({ x: 0, y: 0 })
  }

  const generateTerminalLines = (password: string): string[] => {
    const lines: string[] = []
    // const wordsPerLine = 4
    const totalLines = 4

    console.log(password)

    for (let i = 0; i < totalLines; i++) {
      let line = ''
      const lineWords = []

      // Добавляем случайные символы и слова
      for (let j = 0; j < 12; j++) {
        const word = WORDS[Math.floor(Math.random() * WORDS.length)]
        if (Math.random() > 0.3) {
          line += word
          lineWords.push(word)
        } else {
          line += word
          lineWords.push(word)
        }

        // Добавляем случайные символы
        if (j < 11) {
          const symbolCount = Math.floor(Math.random() * 3) + 1
          for (let k = 0; k < symbolCount; k++) {
            line += SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
          }
        }
      }

      // Добавляем скобки для бонусов
      const bracketTypes = ['()', '[]', '{}', '<>']
      const bracketCount = Math.floor(Math.random() * 3) + 1
      for (let b = 0; b < bracketCount; b++) {
        const bracket = bracketTypes[Math.floor(Math.random() * bracketTypes.length)]
        const position = Math.floor(Math.random() * line.length)
        line = line.slice(0, position) + bracket[0] + line.slice(position)
        const position2 = Math.floor(Math.random() * line.length)
        line = line.slice(0, position2) + bracket[1] + line.slice(position2)
      }

      lines.push(line)
    }

    return lines
  }

  const findBracketPairs = (text: string): Array<{ open: number; close: number; word: string }> => {
    const pairs: Array<{ open: number; close: number; word: string }> = []
    const stack: Array<{ char: string; position: number }> = []
    const brackets: Record<string, string> = {
      '(': ')',
      '[': ']',
      '{': '}',
      '<': '>',
    }

    for (let i = 0; i < text.length; i++) {
      const char = text[i]

      if (char in brackets) {
        stack.push({ char, position: i })
      } else if (Object.values(brackets).includes(char)) {
        const last = stack[stack.length - 1]
        if (last && brackets[last.char] === char) {
          stack.pop()
          const word = text.slice(last.position + 1, i)
          if (word.length > 0 && word.length < 20) {
            pairs.push({ open: last.position, close: i, word })
          }
        }
      }
    }

    return pairs
  }

  const handleWordClick = (word: string, index: number) => {
    if (gameState !== 'playing') return

    const likeness = calculateLikeness(word, password)
    const newHistory = [...guessHistory, { word, likeness }]
    setGuessHistory(newHistory)
    setAttempts((prev) => prev - 1)
    setSelectedWord(word)
    setCursorPosition({ x: index % 4, y: Math.floor(index / 4) })

    if (word === password) {
      setGameState('success')
      setTimeout(() => {
        onComplete()
      }, 2000)
    } else if (attempts <= 1) {
      setGameState('failed')
      setTimeout(() => {
        initGame()
      }, 3000)
    }
  }

  const calculateLikeness = (guess: string, target: string): number => {
    let count = 0
    for (let i = 0; i < Math.min(guess.length, target.length); i++) {
      if (guess[i] === target[i]) {
        count++
      }
    }
    return count
  }

  const handleBracketClick = useCallback(
    (pair: { open: number; close: number; word: string }) => {
      if (gameState !== 'playing') return

      // 50% шанс удалить неправильное слово или восстановить попытку
      if (Math.random() > 0.5) {
        // Удаляем случайное неправильное слово из списка
        const wrongWords = WORDS.filter((w) => w !== password)
        const wordToRemove = wrongWords[Math.floor(Math.random() * wrongWords.length)]

        setTerminalLines((prev) =>
          prev.map((line) => line.replace(wordToRemove, '.'.repeat(wordToRemove.length))),
        )
        setGuessHistory((prev) => [...prev, { word: 'DUD REMOVED', likeness: -1 }])
      } else {
        // Восстанавливаем попытку
        setAttempts((prev) => Math.min(prev + 1, 4))
        setGuessHistory((prev) => [...prev, { word: 'ALLOWANCE REPLENISHED', likeness: -1 }])
      }

      // Удаляем использованную пару скобок
      setBracketPairs((prev) => prev.filter((p) => p !== pair))
    },
    [gameState, password],
  ) // В массив зависимостей добавляем внешние переменные

  const wordsInGrid = useMemo(() => {
    // Извлекаем слова из терминальных линий для отображения в сетке
    const extractedWords: string[] = []
    terminalLines.forEach((line) => {
      const words = line.match(/[A-Z]+/g) || []
      extractedWords.push(...words)
    })
    return extractedWords.slice(0, 16) // Ограничиваем 16 словами
  }, [terminalLines])

  return (
    <div className="fallout-hacking-game">
      <div className="fallout-terminal">
        <div className="terminal-header">
          <div className="terminal-title">ROBCO INDUSTRIES (TM) TERMLINK PROTOCOL</div>
          <div className="terminal-subtitle">ENTER PASSWORD NOW</div>
        </div>

        <div className="terminal-screen">
          <div className="terminal-attempts">
            <span className="attempts-label">ATTEMPTS LEFT:</span>
            <div className="attempts-blocks">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className={`attempt-block ${i < attempts ? 'filled' : 'empty'}`} />
              ))}
            </div>
          </div>

          <div className="terminal-address">
            <span className="address-label">MEMORY ADDRESS:</span>
            <span className="address-value">
              {addresses[cursorPosition.y * 4 + cursorPosition.x] || addresses[0]}
            </span>
          </div>

          <div className="words-grid">
            {wordsInGrid.map((word, index) => (
              <div
                key={`${word}-${index}`}
                className={`word-cell ${
                  selectedWord === word && guessHistory.some((g) => g.word === word)
                    ? 'selected'
                    : ''
                } ${guessHistory.some((g) => g.word === word) ? 'tried' : ''}`}
                onClick={() => handleWordClick(word, index)}
                style={{
                  cursor: gameState === 'playing' ? 'pointer' : 'default',
                }}
              >
                <span className="word-address">{addresses[index] || '0x0000'}</span>
                <span className="word-text">{word}</span>
              </div>
            ))}
          </div>

          <div className="terminal-likeness">
            {guessHistory.length > 0 && (
              <div className="history-section">
                <div className="history-title">PREVIOUS ATTEMPTS:</div>
                {guessHistory.map((guess, index) => (
                  <div key={index} className="history-entry">
                    <span className="history-index">&gt; {String(index + 1).padStart(2, '0')}</span>
                    <span className="history-word">{guess.word}</span>
                    <span className="history-likeness">
                      {guess.likeness >= 0 ? `LIKENESS: ${guess.likeness}` : guess.word}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {bracketPairs.length > 0 && gameState === 'playing' && (
            <div className="bracket-section">
              <div className="bracket-hint">
                CLICK ON MATCHING BRACKETS TO REMOVE DUD OR REPLENISH ATTEMPTS
              </div>
              <div className="bracket-list">
                {bracketPairs.slice(0, 3).map((pair, index) => (
                  <button
                    key={index}
                    className="bracket-button"
                    onClick={() => handleBracketClick(pair)}
                  >
                    {pair.word}
                  </button>
                ))}
              </div>
            </div>
          )}

          {gameState === 'success' && (
            <div className="success-overlay">
              <div className="success-text">ACCESS GRANTED</div>
              <div className="success-details">WELCOME, OVERSEER</div>
            </div>
          )}

          {gameState === 'failed' && (
            <div className="failed-overlay">
              <div className="failed-text">ACCESS DENIED</div>
              <div className="failed-details">TERMINAL LOCKED - REBOOTING...</div>
            </div>
          )}
        </div>

        <div className="terminal-footer">
          <div className="footer-left">
            <span>ROBCO INDUSTRIES UNIFIED OPERATING SYSTEM</span>
          </div>
          <div className="footer-right">
            <span>COPYRIGHT 2075-2077 ROBCO INDUSTRIES</span>
          </div>
        </div>
      </div>
    </div>
  )
}
