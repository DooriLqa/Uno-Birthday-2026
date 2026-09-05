import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { radioStations } from './stations'

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))
const RADIO_MIN = 87
const RADIO_MAX = 108
const RADIO_STEP = 0.1
const MAX_TUNING_DISTANCE = 0.2

let audioContext: AudioContext | null = null
let noiseSource: AudioBufferSourceNode | null = null
let noiseGain: GainNode | null = null

const stationAudio = new Map<string, HTMLAudioElement>()
const stationTrackIndexes = new Map<string, number>()
const pendingInitialSeek = new Map<string, number>()

const getAudioContext = () => {
  audioContext ??= new AudioContext()
  return audioContext
}

const ensureNoise = () => {
  const context = getAudioContext()
  if (noiseSource) return

  const buffer = context.createBuffer(1, context.sampleRate * 2, context.sampleRate)
  const data = buffer.getChannelData(0)
  for (let index = 0; index < data.length; index += 1) data[index] = Math.random() * 2 - 1

  noiseSource = context.createBufferSource()
  noiseGain = context.createGain()
  noiseSource.buffer = buffer
  noiseSource.loop = true
  noiseSource.connect(noiseGain).connect(context.destination)
  noiseSource.start()
}

const getStationVolume = (stationFrequency: number, frequency: number) => {
  const distance = Math.abs(stationFrequency - frequency)
  if (distance < 0.0001) return 1
  if (distance <= RADIO_STEP + 0.0001) return 0.75
  if (distance <= RADIO_STEP * 2 + 0.0001) return 0.4
  return 0
}

const getNoisePercent = (distance: number) => {
  if (distance < 0.0001) return 0.05
  if (distance <= RADIO_STEP + 0.0001) return 0.25
  if (distance <= RADIO_STEP * 2 + 0.0001) return 0.6
  return 1
}

const isStationInRange = (stationFrequency: number, frequency: number) =>
  Math.abs(stationFrequency - frequency) <= MAX_TUNING_DISTANCE + 0.0001

const getNearestStation = (frequency: number) =>
  radioStations.reduce(
    (best, station) =>
      Math.abs(station.frequency - frequency) < Math.abs(best.frequency - frequency)
        ? station
        : best,
    radioStations[0],
  )

const getStationAudio = (stationId: string, trackSrcs: string[]) => {
  const existing = stationAudio.get(stationId)
  if (existing) return existing

  const audio = new Audio(trackSrcs[0])
  audio.preload = 'auto'
  audio.volume = 0

  audio.addEventListener('loadedmetadata', () => {
    const seekTo = pendingInitialSeek.get(stationId)
    if (seekTo === undefined) return
    pendingInitialSeek.delete(stationId)
    try {
      audio.currentTime = Math.min(seekTo, Math.max(0, audio.duration - 0.05))
    } catch {
      // Метаданные ещё могут быть недоступны в отдельных браузерах.
    }
  })

  audio.addEventListener('ended', () => {
    const station = radioStations.find((item) => item.id === stationId)
    if (!station) return

    const nextIndex = ((stationTrackIndexes.get(stationId) ?? 0) + 1) % station.trackSrcs.length
    stationTrackIndexes.set(stationId, nextIndex)
    audio.src = station.trackSrcs[nextIndex]
    audio.currentTime = 0

    const state = useRadioStore.getState()
    audio.volume = state.isPowered
      ? state.volume * getStationVolume(station.frequency, state.frequency)
      : 0
    void audio.play().catch(() => undefined)
  })

  stationAudio.set(stationId, audio)
  return audio
}

const ensureStationPlayback = (stationId: string, startAt?: number) => {
  const station = radioStations.find((item) => item.id === stationId)
  if (!station) return

  const audio = getStationAudio(station.id, station.trackSrcs)
  if (startAt !== undefined) {
    if (Number.isFinite(audio.duration) && audio.duration > 0) {
      audio.currentTime = Math.min(startAt, Math.max(0, audio.duration - 0.05))
    } else {
      pendingInitialSeek.set(stationId, startAt)
    }
  }

  void audio.play().catch(() => undefined)
}

const syncAudio = (state: Pick<RadioState, 'isPowered' | 'volume' | 'frequency'>) => {
  try {
    ensureNoise()
    const context = getAudioContext()
    if (context.state === 'suspended' && state.isPowered) void context.resume()

    radioStations.forEach((station) => {
      const audio = getStationAudio(station.id, station.trackSrcs)
      // Все станции постоянно идут в фоне. Слушатель слышит только ту,
      // к которой настроился, а громкость пользователя применяется ко всем трекам.
      audio.volume = state.isPowered
        ? state.volume * getStationVolume(station.frequency, state.frequency)
        : 0
      void audio.play().catch(() => undefined)
    })

    const nearest = getNearestStation(state.frequency)
    const distance = Math.abs(nearest.frequency - state.frequency)
    const noisePercent = getNoisePercent(distance)
    noiseGain?.gain.setTargetAtTime(
      state.isPowered ? state.volume * noisePercent : 0,
      context.currentTime,
      0.03,
    )
  } catch {
    // Браузер может запретить звук до первого пользовательского действия.
  }
}

type RadioState = {
  isPowered: boolean
  volume: number
  frequency: number
  discoveredStationIds: string[]
  setPowered: (value: boolean) => void
  setVolume: (value: number) => void
  setFrequency: (value: number) => void
}

export const useRadioStore = create<RadioState>()(
  persist(
    (set, get) => ({
      isPowered: false,
      volume: 0.7,
      frequency: 98,
      discoveredStationIds: [],
      setPowered: (value) => {
        set({ isPowered: value })
        syncAudio({ ...get(), isPowered: value })
      },
      setVolume: (value) => {
        const next = clamp(value, 0, 1)
        set({ volume: next })
        syncAudio({ ...get(), volume: next })
      },
      setFrequency: (value) => {
        const next = Number(clamp(value, RADIO_MIN, RADIO_MAX).toFixed(1))
        const nearest = getNearestStation(next)
        const current = get()
        const isInRange = isStationInRange(nearest.frequency, next)
        const isNewStation =
          current.isPowered && isInRange && !current.discoveredStationIds.includes(nearest.id)

        if (isNewStation) {
          const discoveredStationIds = [...current.discoveredStationIds, nearest.id]
          set({ frequency: next, discoveredStationIds })
          ensureStationPlayback(nearest.id, 5)
          syncAudio({ ...current, frequency: next })
          return
        }

        set({ frequency: next })
        syncAudio({ ...get(), frequency: next })
      },
    }),
    { name: 'beach-party-radio' },
  ),
)

export const syncRadioAudio = () => syncAudio(useRadioStore.getState())
