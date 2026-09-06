import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CORRECT_STATION_ID, radioStations } from './stations'

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

const RADIO_MIN = 87
const RADIO_MAX = 108
const RADIO_STEP = 0.1
const MAX_TUNING_DISTANCE = 0.2

// Плавность изменения громкости.
// Чем больше значение, тем медленнее происходит изменение.
const AUDIO_RAMP_SECONDS = 0.04

// Длина генерируемого шума.
// Больший буфер делает повторение практически незаметным.
const NOISE_DURATION_SECONDS = 8

// Длина кроссфейда между концом и началом шума.
// 100 мс достаточно, чтобы убрать щелчок и провал громкости.
const NOISE_CROSSFADE_SECONDS = 0.12

let audioContext: AudioContext | null = null

let noiseSource: AudioBufferSourceNode | null = null
let noiseGain: GainNode | null = null

const stationAudio = new Map<string, HTMLAudioElement>()
const stationGains = new Map<string, GainNode>()
const stationTrackIndexes = new Map<string, number>()
const pendingInitialSeek = new Map<string, number>()

const getAudioContext = () => {
  audioContext ??= new AudioContext()
  return audioContext
}

/**
 * Создаёт бесшовный loop белого шума.
 *
 * В старой версии начало и конец буфера затухали до 0.
 * Из-за этого каждые 2 секунды возникал слышимый провал.
 *
 * Здесь конец буфера плавно смешивается с началом.
 * При переходе:
 *
 *   конец ──────╮
 *               ╰──── начало
 *
 * громкость не падает в ноль.
 */
const createSeamlessNoiseBuffer = (context: AudioContext) => {
  const sampleRate = context.sampleRate
  const length = Math.floor(sampleRate * NOISE_DURATION_SECONDS)
  const buffer = context.createBuffer(1, length, sampleRate)
  const data = buffer.getChannelData(0)

  // Генерируем обычный white noise.
  for (let index = 0; index < length; index += 1) {
    data[index] = Math.random() * 2 - 1
  }

  const crossfadeSamples = Math.floor(sampleRate * NOISE_CROSSFADE_SECONDS)

  /**
   * Последние N сэмплов постепенно смешиваются
   * с первыми N сэмплами.
   *
   * В самом конце:
   *   data[last] ≈ data[0]
   *
   * Поэтому переход loop -> начало не создаёт скачка.
   */
  for (let index = 0; index < crossfadeSamples; index += 1) {
    const fade = index / crossfadeSamples

    const tailIndex = length - crossfadeSamples + index
    const headIndex = index

    const tail = data[tailIndex]
    const head = data[headIndex]

    data[tailIndex] = tail * (1 - fade) + head * fade
  }

  return buffer
}

const ensureNoise = () => {
  const context = getAudioContext()

  if (noiseSource && noiseGain) {
    return
  }

  const buffer = createSeamlessNoiseBuffer(context)

  noiseSource = context.createBufferSource()
  noiseGain = context.createGain()

  noiseSource.buffer = buffer
  noiseSource.loop = true

  // Радио изначально выключено.
  noiseGain.gain.value = 0

  noiseSource.connect(noiseGain)
  noiseGain.connect(context.destination)

  noiseSource.start()
}

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

/**
 * Плавно меняет громкость.
 *
 * Важно:
 * здесь мы НЕ останавливаем аудио,
 * НЕ меняем currentTime и НЕ создаём новый источник.
 *
 * Поэтому при вращении частоты шум остаётся непрерывным.
 */
const rampGain = (gain: GainNode, target: number) => {
  if (!audioContext) return

  const now = audioContext.currentTime

  gain.gain.cancelScheduledValues(now)

  gain.gain.setTargetAtTime(clamp(target, 0, 1), now, AUDIO_RAMP_SECONDS)
}

/**
 * Получает один HTMLAudioElement для станции.
 *
 * Важно: один элемент создаётся один раз и живёт
 * всё время существования страницы.
 */
