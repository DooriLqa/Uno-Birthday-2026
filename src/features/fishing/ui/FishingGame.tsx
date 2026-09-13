import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
} from 'react'
import { Fish as FishIcon } from 'lucide-react'
import { usePawCoinStore } from '@/features/currency/model/store'
import { useInventoryStore } from '@/features/inventory/model/store'
import fishSheet from '@/shared/assets/games/fishing/fish-sheet.png'
import {
  DISTANCE_LABELS,
  getRarity,
  pickFish,
  pickRarity,
  rarityDifficulty,
  type Fish,
  type FishRarity,
  type FishingDistance,
} from '../model/fish'
import { audioController } from '@/shared/lib/audio/audioController'
import rod from '@/shared/assets/games/fishing/rod.png'
import rodGold from '@/shared/assets/games/fishing/rod-gold.png'
import bobber from '@/shared/assets/games/fishing/bobber.png'
import fishingSound1 from '@/shared/assets/games/fishing/zabros.mp3'
import './FishingGame.css'

type Phase = 'idle' | 'charging' | 'casting' | 'returning' | 'waiting' | 'bite' | 'fight' | 'result'
type Props = { onClose?: () => void }
type CatchResult = { fish: Fish; rarity: FishRarity; message: string }

const BITE_MIN = 5000
const BITE_MAX = 10000
const BITE_WINDOW = 1000
const GREEN_HEIGHT_BASE = 18
const GREEN_HEIGHT_GOLD = 23
const STORAGE_KEY = 'fishing_catches'

// Максимальный dt для защиты от "залипания" вкладки
const MAX_DT = 0.05
// Минимальный dt для защиты от слишком быстрых обновлений
const MIN_DT = 0.001

// Диапазон масштаба поплавка в зависимости от силы заброса:
// при power = 0   → 1.0 (100%)
// при power = 100 → 0.4 (40%)
const BOBBER_MIN_SCALE = 0.4

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))

// Загрузка сохранённых данных
const loadCatches = (): { common: number; uncommon: number } => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      return {
        common: parsed.common ?? 0,
        uncommon: parsed.uncommon ?? 0,
      }
    }
  } catch {
    // игнорируем ошибки парсинга
  }
  return { common: 0, uncommon: 0 }
}

