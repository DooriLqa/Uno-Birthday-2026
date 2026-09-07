import { audioController, type Sound } from '@/shared/lib/audio/audioController'
import { useCallback, useEffect, useRef, useState } from 'react'
import './SeaBattle.css'

import backImage from '@/assets/SeaBattle/back.png'
import frontImage from '@/assets/SeaBattle/front.png'
import visorImage from '@/assets/SeaBattle/visor.png'
import torpedoImage from '@/assets/SeaBattle/torpedo.png'
import explosionImage from '@/assets/SeaBattle/explotion.png'
import shotSound from '@/assets/SeaBattle/shot.wav'
import explosionSound from '@/assets/SeaBattle/explotion.wav'
import ship1Image from '@/assets/SeaBattle/ship_1.png'
import ship2Image from '@/assets/SeaBattle/ship_2.png'
import ship3Image from '@/assets/SeaBattle/ship_3.png'
import ship4Image from '@/assets/SeaBattle/ship_4.png'

type SeaBattleProps = { onComplete: () => void }
type Direction = -1 | 1
type Result = 'win' | 'lose' | null

type Ship = {
  id: number
  x: number
  y: number
  width: number
  height: number
  speed: number
  direction: Direction
  image: string
}

type Torpedo = {
  id: number
  x: number
  y: number
  startY: number
}
type Explosion = { id: number; x: number; y: number }

// Координатная система игры совпадает с visor.png: 1000x500.
const VIEW_WIDTH = 1000
const WORLD_WIDTH = 2500
const WORLD_CENTER_X = WORLD_WIDTH / 2
const VIEW_CENTER_X = VIEW_WIDTH / 2
const SHIP_Y = 300
const HIT_LEFT = 185
const HIT_RIGHT = VIEW_WIDTH - 185
const TORPEDO_START_Y = 455
const TORPEDO_SPEED = 30
const TORPEDO_MAX_DISTANCE = 92
const SHOT_COOLDOWN = 3000
const START_TORPEDOES = 10
const REQUIRED_HITS = 5

const SHIPS = [
  { image: ship1Image, width: 150, height: 80, speed: 90 },
  { image: ship2Image, width: 150, height: 80, speed: 120 },
  { image: ship3Image, width: 150, height: 80, speed: 165 },
  { image: ship4Image, width: 150, height: 80, speed: 200 },
]

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

const randomShip = (id: number): Ship => {
  const config = SHIPS[Math.floor(Math.random() * SHIPS.length)]
  const direction: Direction = Math.random() > 0.5 ? 1 : -1
  const startX = direction === 1 ? -config.width : WORLD_WIDTH

  return {
    id,
    x: startX,
    y: SHIP_Y,
    width: config.width,
    height: config.height,
    speed: config.speed,
    direction,
    image: config.image,
  }
}