const getStationAudio = (stationId: string, trackSrcs: string[]) => {
  const existing = stationAudio.get(stationId)

  if (existing) {
    return existing
  }

  const context = getAudioContext()

  const audio = new Audio(trackSrcs[0])

  const gain = context.createGain()

  audio.preload = 'auto'
  audio.volume = 1

  // Реальная громкость контролируется через Web Audio GainNode.
  gain.gain.value = 0

  const source = context.createMediaElementSource(audio)

  source.connect(gain).connect(context.destination)

  /**
   * Если это первое включение правильной станции,
   * переносим проигрывание на 5 секунд.
   */
  audio.addEventListener('loadedmetadata', () => {
    const seekTo = pendingInitialSeek.get(stationId)

    if (seekTo === undefined) {
      return
    }

    pendingInitialSeek.delete(stationId)

    try {
      audio.currentTime = Math.min(seekTo, Math.max(0, audio.duration - 0.05))
    } catch {
      // Браузер может ещё не разрешать менять currentTime.
    }
  })

  /**
   * Когда заканчивается трек:
   *
   * track-01
   *   ↓
   * track-02
   *   ↓
   * track-03
   *   ↓
   * ...
   *   ↓
   * track-01
   *
   * При этом GainNode станции остаётся тем же.
   * Поэтому громкость НЕ сбрасывается.
   */
  audio.addEventListener('ended', () => {
    const station = radioStations.find((item) => item.id === stationId)

    if (!station) {
      return
    }

    const nextIndex = ((stationTrackIndexes.get(stationId) ?? 0) + 1) % station.trackSrcs.length

    stationTrackIndexes.set(stationId, nextIndex)

    audio.src = station.trackSrcs[nextIndex]

    audio.currentTime = 0

    void audio.play().catch(() => undefined)
  })

  stationAudio.set(stationId, audio)

  stationGains.set(stationId, gain)

  return audio
}

const ensureStationPlayback = (stationId: string, startAt?: number) => {
  const station = radioStations.find((item) => item.id === stationId)

  if (!station) {
    return
  }

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

/**
 * Синхронизирует ВСЕ источники звука.
 *
 * Ключевой момент:
 * аудио никогда не перезапускается при смене громкости
 * или частоты.
 *
 * Мы меняем только GainNode.
 */
const syncAudio = (state: Pick<RadioState, 'isPowered' | 'volume' | 'frequency'>) => {
  try {
    ensureNoise()

    const context = getAudioContext()

    if (context.state === 'suspended' && state.isPowered) {
      void context.resume()
    }

    /**
     * Все станции постоянно проигрываются в фоне.
     *
     * Но слышна только та, которая соответствует
     * текущей частоте.
     */
    radioStations.forEach((station) => {
      const audio = getStationAudio(station.id, station.trackSrcs)

      const gain = stationGains.get(station.id)

      if (!gain) {
        return
      }

      const stationVolume = state.isPowered
        ? state.volume * getStationSignal(station.frequency, state.frequency)
        : 0

      rampGain(gain, stationVolume)

      /**
       * play() здесь не начинает трек заново.
       *
       * Если audio уже играет — браузер просто
       * оставляет его на текущей позиции.
       */
      if (audio.paused) {
        void audio.play().catch(() => undefined)
      }
    })

    const nearest = getNearestStation(state.frequency)

    const distance = Math.abs(nearest.frequency - state.frequency)

    const noisePercent = getNoisePercent(nearest.id, distance)

    if (noiseGain) {
      const noiseVolume = state.isPowered ? state.volume * noisePercent : 0

      rampGain(noiseGain, noiseVolume)
    }
  } catch {
    /**
     * Браузер может запретить AudioContext
     * до первого пользовательского действия.
     *
     * В этом случае просто ждём следующего
     * взаимодействия пользователя.
     */
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

/**
 * При HMR / обновлении кода
 * плавно выключаем весь звук.
 *
 * Это также защищает от ситуации,
 * когда старый AudioContext остаётся
 * играть вместе с новым.
 */
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    stationGains.forEach((gain) => {
      rampGain(gain, 0)
    })

    if (noiseGain) {
      rampGain(noiseGain, 0)
    }

    stationAudio.forEach((audio) => {
      audio.pause()
    })

    if (noiseSource) {
      try {
        noiseSource.stop()
      } catch {
        // Источник мог уже быть остановлен.
      }

      noiseSource.disconnect()
      noiseSource = null
    }

    if (noiseGain) {
      noiseGain.disconnect()
      noiseGain = null
    }
  })
}

export const isCorrectRadioFound = () =>
  useRadioStore.getState().discoveredStationIds.includes(CORRECT_STATION_ID)
