import { useCallback, useEffect, useRef, useState } from 'react'
import './WackAMole.css'
import backgroundImage from '@/shared/assets/games/wack-a-mole/background.png'
import bushImage from '@/shared/assets/games/wack-a-mole/bush.png'
import moleImage from '@/shared/assets/games/wack-a-mole/mole.png'

export type WackAMoleProps = {
  onComplete: () => void
}

const TIME_LIMIT = 30
const MOLE_VISIBLE_MS = 900
const MOLE_APPEAR_DELAY_MS = 250
const NEXT_MOLE_DELAY_MS = 180
const REQUIRED_HITS = 10
const BUSHES = Array.from({ length: 9 }, (_, i) => i)

export function WackAMole({ onComplete }: WackAMoleProps) {
  const [started, setStarted] = useState(false)
  const [finished, setFinished] = useState(false)
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT)
  const [moleIndex, setMoleIndex] = useState<number | null>(null)
  const [hits, setHits] = useState(0)
  const [result, setResult] = useState<'win' | 'lose' | null>(null)

  const moleTimer = useRef<number | null>(null)
  const nextTimer = useRef<number | null>(null)

  const clearTimers = useCallback(() => {
    if (moleTimer.current !== null) {
      window.clearTimeout(moleTimer.current)
      moleTimer.current = null
    }

    if (nextTimer.current !== null) {
      window.clearTimeout(nextTimer.current)
      nextTimer.current = null
    }
  }, [])

  const showMole = useCallback(() => {
    // The mole is completely hidden while we choose the next bush.
    setMoleIndex(null)

    const index = Math.floor(Math.random() * BUSHES.length)

    nextTimer.current = window.setTimeout(() => {
      setMoleIndex(index)

      moleTimer.current = window.setTimeout(() => {
        setMoleIndex(null)

        nextTimer.current = window.setTimeout(() => {
          showMole()
        }, NEXT_MOLE_DELAY_MS)
      }, MOLE_VISIBLE_MS)
    }, MOLE_APPEAR_DELAY_MS)
  }, [])

  const finish = useCallback(
    (gameResult: 'win' | 'lose') => {
      clearTimers()
      setStarted(false)
      setFinished(true)
      setMoleIndex(null)
      setResult(gameResult)

      if (gameResult === 'win') {
        onComplete()
      }
    },
    [clearTimers, onComplete],
  )

  const start = () => {
    clearTimers()
    setStarted(true)
    setFinished(false)
    setTimeLeft(TIME_LIMIT)
    setHits(0)
    setResult(null)
    setMoleIndex(null)

    // Start the first mole appearance.
    nextTimer.current = window.setTimeout(showMole, MOLE_APPEAR_DELAY_MS)
  }

  useEffect(() => {
    if (!started || finished) {
      return
    }

    const timer = window.setInterval(() => {
      setTimeLeft((current) => {
        if (current <= 1) {
          window.clearInterval(timer)
          finish('lose')
          return 0
        }

        return current - 1
      })
    }, 1000)

    return () => window.clearInterval(timer)
  }, [started, finished, finish])

  useEffect(() => {
    return () => clearTimers()
  }, [clearTimers])

  const handleMoleClick = () => {
    if (!started || moleIndex === null) {
      return
    }

    const nextHits = hits + 1
    setHits(nextHits)
    setMoleIndex(null)

    if (nextHits >= REQUIRED_HITS) {
      finish('win')
      return
    }

    clearTimers()
    nextTimer.current = window.setTimeout(showMole, NEXT_MOLE_DELAY_MS)
  }

  return (
    <div className="wack-a-mole">
      <div className="wack-a-mole__hud">
        <div className="wack-a-mole__timer">
          <span>Время</span>
          <strong>{timeLeft} сек</strong>
        </div>

        <div className="wack-a-mole__hits">
          <span>Попадания</span>
          <strong>
            {hits}/{REQUIRED_HITS}
          </strong>
        </div>

        {result === 'win' && (
          <div className="wack-a-mole__result wack-a-mole__result--win">Попал! 🎯</div>
        )}

        {result === 'lose' && (
          <div className="wack-a-mole__result wack-a-mole__result--lose">Время вышло!</div>
        )}
      </div>

      {!started && (
        <button className="wack-a-mole__start" type="button" onClick={start}>
          {result ? 'Играть ещё раз' : 'Начать игру'}
        </button>
      )}

      <div className="wack-a-mole__field" style={{ backgroundImage: `url(${backgroundImage})` }}>
        {BUSHES.map((index) => (
          <div
            key={index}
            className="wack-a-mole__bush"
            aria-label={moleIndex === index ? 'Куст с кротом' : 'Куст'}
          >
            <img src={bushImage} alt="" draggable={false} className="wack-a-mole__bush-image" />

            {moleIndex === index && (
              <span
                className="wack-a-mole__mole-hitbox"
                role="button"
                tabIndex={0}
                aria-label="Ударить крота"
                onClick={handleMoleClick}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    handleMoleClick()
                  }
                }}
              >
                <img className="wack-a-mole__mole" src={moleImage} alt="Крот" draggable={false} />
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