export function SeaBattle({ onComplete }: SeaBattleProps) {
  const [started, setStarted] = useState(false)
  const [result, setResult] = useState<Result>(null)
  const [hits, setHits] = useState(0)
  const [torpedoesLeft, setTorpedoesLeft] = useState(START_TORPEDOES)
  const [cooldown, setCooldown] = useState(0)
  const [cameraX, setCameraX] = useState(WORLD_CENTER_X - VIEW_CENTER_X)
  const [ships, setShips] = useState<Ship[]>([])
  const [torpedoes, setTorpedoes] = useState<Torpedo[]>([])
  const [explosions, setExplosions] = useState<Explosion[]>([])

  const frameRef = useRef<number | null>(null)
  const lastFrameRef = useRef<number | null>(null)
  const nextIdRef = useRef(1)
  const shotAtRef = useRef(0)
  const cameraXRef = useRef(cameraX)
  const shipsRef = useRef<Ship[]>([])
  const torpedoesRef = useRef<Torpedo[]>([])
  const cooldownTimerRef = useRef<number | null>(null)
  const cooldownUntilRef = useRef(0)
  const audioShotRef = useRef<Sound | null>(null)
  const audioExplosionRef = useRef<Sound | null>(null)

  const resetGame = useCallback(() => {
    // При старте visor оказывается точно по центру мира.
    const initialCamera = WORLD_CENTER_X - VIEW_CENTER_X
    const initialShips = [randomShip(1)]

    setStarted(true)
    setResult(null)
    setHits(0)
    setTorpedoesLeft(START_TORPEDOES)
    setCooldown(0)
    setCameraX(initialCamera)
    setShips(initialShips)
    setTorpedoes([])
    setExplosions([])

    cameraXRef.current = initialCamera
    shipsRef.current = initialShips
    torpedoesRef.current = []
    shotAtRef.current = 0
    cooldownUntilRef.current = 0
    lastFrameRef.current = null
  }, [])

  const finish = useCallback(
    (nextResult: Result) => {
      setStarted(false)
      setResult(nextResult)
      setTorpedoes([])
      setExplosions([])
      torpedoesRef.current = []

      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current)
        frameRef.current = null
      }
      if (cooldownTimerRef.current !== null) {
        window.clearInterval(cooldownTimerRef.current)
        cooldownTimerRef.current = null
      }
      if (nextResult === 'win') onComplete()
    },
    [onComplete],
  )

  const fire = useCallback(() => {
    if (!started || result || torpedoesLeft <= 0) return

    const now = performance.now()
    if (now < cooldownUntilRef.current) return

    shotAtRef.current = now
    cooldownUntilRef.current = now + SHOT_COOLDOWN

    const torpedo: Torpedo = {
      id: nextIdRef.current++,
      x: cameraXRef.current + VIEW_CENTER_X,
      y: TORPEDO_START_Y,
      startY: TORPEDO_START_Y,
    }

    torpedoesRef.current = [...torpedoesRef.current, torpedo]
    setTorpedoes(torpedoesRef.current)
    setTorpedoesLeft((value) => value - 1)
    setCooldown(SHOT_COOLDOWN)

    void audioShotRef.current?.play(true)

    if (cooldownTimerRef.current !== null) {
      window.clearInterval(cooldownTimerRef.current)
    }

    cooldownTimerRef.current = window.setInterval(() => {
      const remaining = Math.max(0, cooldownUntilRef.current - performance.now())

      setCooldown(remaining)

      if (remaining <= 0 && cooldownTimerRef.current !== null) {
        window.clearInterval(cooldownTimerRef.current)
        cooldownTimerRef.current = null
      }
    }, 50)
  }, [result, started, torpedoesLeft])

  const moveCamera = useCallback(
    (delta: number) => {
      if (!started) return
      setCameraX((value) => {
        const next = clamp(value + delta, 0, WORLD_WIDTH - VIEW_WIDTH)
        cameraXRef.current = next
        return next
      })
    },
    [started],
  )

  useEffect(() => {
    if (!started) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        event.preventDefault()
        fire()
        return
      }
      if (event.key === 'a' || event.key === 'A' || event.key === 'ArrowLeft') {
        event.preventDefault()
        moveCamera(-45)
      }
      if (event.key === 'd' || event.key === 'D' || event.key === 'ArrowRight') {
        event.preventDefault()
        moveCamera(45)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [fire, moveCamera, started])

  useEffect(() => {
    audioShotRef.current = audioController.createSound(shotSound)
    audioExplosionRef.current = audioController.createSound(explosionSound)

    return () => {
      audioShotRef.current?.dispose()
      audioExplosionRef.current?.dispose()
    }
  }, [])

  useEffect(() => {
    if (!started) return

    const tick = (time: number) => {
      const previous = lastFrameRef.current ?? time
      const delta = Math.min((time - previous) / 1000, 0.05)
      lastFrameRef.current = time

      let nextShips = shipsRef.current.map((ship) => ({
        ...ship,
        x: ship.x + ship.speed * ship.direction * delta,
      }))

      nextShips = nextShips.filter((ship) =>
        ship.direction === 1 ? ship.x < WORLD_WIDTH : ship.x + ship.width > 0,
      )

      if (nextShips.length === 0) nextShips = [randomShip(nextIdRef.current++)]

      const nextTorpedoes: Torpedo[] = []
      const hitShipIds = new Set<number>()
      const newExplosions: Explosion[] = []

      for (const torpedo of torpedoesRef.current) {
        const nextY = torpedo.y - TORPEDO_SPEED * delta
        let hit = false

        for (const ship of nextShips) {
          if (hitShipIds.has(ship.id)) continue

          const screenShipLeft = ship.x - cameraXRef.current
          const screenShipRight = screenShipLeft + ship.width
          const insideHitField = screenShipRight >= HIT_LEFT && screenShipLeft <= HIT_RIGHT
          const insideShip = torpedo.x >= ship.x && torpedo.x <= ship.x + ship.width
          const insideY = nextY <= ship.y + ship.height && torpedo.y >= ship.y

          if (insideHitField && insideShip && insideY) {
            hit = true
            hitShipIds.add(ship.id)
            newExplosions.push({
              id: nextIdRef.current++,
              x: ship.x + ship.width / 2,
              y: ship.y + ship.height / 2 - 10,
            })
            break
          }
        }

        const distance = torpedo.startY - nextY

        if (!hit && nextY > -60 && distance < TORPEDO_MAX_DISTANCE) {
          nextTorpedoes.push({ ...torpedo, y: nextY })
        }
      }

      nextShips = nextShips.filter((ship) => !hitShipIds.has(ship.id))
      if (nextShips.length === 0) nextShips = [randomShip(nextIdRef.current++)]

      const hitCount = hitShipIds.size
      if (hitCount > 0) {
        setHits((value) => {
          const next = value + hitCount
          if (next >= REQUIRED_HITS) window.setTimeout(() => finish('win'), 0)
          return next
        })

        void audioExplosionRef.current?.play(true)

        setExplosions((current) => [...current, ...newExplosions])
        window.setTimeout(() => {
          const ids = new Set(newExplosions.map((item) => item.id))
          setExplosions((current) => current.filter((item) => !ids.has(item.id)))
        }, 1500)
      }

      shipsRef.current = nextShips
      torpedoesRef.current = nextTorpedoes
      setShips(nextShips)
      setTorpedoes(nextTorpedoes)

      if (torpedoesLeft === 0 && nextTorpedoes.length === 0 && hitCount === 0) {
        window.setTimeout(() => finish('lose'), 0)
        return
      }

      frameRef.current = requestAnimationFrame(tick)
    }

    frameRef.current = requestAnimationFrame(tick)
    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current)
        frameRef.current = null
      }
      lastFrameRef.current = null
    }
  }, [finish, started, torpedoesLeft])

  const cooldownSeconds = Math.ceil(cooldown / 1000)

  return (
    <div className="sea-battle">
      <div className="sea-battle__hud">
        <div>
          <span>Попадания</span>
          <strong>
            {hits}/{REQUIRED_HITS}
          </strong>
        </div>
        <div>
          <span>Торпеды</span>
          <strong>
            {torpedoesLeft}/{START_TORPEDOES}
          </strong>
        </div>
        <div>
          <span>Перезарядка</span>
          <strong>{cooldown > 0 ? `${cooldownSeconds} сек` : 'ГОТОВ'}</strong>
        </div>
      </div>

      <div
        className="sea-battle__viewport"
        onPointerDown={(event) => {
          if (event.button === 0) fire()
        }}
      >
        <div
          className="sea-battle__world"
          style={{ transform: `translate3d(-${cameraX}px, 0, 0)` }}
        >
          <img className="sea-battle__back" src={backImage} alt="" draggable={false} />

          <div className="sea-battle__ships">
            {ships.map((ship) => (
              <img
                key={ship.id}
                className="sea-battle__ship"
                src={ship.image}
                alt="Корабль"
                draggable={false}
                style={{
                  left: ship.x,
                  top: ship.y,
                  width: ship.width,
                  height: ship.height,
                  transform: `scaleX(${ship.direction === 1 ? -1 : 1})`,
                }}
              />
            ))}
          </div>

          <div className="sea-battle__torpedoes">
            {torpedoes.map((torpedo) => (
              <img
                key={torpedo.id}
                className="sea-battle__torpedo"
                src={torpedoImage}
                alt=""
                draggable={false}
                style={{ left: torpedo.x - 18, top: torpedo.y - 30 }}
              />
            ))}
          </div>

          <div className="sea-battle__explosions">
            {explosions.map((explosion) => (
              <img
                key={explosion.id}
                className="sea-battle__explosion"
                src={explosionImage}
                alt="Взрыв"
                draggable={false}
                style={{ left: explosion.x - 65, top: explosion.y - 65 }}
              />
            ))}
          </div>

          <img className="sea-battle__front" src={frontImage} alt="" draggable={false} />
        </div>

        <img className="sea-battle__visor" src={visorImage} alt="Прицел" draggable={false} />
      </div>

      <div className="sea-battle__controls">
        <button type="button" onClick={() => moveCamera(-70)} disabled={!started}>
          ←
        </button>
        <button
          type="button"
          className="sea-battle__fire"
          onClick={fire}
          disabled={!started || cooldown > 0 || torpedoesLeft <= 0}
        >
          ПУСК
        </button>
        <button type="button" onClick={() => moveCamera(70)} disabled={!started}>
          →
        </button>
      </div>

      {!started && (
        <div className="sea-battle__overlay">
          <div className="sea-battle__message">
            <h3>
              {result === 'win'
                ? 'Победа!'
                : result === 'lose'
                  ? 'Боезапас закончился'
                  : 'Морской бой'}
            </h3>
            <p>
              {result === 'win'
                ? 'Пять кораблей уничтожено. Отличный залп!'
                : result === 'lose'
                  ? 'Нужно уничтожить 5 кораблей, используя максимум 10 торпед.'
                  : 'Найди корабль в прицеле и запускай торпеду.'}
            </p>
            <button type="button" onClick={resetGame}>
              {result ? 'Играть ещё раз' : 'Начать игру'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
