import { useCallback, useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react'
import { Fish as FishIcon, X } from 'lucide-react'
import { usePawCoinStore } from '@/features/currency/model/store'
import { useInventoryStore } from '@/features/inventory/model/store'
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
import './FishingGame.css'

type Phase = 'idle' | 'charging' | 'casting' | 'returning' | 'waiting' | 'bite' | 'fight' | 'result'
type Props = { onClose?: () => void }
type CatchResult = { fish: Fish; rarity: FishRarity; message: string }

const BITE_MIN = 8000
const BITE_MAX = 15000
const BITE_WINDOW = 1000
const GREEN_HEIGHT = 18

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))

export function FishingGame({ onClose }: Props) {
  const addCoins = usePawCoinStore((state) => state.addPawCoins)
  const inventory = useInventoryStore((state) => state.items)
  const addInventoryItem = useInventoryStore((state) => state.addItem)
  const removeInventoryItem = useInventoryStore((state) => state.removeItem)

  const [phase, setPhaseState] = useState<Phase>('idle')
  const [power, setPower] = useState(0)
  const [bobberX, setBobberX] = useState(54)
  const [bobberTop, setBobberTop] = useState(62)
  const [biteBobber, setBiteBobber] = useState(false)
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
  const audioRef = useRef<AudioContext | null>(null)

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

  const playBiteSound = useCallback(() => {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    if (!AudioContextClass) return
    const context = audioRef.current ?? new AudioContextClass()
    audioRef.current = context
    void context.resume()
    const now = context.currentTime
    const oscillator = context.createOscillator()
    const gain = context.createGain()
    oscillator.type = 'square'
    oscillator.frequency.setValueAtTime(900, now)
    oscillator.frequency.exponentialRampToValueAtTime(470, now + 0.12)
    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(0.13, now + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2)
    oscillator.connect(gain).connect(context.destination)
    oscillator.start(now)
    oscillator.stop(now + 0.21)
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
    setBiteBobber(false)
    setFishY(52)
    setGreenY(41)
    setCatchProgress(20)
    setRodJerk(0)
    setResult(null)
    setPhase('idle')
  }, [clearRoundTimers, setPhase])

  const awardCatch = useCallback(() => {
    const fish = fishRef.current
    const rarity = rarityRef.current
    if (!fish || !rarity) {
      resetToIdle()
      return
    }

    const rarityInfo = getRarity(rarity)
    let message = ''
    let coins = 0

    if (rarity === 'common' || rarity === 'uncommon') {
      const needed = rarity === 'common' ? 3 : 2
      const itemId = `fishing-${rarity}`
      const current = inventory.find((item) => item.id === itemId)?.quantity ?? 0
      const next = current + 1

      if (next >= needed) {
        if (current > 0) removeInventoryItem(itemId, current)
        coins = 1
        message = `${needed}/${needed} поймано — 1 монетка`
      } else {
        addInventoryItem({
          id: itemId,
          name: rarity === 'common' ? 'Common рыба' : 'Uncommon рыба',
          icon: rarity === 'common' ? '🐟' : '🐠',
          rarity,
          quantity: 1,
        })
        message = `${next}/${needed} — ещё ${needed - next} до 1 монетки`
      }
    } else {
      coins = rarityInfo.reward
      message = `+${coins} ${coins === 1 ? 'монетка' : 'монетки'}`
    }

    if (coins > 0) {
      addCoins(coins)
      setCoinBurst(coins)
      window.setTimeout(() => setCoinBurst(0), 900)
    }

    setResult({ fish, rarity, message })
    setPhase('result')
  }, [addCoins, addInventoryItem, inventory, removeInventoryItem, resetToIdle, setPhase])

  const returnRod = useCallback(() => {
    clearRoundTimers()
    holdingRef.current = false
    setBiteBobber(false)
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
    fishVelocityRef.current = (Math.random() > 0.5 ? 1 : -1) * (0.32 + Math.random() * 0.2) * fish.speed
    greenVelocityRef.current = 0
    catchRef.current = 20
    lastFightTimeRef.current = performance.now()
    setFishY(50)
    setGreenY(41)
    setCatchProgress(20)
    setBiteBobber(false)
    setPhase('fight')

    const tick = (now: number) => {
      if (phaseRef.current !== 'fight') return
      const dt = Math.min(0.035, Math.max(0.008, (now - lastFightTimeRef.current) / 1000))
      lastFightTimeRef.current = now

      const acceleration = holdingRef.current ? -180 : 180
      greenVelocityRef.current += acceleration * dt
      greenVelocityRef.current *= Math.pow(0.018, dt)
      const nextGreen = clamp(greenYRef.current + greenVelocityRef.current * dt, 1, 80)
      greenYRef.current = nextGreen

      const behaviorFactor = fish.behavior === 'dart' ? 1.75 : fish.behavior === 'sinker' || fish.behavior === 'floater' ? 1.25 : 1
      const gravity = fish.behavior === 'sinker' ? 0.85 : fish.behavior === 'floater' ? -0.65 : 0
      fishVelocityRef.current += gravity * dt * difficulty
      fishVelocityRef.current = clamp(fishVelocityRef.current, -1.7 * difficulty * fish.speed, 1.7 * difficulty * fish.speed)
      fishVelocityRef.current += (Math.random() - 0.5) * fish.jump * difficulty * behaviorFactor * dt * 7
      let nextFish = fishYRef.current + fishVelocityRef.current * dt * 18
      if (nextFish <= 2 || nextFish >= 88) {
        fishVelocityRef.current *= -0.8
        nextFish = clamp(nextFish, 2, 88)
      }
      fishYRef.current = nextFish

      const inside = nextFish >= greenYRef.current && nextFish <= greenYRef.current + GREEN_HEIGHT
      catchRef.current = clamp(catchRef.current + (inside ? 14 : -12) * dt, 0, 100)

      setGreenY(greenYRef.current)
      setFishY(fishYRef.current)
      setCatchProgress(catchRef.current)
      setRodJerk(Math.sin(now / 58) * 2.4)

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
  }, [awardCatch, clearRoundTimers, returnRod, setPhase])

  const triggerBite = useCallback(() => {
    if (phaseRef.current !== 'waiting') return
    playBiteSound()
    setBiteBobber(true)
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
    setBobberTop(distance === 'near' ? 70 : distance === 'mid' ? 59 : 47)
    setPhase('casting')
    window.setTimeout(() => {
      if (phaseRef.current !== 'casting') return
      setPhase('waiting')
      startWaiting()
    }, 800)
  }, [setPhase, startWaiting])

  const startCharging = useCallback((event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || phaseRef.current !== 'idle') return
    event.currentTarget.setPointerCapture(event.pointerId)
    holdingRef.current = true
    powerRef.current = 0
    powerDirectionRef.current = 1
    setPower(0)
    setPhase('charging')

    const tick = () => {
      if (!holdingRef.current || phaseRef.current !== 'charging') return
      let next = powerRef.current + powerDirectionRef.current * 1.65
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
  }, [setPhase])

  const handlePointerDown = useCallback((event: PointerEvent<HTMLDivElement>) => {
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
  }, [returnRod, runFight, startCharging])

  const handlePointerUp = useCallback((event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)

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
  }, [cast, runFight])

  const handlePointerCancel = useCallback(() => {
    if (phaseRef.current === 'charging') resetToIdle()
    holdingRef.current = false
  }, [resetToIdle])

  const closeResult = useCallback(() => {
    if (phaseRef.current === 'result') resetToIdle()
  }, [resetToIdle])

  const commonCount = inventory.find((item) => item.id === 'fishing-common')?.quantity ?? 0
  const uncommonCount = inventory.find((item) => item.id === 'fishing-uncommon')?.quantity ?? 0

  return (
    <div
      className={`fishing-window fishing-window--${phase}`}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onContextMenu={(event) => event.preventDefault()}
    >
      <button
        type="button"
        className="fishing-window__close"
        onPointerDown={(event) => event.stopPropagation()}
        onPointerUp={(event) => event.stopPropagation()}
        onClick={onClose}
        aria-label="Закрыть рыбалку"
        title="Закрыть"
      >
        <X size={22} />
      </button>

      <div className="fishing-scene" aria-label="Пляж и море">
        <div className="fishing-sky" />
        <div className="fishing-sun" />
        <div className="fishing-cloud fishing-cloud--one" />
        <div className="fishing-cloud fishing-cloud--two" />
        <div className="fishing-ocean">
          <span className="wave wave--one" />
          <span className="wave wave--two" />
          <span className="wave wave--three" />
          <span className="deep-water" /><span className="fishing-sector-lines" />
        </div>
        <div className="fishing-sand" />
        <div className="fishing-rock fishing-rock--one" />
        <div className="fishing-rock fishing-rock--two" />
        <div className="fishing-gear"><span>🪣</span><span>🪱</span><span>🪝</span><span>🧺</span></div>

        <div className={`fishing-rod fishing-rod--${phase}`} style={{ '--rod-jerk': `${rodJerk}px` } as CSSProperties}>
          <div className="fishing-arm" />
          <div className="fishing-rod__shaft" />
          <div className="fishing-rod__reel" />
          <div className="fishing-rod__line" />
        </div>

        {(phase === 'waiting' || phase === 'bite') && (
          <div className="fishing-bobber" style={{ left: `${bobberX}%`, top: `${bobberTop}%` }}>
            <span className={biteBobber ? 'is-biting' : ''} />
            {phase === 'bite' && <b>!</b>}
          </div>
        )}

        <div className="fishing-title">
          <span>🎣 РЫБАЛКА</span>
          <strong>{phase === 'fight' ? 'БОРЬБА С РЫБОЙ' : DISTANCE_LABELS[castDistance]}</strong>
        </div>

        {phase === 'idle' && <div className="fishing-prompt">Зажмите ЛКМ и отпустите для заброса</div>}
        {phase === 'charging' && (
          <div className="fishing-cast-meter">
            <span>СИЛА ЗАБРОСА</span>
            <div className="fishing-cast-meter__track"><b style={{ bottom: `${power}%` }} aria-hidden="true" /></div>
          </div>
        )}
        {phase === 'casting' && <div className="fishing-cast-flash">ЗАБРОС!</div>}
        {phase === 'waiting' && <div className="fishing-prompt fishing-prompt--waiting">Ждите поклёвку…</div>}
        {phase === 'bite' && (
          <div className="fishing-bite-alert">
            <strong>!</strong><span>НАЖМИТЕ ЛКМ!</span>
          </div>
        )}

        {phase === 'fight' && (
          <div className="fishing-fight">
            <div className="fishing-fight__title">Держите рыбку в зелёной зоне!</div>
            <div className="fishing-fight__layout">
              <div className="fishing-fight__track">
                <div className="fishing-fight__water-lines" />
                <div className="fishing-fight__green" style={{ top: `${greenY}%`, height: `${GREEN_HEIGHT}%` }} />
                <div className="fishing-fight__fish" style={{ top: `${fishY}%` }}><FishIcon size={34} /></div>
              </div>
              <div className="fishing-fight__progress">
                <i
                  style={{
                    transform: `scaleY(${catchProgress / 100})`,
                  }}
                />
                <span>{Math.round(catchProgress)}%</span>
              </div>
            </div>
            <div className="fishing-fight__hint">ЛКМ вверх • отпустили — вниз • держите рыбку внутри зелёной зоны</div>
          </div>
        )}

        <div className="fishing-inventory">
          <div><b>Улов</b><span className="rarity-dot rarity-dot--common" /> Common {commonCount}/3</div>
          <div><span className="rarity-dot rarity-dot--uncommon" /> Uncommon {uncommonCount}/2</div>
          <div className="fishing-distance-chip">{DISTANCE_LABELS[castDistance]}</div>
        </div>

        {coinBurst > 0 && <div className="fishing-coin-burst">🪙 +{coinBurst}</div>}

        {phase === 'result' && result && (
          <div className="fishing-result-backdrop" onClick={closeResult}>
            <button
              type="button"
              className={`fishing-result fishing-result--${result.rarity}`}
              style={{ '--rarity-color': getRarity(result.rarity).color } as CSSProperties}
              onClick={(event) => { event.stopPropagation(); closeResult() }}
            >
              <span className="fishing-result__rarity">{getRarity(result.rarity).name}</span>
              <div className="fishing-result__fish" style={{ '--rarity-color': getRarity(result.rarity).color } as CSSProperties}>{result.fish.emoji}</div>
              <h2>{result.fish.name}</h2>
              <p>{result.fish.description}</p>
              <strong>{result.message}</strong>
              <small>Нажмите в любом месте, чтобы продолжить</small>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
