import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { audioController, type Sound } from '@/shared/lib/audio/audioController'
import { CORRECT_STATION_ID, radioStations } from './stations'

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))
const RADIO_MIN = 87
const RADIO_MAX = 108
const RADIO_STEP = 0.1
const MAX_TUNING_DISTANCE = 0.2

// Local mix coefficients; the controller applies master volume after this mix.
const RADIO_MIX = { station: 1, noise: 0.3 }
let noise: ReturnType<typeof audioController.createNoiseLoop> | null = null
const stationAudio = new Map<string, Sound>()
const stationTrackIndexes = new Map<string, number>()
const pendingInitialSeek = new Map<string, number>()

const getNearestStation = (frequency: number) =>
  radioStations.reduce(
    (best, station) =>
      Math.abs(station.frequency - frequency) < Math.abs(best.frequency - frequency)
        ? station
        : best,
    radioStations[0],
  )

const isStationInRange = (stationFrequency: number, frequency: number) =>
  Math.abs(stationFrequency - frequency) <= MAX_TUNING_DISTANCE + 0.0001

/**
 * Насколько хорошо слышна станция.
 *
 * 0%   — станцию не слышно
 * 40%  — далеко от центра
 * 75%  — одно деление
 * 100% — точное попадание
 */
const getStationSignal = (stationFrequency: number, frequency: number) => {
  const distance = Math.abs(stationFrequency - frequency)

  if (distance < 0.0001) return 1

  if (distance <= RADIO_STEP + 0.0001) {
    return 0.75
  }

  if (distance <= RADIO_STEP * 2 + 0.0001) {
    return 0.4
  }

  return 0
}

/**
 * Громкость фонового "пшшш".
 *
 * Правильная станция:
 *
 * центр       0%
 * ±0.1 MHz   25%
 * ±0.2 MHz   60%
 *
 * Остальные станции:
 *
 * центр       15%
 * ±0.1 MHz   35%
 * ±0.2 MHz   70%
 */
const getNoisePercent = (stationId: string, distance: number) => {
  if (stationId === CORRECT_STATION_ID) {
    if (distance < 0.0001) return 0

    if (distance <= RADIO_STEP + 0.0001) {
      return 0.25
    }

    if (distance <= RADIO_STEP * 2 + 0.0001) {
      return 0.6
    }

    return 1
  }

  if (distance < 0.0001) return 0.15

  if (distance <= RADIO_STEP + 0.0001) {
    return 0.35
  }

  if (distance <= RADIO_STEP * 2 + 0.0001) {
    return 0.7
  }

  return 1
}

const getStationAudio = (stationId: string, trackSrcs: string[]) => {
  const existing = stationAudio.get(stationId)
  if (existing) return existing

  const sound = audioController.createSound(trackSrcs[0], { volume: 0 })
  const audio = sound.element
  audio.addEventListener('loadedmetadata', () => {
    const seekTo = pendingInitialSeek.get(stationId)
    if (seekTo === undefined || !Number.isFinite(audio.duration)) return
    pendingInitialSeek.delete(stationId)
    audio.currentTime = Math.min(seekTo, Math.max(0, audio.duration - 0.05))
  })
  audio.addEventListener('ended', () => {
    const nextIndex = ((stationTrackIndexes.get(stationId) ?? 0) + 1) % trackSrcs.length
    stationTrackIndexes.set(stationId, nextIndex)
    audio.src = trackSrcs[nextIndex]
    audio.currentTime = 0
    if (useRadioStore.getState().isPowered) void sound.play()
  })
  stationAudio.set(stationId, sound)
  return sound
}

const ensureStationPlayback = (stationId: string, startAt?: number) => {
  const station = radioStations.find((item) => item.id === stationId)
  if (!station) return
  const sound = getStationAudio(station.id, station.trackSrcs)
  const audio = sound.element
  if (startAt !== undefined) {
    if (Number.isFinite(audio.duration) && audio.duration > 0) {
      audio.currentTime = Math.min(startAt, Math.max(0, audio.duration - 0.05))
    } else {
      pendingInitialSeek.set(stationId, startAt)
    }
  }
  void sound.play()
}

const syncAudio = (state: Pick<RadioState, 'isPowered' | 'volume' | 'frequency'>) => {
  if (!state.isPowered) {
    noise?.setVolume(0)
    stationAudio.forEach((sound) => {
      sound.setVolume(0)
      sound.pause()
    })
    return
  }
  try {
    void audioController.unlock()
    noise ??= audioController.createNoiseLoop()
    radioStations.forEach((station) => {
      const sound = getStationAudio(station.id, station.trackSrcs)
      sound.setVolume(
        state.volume * RADIO_MIX.station * getStationSignal(station.frequency, state.frequency),
      )
      // Volume/frequency changes retain the playback position of every station.
      if (sound.element.paused) void sound.play()
    })
    const nearest = getNearestStation(state.frequency)
    const distance = Math.abs(nearest.frequency - state.frequency)
    noise.setVolume(state.volume * RADIO_MIX.noise * getNoisePercent(nearest.id, distance))
  } catch {
    // Retry on the next user interaction if audio is unavailable.
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
      /**
       * ВАЖНО:
       * питание специально не сохраняем.
       *
       * После F5 радио будет выключено,
       * но пользовательская громкость,
       * частота и найденная станция сохранятся.
       */
      isPowered: false,

      volume: 0.7,

      frequency: 98,

      discoveredStationIds: [],

      setPowered: (value) => {
        set({
          isPowered: value,
        })

        syncAudio({
          ...get(),
          isPowered: value,
        })
      },

      setVolume: (value) => {
        const next = clamp(value, 0, 1)

        set({
          volume: next,
        })

        syncAudio({
          ...get(),
          volume: next,
        })
      },

      setFrequency: (value) => {
        const next = Number(clamp(value, RADIO_MIN, RADIO_MAX).toFixed(1))

        const nearest = getNearestStation(next)

        const current = get()

        const isCorrectInRange =
          nearest.id === CORRECT_STATION_ID && isStationInRange(nearest.frequency, next)

        const isNewCorrectStation =
          current.isPowered &&
          isCorrectInRange &&
          !current.discoveredStationIds.includes(CORRECT_STATION_ID)

        /**
         * Первый вход в диапазон 102.9.
         *
         * Только здесь ставим начало трека
         * на 5 секунд.
         */
        if (isNewCorrectStation) {
          set({
            frequency: next,

            discoveredStationIds: [...current.discoveredStationIds, CORRECT_STATION_ID],
          })

          ensureStationPlayback(CORRECT_STATION_ID, 5)

          syncAudio({
            ...current,
            frequency: next,
          })

          return
        }

        set({
          frequency: next,
        })

        syncAudio({
          ...get(),
          frequency: next,
        })
      },
    }),
    {
      name: 'beach-party-radio',

      partialize: (state) => ({
        volume: state.volume,

        frequency: state.frequency,

        discoveredStationIds: state.discoveredStationIds,
      }),
    },
  ),
)

export const syncRadioAudio = () => syncAudio(useRadioStore.getState())

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    stationAudio.forEach((sound) => sound.dispose())
    stationAudio.clear()
    noise?.dispose()
    noise = null
  })
}

export const isCorrectRadioFound = () =>
  useRadioStore.getState().discoveredStationIds.includes(CORRECT_STATION_ID)