export function FishingGame({ onClose }: Props) {
  const addCoins = usePawCoinStore((state) => state.addPawCoins)
  const hasGoldRod = useInventoryStore((state) =>
    state.items.some((item) => item.id === 'fishing-rod-gold'),
  )
  const greenHeight = hasGoldRod ? GREEN_HEIGHT_GOLD : GREEN_HEIGHT_BASE
  const activeRod = hasGoldRod ? rodGold : rod

  // Локальное состояние для рыбок
  const [catches, setCatches] = useState(() => loadCatches())

  // Сохраняем в localStorage при изменении
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(catches))
  }, [catches])

  const [phase, setPhaseState] = useState<Phase>('idle')
  const [power, setPower] = useState(0)
  const [bobberX, setBobberX] = useState(54)
  const [bobberTop, setBobberTop] = useState(62)
  const [bobberScale, setBobberScale] = useState(1)
  const [fishY, setFishY] = useState(52)
  const [greenY, setGreenY] = useState(41)
  const [catchProgress, setCatchProgress] = useState(20)
  const [result, setResult] = useState<CatchResult | null>(null)
  const [coinBurst, setCoinBurst] = useState(0)
  const [castDistance, setCastDistance] = useState<FishingDistance>('near')
  const [rodJerk, setRodJerk] = useState(0)

  const phaseRef = useRef<Phase>('idle')
  const holdingRef = useRef(false)
  const powerRef = useRef(0)
  const powerDirectionRef = useRef(1)
  const powerFrameRef = useRef<number | null>(null)
  const biteTimerRef = useRef<number | null>(null)
  const biteWindowRef = useRef<number | null>(null)
  const fightFrameRef = useRef<number | null>(null)
  const fishRef = useRef<Fish | null>(null)
  const rarityRef = useRef<FishRarity | null>(null)
  const fishYRef = useRef(52)
  const fishVelocityRef = useRef(0)
  const greenYRef = useRef(41)
  const greenVelocityRef = useRef(0)
  const catchRef = useRef(20)
  const lastFightTimeRef = useRef(0)
  const resultLockedRef = useRef(false)
  const castAudioRef = useRef<HTMLAudioElement | null>(null)

  // Refs для лески
  const sceneRef = useRef<HTMLDivElement>(null)
  const rodRef = useRef<HTMLDivElement>(null)
  const bobberRef = useRef<HTMLDivElement>(null)
  const lineRef = useRef<SVGLineElement>(null)
  const lineRafRef = useRef<number | null>(null)

  // Создаём аудио для заброса один раз
  useEffect(() => {
    const audio = new Audio(fishingSound1)
    audio.preload = 'auto'
    castAudioRef.current = audio
    return () => {
      castAudioRef.current = null
    }
  }, [])

  const setPhase = useCallback((next: Phase) => {
    phaseRef.current = next
    setPhaseState(next)
  }, [])

  const clearRoundTimers = useCallback(() => {
    if (powerFrameRef.current !== null) cancelAnimationFrame(powerFrameRef.current)
    if (fightFrameRef.current !== null) cancelAnimationFrame(fightFrameRef.current)
    if (biteTimerRef.current !== null) window.clearTimeout(biteTimerRef.current)
    if (biteWindowRef.current !== null) window.clearTimeout(biteWindowRef.current)
    powerFrameRef.current = null
    fightFrameRef.current = null
    biteTimerRef.current = null
    biteWindowRef.current = null
  }, [])

  useEffect(() => () => clearRoundTimers(), [clearRoundTimers])

  const playCastSound = useCallback(() => {
    const audio = castAudioRef.current
    if (!audio) return
    try {
      audio.currentTime = 0
      void audio.play()
    } catch {
      // игнорируем ошибки воспроизведения
    }
  }, [])

  const playBiteSound = useCallback(() => {
    audioController.playTone({ frequency: 900, endFrequency: 470 })
  }, [])

  const resetToIdle = useCallback(() => {
    clearRoundTimers()
    holdingRef.current = false
    powerRef.current = 0
    fishRef.current = null
    rarityRef.current = null
    fishYRef.current = 52
    greenYRef.current = 41
    catchRef.current = 20
    setPower(0)
    setBobberX(58)
    setBobberTop(62)
    setBobberScale(1)
    setFishY(52)
    setGreenY(41)
    setCatchProgress(20)
    setRodJerk(0)
    setResult(null)
    resultLockedRef.current = false
    setPhase('idle')
  }, [clearRoundTimers, setPhase])

  // Функция для обновления счётчиков рыбок
  const addCatch = useCallback((rarity: FishRarity) => {
    setCatches((prev) => ({
      ...prev,
      [rarity]: (prev[rarity as 'common' | 'uncommon'] || 0) + 1,
    }))
  }, [])

  const awardCatch = useCallback(() => {
    const fish = fishRef.current
    const rarity = rarityRef.current
    if (!fish || !rarity) {
      resetToIdle()
      return
    }

    const rarityInfo = getRarity(rarity)
    // eslint-disable-next-line no-useless-assignment
    let message = ''
    let coins = 0

    if (rarity === 'common' || rarity === 'uncommon') {
      const needed = rarity === 'common' ? 3 : 2
      const current = catches[rarity] || 0
      const next = current + 1

      if (next >= needed) {
        coins = 1
        message = `${needed}/${needed} поймано — 1 монетка`
        // Сбрасываем счётчик для этой редкости
        setCatches((prev) => ({
          ...prev,
          [rarity]: 0,
        }))
      } else {
        addCatch(rarity)
        message = `${next}/${needed} — ещё ${needed - next} до 1 монетки`
      }
    } else {
      coins = rarityInfo.reward
      message = `+${coins} ${coins === 1 ? 'монетка' : coins >= 5 ? 'монеток' : 'монетки'}`
    }

    if (coins > 0) {
      addCoins(coins)
      setCoinBurst(coins)
      window.setTimeout(() => setCoinBurst(0), 900)
    }

    setResult({ fish, rarity, message })
    setPhase('result')

    resultLockedRef.current = true
    window.setTimeout(() => {
      resultLockedRef.current = false
    }, 500)
  }, [addCoins, addCatch, catches, resetToIdle, setPhase])

  const returnRod = useCallback(() => {
    clearRoundTimers()
    holdingRef.current = false
    setRodJerk(0)
    setPhase('returning')
    window.setTimeout(resetToIdle, 700)
  }, [clearRoundTimers, resetToIdle, setPhase])

  const runFight = useCallback(() => {
    if (phaseRef.current !== 'bite') return
    clearRoundTimers()
    holdingRef.current = false
    const fish = fishRef.current
    const rarity = rarityRef.current
    if (!fish || !rarity) return

    const difficulty = rarityDifficulty(rarity)
    fishYRef.current = 50
    greenYRef.current = 41
    fishVelocityRef.current =
      (Math.random() > 0.5 ? 1 : -1) * (0.32 + Math.random() * 0.2) * fish.speed
    greenVelocityRef.current = 0
    catchRef.current = 20
    lastFightTimeRef.current = performance.now()
    setFishY(50)
    setGreenY(41)
    setCatchProgress(20)
    setPhase('fight')

    const tick = (now: number) => {
      if (phaseRef.current !== 'fight') return

      // Вычисляем dt с защитой от слишком больших/малых значений
      const rawDt = (now - lastFightTimeRef.current) / 1000
      const dt = clamp(rawDt, MIN_DT, MAX_DT)
      lastFightTimeRef.current = now

      // Движение зелёной зоны
      const acceleration = holdingRef.current ? -180 : 180
      greenVelocityRef.current += acceleration * dt
      // Демпфирование (зависит от dt для стабильности)
      greenVelocityRef.current *= Math.pow(0.018, dt)
      const nextGreen = clamp(greenYRef.current + greenVelocityRef.current * dt, 1, 80)
      greenYRef.current = nextGreen

      // Движение рыбы
      const behaviorFactor =
        fish.behavior === 'dart'
          ? 1.75
          : fish.behavior === 'sinker' || fish.behavior === 'floater'
            ? 1.25
            : 1
      const gravity = fish.behavior === 'sinker' ? 0.85 : fish.behavior === 'floater' ? -0.65 : 0

      fishVelocityRef.current += gravity * dt * difficulty
      fishVelocityRef.current = clamp(
        fishVelocityRef.current,
        -1.7 * difficulty * fish.speed,
        1.7 * difficulty * fish.speed,
      )
      fishVelocityRef.current +=
        (Math.random() - 0.5) * fish.jump * difficulty * behaviorFactor * dt * 7

      let nextFish = fishYRef.current + fishVelocityRef.current * dt * 18
      if (nextFish <= 2 || nextFish >= 88) {
        fishVelocityRef.current *= -0.8
        nextFish = clamp(nextFish, 2, 88)
      }
      fishYRef.current = nextFish

      // Проверка попадания в зону
      const inside = nextFish >= greenYRef.current && nextFish <= greenYRef.current + greenHeight
      catchRef.current = clamp(catchRef.current + (inside ? 14 : -12) * dt, 0, 100)

      // Обновление состояния
      setGreenY(greenYRef.current)
      setFishY(fishYRef.current)
      setCatchProgress(catchRef.current)
      setRodJerk(Math.sin(now / 58) * 2.4)

      // Проверка условий победы/поражения
      if (catchRef.current >= 100) {
        awardCatch()
        return
      }
      if (catchRef.current <= 0) {
        returnRod()
        return
      }

      fightFrameRef.current = requestAnimationFrame(tick)
    }

    fightFrameRef.current = requestAnimationFrame(tick)
  }, [awardCatch, clearRoundTimers, greenHeight, returnRod, setPhase])

  const triggerBite = useCallback(() => {
    if (phaseRef.current !== 'waiting') return
    playBiteSound()
    setPhase('bite')
    biteWindowRef.current = window.setTimeout(() => {
      if (phaseRef.current === 'bite') returnRod()
    }, BITE_WINDOW)
  }, [returnRod, playBiteSound, setPhase])

  const startWaiting = useCallback(() => {
    const wait = BITE_MIN + Math.random() * (BITE_MAX - BITE_MIN)
    biteTimerRef.current = window.setTimeout(triggerBite, wait)
  }, [triggerBite])

  const cast = useCallback(() => {
    const value = powerRef.current
    const distance: FishingDistance = value < 34 ? 'near' : value < 67 ? 'mid' : 'far'
    fishRef.current = pickFish(distance)
    rarityRef.current = pickRarity(distance)
    setCastDistance(distance)
    setBobberX(58)
    setBobberTop(distance === 'near' ? 65 : distance === 'mid' ? 50 : 42)
    // Чем сильнее заброс — тем меньше поплавок: 100% → 40%
    const scale = 1 - (clamp(value, 0, 100) / 100) * (1 - BOBBER_MIN_SCALE)
    setBobberScale(scale)
    setPhase('casting')
    // Звук заброса удочки
    playCastSound()
    window.setTimeout(() => {
      if (phaseRef.current !== 'casting') return
      setPhase('waiting')
      startWaiting()
    }, 800)
  }, [playCastSound, setPhase, startWaiting])

  const startCharging = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (event.button !== 0 || phaseRef.current !== 'idle') return
      event.currentTarget.setPointerCapture(event.pointerId)
      holdingRef.current = true
      powerRef.current = 0
      powerDirectionRef.current = 1
      setPower(0)
      setPhase('charging')

      let lastTime = performance.now()

      const tick = (now: number) => {
        if (!holdingRef.current || phaseRef.current !== 'charging') return

        // Вычисляем dt с защитой от слишком больших значений
        const rawDt = (now - lastTime) / 1000
        const dt = Math.min(rawDt, MAX_DT)
        lastTime = now

        const speed = 165 // условных единиц в секунду
        let next = powerRef.current + powerDirectionRef.current * speed * dt

        if (next >= 100) {
          next = 100
          powerDirectionRef.current = -1
        } else if (next <= 0) {
          next = 0
          powerDirectionRef.current = 1
        }

        powerRef.current = next
        setPower(next)
        powerFrameRef.current = requestAnimationFrame(tick)
      }
      powerFrameRef.current = requestAnimationFrame(tick)
    },
    [setPhase],
  )

  const handlePointerDown = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (event.button !== 0) return
      if (phaseRef.current === 'idle') {
        startCharging(event)
        return
      }
      if (phaseRef.current === 'waiting') {
        event.currentTarget.setPointerCapture(event.pointerId)
        returnRod()
        return
      }
      if (phaseRef.current === 'bite') {
        event.currentTarget.setPointerCapture(event.pointerId)
        if (biteWindowRef.current !== null) window.clearTimeout(biteWindowRef.current)
        holdingRef.current = false
        runFight()
        return
      }
      if (phaseRef.current === 'fight') {
        event.currentTarget.setPointerCapture(event.pointerId)
        holdingRef.current = true
      }
    },
    [returnRod, runFight, startCharging],
  )

  const handlePointerUp = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (event.button !== 0) return
      if (event.currentTarget.hasPointerCapture(event.pointerId))
        event.currentTarget.releasePointerCapture(event.pointerId)

      if (phaseRef.current === 'charging') {
        holdingRef.current = false
        if (powerFrameRef.current !== null) cancelAnimationFrame(powerFrameRef.current)
        powerFrameRef.current = null
        cast()
        return
      }

      if (phaseRef.current === 'waiting') return
      if (phaseRef.current === 'bite') return

      if (phaseRef.current === 'fight') holdingRef.current = false
    },
    [cast, runFight],
  )

  const handlePointerCancel = useCallback(() => {
    if (phaseRef.current === 'charging') resetToIdle()
    holdingRef.current = false
  }, [resetToIdle])

  const closeResult = useCallback(() => {
    if (phaseRef.current === 'result' && !resultLockedRef.current) resetToIdle()
  }, [resetToIdle])

  // Леска видна, пока отрисован поплавок
  const showFishingLine = phase === 'waiting' || phase === 'bite' || phase === 'fight'

  useEffect(() => {
    if (!showFishingLine) return

    let active = true

    const update = () => {
      if (!active) return
      const scene = sceneRef.current
      const rodEl = rodRef.current
      const bobberEl = bobberRef.current
      const line = lineRef.current

      if (scene && rodEl && bobberEl && line) {
        const tip = rodEl.querySelector('.fishing-rod-tip') as HTMLElement | null
        if (tip) {
          // getBoundingClientRect учитывает все активные transform/анимации,
          // поэтому линия корректно тянется за дёргающимся кончиком удилища.
          const sceneRect = scene.getBoundingClientRect()
          const tipRect = tip.getBoundingClientRect()
          const bobberRect = bobberEl.getBoundingClientRect()

          const x1 = tipRect.left + tipRect.width / 2 - sceneRect.left
          const y1 = tipRect.top + tipRect.height / 2 - sceneRect.top
          const x2 = bobberRect.left + bobberRect.width / 2 - sceneRect.left
          const y2 = bobberRect.top + bobberRect.height / 2 - sceneRect.top

          line.setAttribute('x1', x1.toFixed(2))
          line.setAttribute('y1', y1.toFixed(2))
          line.setAttribute('x2', x2.toFixed(2))
          line.setAttribute('y2', y2.toFixed(2))
        }
      }

      lineRafRef.current = requestAnimationFrame(update)
    }

    lineRafRef.current = requestAnimationFrame(update)

    return () => {
      active = false
      if (lineRafRef.current !== null) cancelAnimationFrame(lineRafRef.current)
      lineRafRef.current = null
    }
  }, [showFishingLine])

  return (
    <div className={`fishing-window fishing-window--${phase}`}>
      <div
        ref={rodRef}
        className={`fishing-rod fishing-rod--${phase}`}
        style={{ '--rod-jerk': `${rodJerk}px` } as CSSProperties}
      >
        <img className="fishing-rod-image" src={activeRod} alt="" />
        {/* Якорь на кончике удилища — двигается вместе с .fishing-rod */}
        <span className="fishing-rod-tip" aria-hidden="true" />
      </div>

      <div
        ref={sceneRef}
        className="fishing-scene"
        aria-label="Пляж и море"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onContextMenu={(event) => event.preventDefault()}
      >
        {/* Леска: тянется от кончика удилища к поплавку */}
        {showFishingLine && (
          <svg className="fishing-line" aria-hidden="true">
            <line ref={lineRef} x1="0" y1="0" x2="0" y2="0" />
          </svg>
        )}

        {(phase === 'waiting' || phase === 'bite' || phase === 'fight') && (
          <div
            ref={bobberRef}
            className="fishing-bobber"
            style={
              {
                left: `${bobberX}%`,
                top: `${bobberTop}%`,
                '--bobber-scale': bobberScale,
              } as CSSProperties
            }
          >
            <img
              src={bobber}
              alt=""
              className={phase === 'bite' ? 'is-biting' : phase === 'fight' ? 'is-fighting' : ''}
            />
            {phase === 'bite' && <b>!</b>}
          </div>
        )}

        {phase === 'idle' && (
          <div className="fishing-prompt">Зажмите ЛКМ и отпустите для заброса</div>
        )}
        {phase === 'charging' && (
          <div className="fishing-cast-meter">
            <span>СИЛА ЗАБРОСА</span>
            <div className="fishing-cast-meter__track">
              <b style={{ bottom: `${power}%` }} aria-hidden="true" />
            </div>
          </div>
        )}
        {phase === 'casting' && <div className="fishing-cast-flash">ЗАБРОС!</div>}
        {phase === 'waiting' && (
          <div className="fishing-prompt fishing-prompt--waiting">Ждите поклёвку…</div>
        )}
        {phase === 'bite' && (
          <div className="fishing-bite-alert">
            <strong>!</strong>
            <span>НАЖМИТЕ ЛКМ!</span>
          </div>
        )}

        {phase === 'fight' && (
          <div className="fishing-fight">
            <div className="fishing-fight__title">Держите рыбку в зелёной зоне!</div>
            <div className="fishing-fight__layout">
              <div className="fishing-fight__track">
                <div className="fishing-fight__water-lines" />
                <div
                  className="fishing-fight__green"
                  style={{ top: `${greenY}%`, height: `${greenHeight}%` }}
                />
                <div className="fishing-fight__fish" style={{ top: `${fishY}%` }}>
                  <FishIcon size={34} />
                </div>
              </div>
              <div className="fishing-fight__progress">
                <i
                  style={{
                    transform: `scaleY(${catchProgress / 100})`,
                  }}
                />
              </div>
            </div>
          </div>
        )}

        <div className="fishing-inventory">
          <div>
            <b>Улов</b>
            <span className="rarity-dot rarity-dot--common" /> Common {catches.common}/3
          </div>
          <span className="rarity-dot rarity-dot--uncommon" /> Uncommon {catches.uncommon}/2
          <div className="fishing-distance-chip">{DISTANCE_LABELS[castDistance]}</div>
        </div>

        {coinBurst > 0 && <div className="fishing-coin-burst">🪙 +{coinBurst}</div>}
      </div>

      {phase === 'result' && result && (
        <div className="fishing-result-backdrop" onClick={closeResult}>
          <div
            className={`fishing-result fishing-result--${result.rarity}`}
            style={{ '--rarity-color': getRarity(result.rarity).color } as CSSProperties}
            onClick={closeResult}
          >
            <span className="fishing-result__rarity">{getRarity(result.rarity).name}</span>
            <div className="fishing-result__fish">
              <span
                className="fishing-result__fish-image"
                style={{
                  backgroundImage: `url(${fishSheet})`,
                  backgroundPosition: `${result.fish.sprite.column * 25}% ${result.fish.sprite.row * 50}%`,
                }}
                aria-hidden="true"
              />
            </div>
            <h2>{result.fish.name}</h2>
            <p>{result.fish.description}</p>
            <strong>{result.message}</strong>
            <small>Нажмите в любом месте, чтобы продолжить</small>
          </div>
        </div>
      )}

      <button
        type="button"
        className="fishing-navigator__back-zone"
        onClick={onClose}
        aria-label={history.length ? 'Вернуться назад' : 'Вернуться к карте'}
      />
    </div>
  )
}
