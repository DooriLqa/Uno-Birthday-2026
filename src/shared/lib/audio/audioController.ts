export const clampVolume = (value: number) =>
  Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0

export type Sound = {
  /** Position, metadata and events; playback and volume go through this handle. */
  element: HTMLAudioElement
  play: (restart?: boolean) => Promise<boolean>
  pause: () => void
  setVolume: (volume: number) => void
  dispose: () => void
}
type SoundOptions = { volume?: number; loop?: boolean }
type Noise = { setVolume: (volume: number) => void; dispose: () => void }
type FilteredNoiseOptions = {
  duration?: number
  crossfade?: number
  volume?: number
  type?: BiquadFilterType
  frequency?: number
  q?: number
}

/** Every source feeds its local gain into one master gain, including synthesized sounds. */
export class AudioController {
  private context: AudioContext | null = null
  private master: GainNode | null = null
  private volume = 1
  private disposers = new Set<() => void>()
  private exclusive = new Map<string, Sound>()

  private getContext() {
    if (!this.context) {
      const Context =
        window.AudioContext ||
        (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!Context) throw new Error('Web Audio is unavailable')
      this.context = new Context()
      this.master = this.context.createGain()
      this.master.gain.value = this.volume
      this.master.connect(this.context.destination)
    }
    return this.context
  }

  async unlock() {
    try {
      const context = this.getContext()
      if (context.state === 'suspended') await context.resume()
      return context.state === 'running'
    } catch {
      return false
    }
  }

  setMasterVolume(value: number) {
    this.volume = clampVolume(value)
    if (this.master) this.setGain(this.master, this.volume)
  }

  private setGain(gain: GainNode, value: number) {
    const now = this.getContext().currentTime
    gain.gain.cancelScheduledValues(now)
    gain.gain.setValueAtTime(gain.gain.value, now)
    gain.gain.linearRampToValueAtTime(clampVolume(value), now + 0.025)
  }

  private createGain(volume: number) {
    const gain = this.getContext().createGain()
    gain.gain.value = clampVolume(volume)
    gain.connect(this.master!)
    return gain
  }

  createSound(source: string, { volume = 1, loop = false }: SoundOptions = {}): Sound {
    const context = this.getContext()
    const element = new Audio(source)
    element.preload = 'auto'
    element.loop = loop
    const gain = this.createGain(volume)
    const node = context.createMediaElementSource(element)
    node.connect(gain)
    let disposed = false
    const dispose = () => {
      if (disposed) return
      disposed = true
      element.pause()
      element.removeAttribute('src')
      element.load()
      node.disconnect()
      gain.disconnect()
      this.disposers.delete(dispose)
    }
    this.disposers.add(dispose)
    return {
      element,
      play: async (restart = false) => {
        if (disposed) return false
        // Both calls start within the user gesture.
        void this.unlock()
        try {
          if (restart) element.currentTime = 0
          await element.play()
          return !disposed
        } catch {
          return false
        }
      },
      pause: () => element.pause(),
      setVolume: (value) => {
        if (!disposed) this.setGain(gain, value)
      },
      dispose,
    }
  }

  playOneShot(source: string, options: SoundOptions & { key?: string } = {}) {
    const { key } = options
    if (key) this.stop(key)
    try {
      const sound = this.createSound(source, options)
      const release = () => {
        sound.element.removeEventListener('ended', release)
        sound.element.removeEventListener('error', release)
        sound.dispose()
        if (key && this.exclusive.get(key) === sound) this.exclusive.delete(key)
      }
      if (key) this.exclusive.set(key, sound)
      sound.element.addEventListener('ended', release)
      sound.element.addEventListener('error', release)
      void sound.play().then((played) => {
        if (!played) release()
      })
    } catch {
      // Missing browser audio support must not interrupt the game.
    }
  }

  stop(key: string) {
    this.exclusive.get(key)?.dispose()
    this.exclusive.delete(key)
  }

  createNoiseLoop(duration = 8, crossfade = 0.12): Noise {
    const context = this.getContext()
    const length = Math.floor(context.sampleRate * duration)
    const buffer = context.createBuffer(1, length, context.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1
    const fadeLength = Math.min(length, Math.floor(context.sampleRate * crossfade))
    for (let i = 0; i < fadeLength; i++) {
      const fade = i / fadeLength
      const tail = length - fadeLength + i
      data[tail] = data[tail] * (1 - fade) + data[i] * fade
    }
    const source = context.createBufferSource()
    const gain = this.createGain(0)
    source.buffer = buffer
    source.loop = true
    source.connect(gain)
    source.start()
    let disposed = false
    const dispose = () => {
      if (disposed) return
      disposed = true
      source.stop()
      source.disconnect()
      gain.disconnect()
      this.disposers.delete(dispose)
    }
    this.disposers.add(dispose)
    return {
      setVolume: (value) => {
        if (!disposed) this.setGain(gain, value)
      },
      dispose,
    }
  }

  /** A soft looping texture for environmental beds such as distant room murmur. */
  createFilteredNoiseLoop({
    duration = 9,
    crossfade = 0.15,
    volume = 0,
    type = 'bandpass',
    frequency = 520,
    q = 0.72,
  }: FilteredNoiseOptions = {}): Noise {
    const context = this.getContext()
    const length = Math.floor(context.sampleRate * duration)
    const buffer = context.createBuffer(1, length, context.sampleRate)
    const data = buffer.getChannelData(0)
    let brown = 0
    for (let i = 0; i < length; i++) {
      brown = (brown + 0.018 * (Math.random() * 2 - 1)) / 1.018
      data[i] = brown * 3.2
    }
    const fadeLength = Math.min(length, Math.floor(context.sampleRate * crossfade))
    for (let i = 0; i < fadeLength; i++) {
      const fade = i / fadeLength
      const tail = length - fadeLength + i
      data[tail] = data[tail] * (1 - fade) + data[i] * fade
    }

    const source = context.createBufferSource()
    const filter = context.createBiquadFilter()
    const gain = this.createGain(volume)
    source.buffer = buffer
    source.loop = true
    filter.type = type
    filter.frequency.value = frequency
    filter.Q.value = q
    source.connect(filter)
    filter.connect(gain)
    source.start()
    let disposed = false
    const dispose = () => {
      if (disposed) return
      disposed = true
      source.stop()
      source.disconnect()
      filter.disconnect()
      gain.disconnect()
      this.disposers.delete(dispose)
    }
    this.disposers.add(dispose)
    return {
      setVolume: (value) => {
        if (!disposed) this.setGain(gain, value)
      },
      dispose,
    }
  }

  playTone({
    frequency,
    endFrequency,
    duration = 0.21,
    volume = 0.13,
    type = 'square',
  }: {
    frequency: number
    endFrequency: number
    duration?: number
    volume?: number
    type?: OscillatorType
  }) {
    try {
      const context = this.getContext()
      void this.unlock()
      const now = context.currentTime
      const oscillator = context.createOscillator()
      const gain = this.createGain(0)
      oscillator.type = type
      oscillator.frequency.setValueAtTime(frequency, now)
      oscillator.frequency.exponentialRampToValueAtTime(endFrequency, now + duration * 0.57)
      gain.gain.setValueAtTime(0.0001, now)
      gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, clampVolume(volume)), now + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration - 0.01)
      oscillator.connect(gain)
      const dispose = () => {
        oscillator.onended = null
        oscillator.disconnect()
        gain.disconnect()
        this.disposers.delete(dispose)
      }
      this.disposers.add(dispose)
      oscillator.onended = dispose
      oscillator.start(now)
      oscillator.stop(now + duration)
    } catch {
      // Sound is optional on devices without Web Audio.
    }
  }

  /** A short license-free sequence: metal latch, falling prize and collection-bin thud. */
  playVendingDrop() {
    try {
      const context = this.getContext()
      void this.unlock()
      const now = context.currentTime
      const tones = [
        {
          delay: 0,
          duration: 0.065,
          frequency: 1180,
          endFrequency: 690,
          volume: 0.075,
          type: 'square',
        },
        {
          delay: 0.085,
          duration: 0.11,
          frequency: 430,
          endFrequency: 185,
          volume: 0.11,
          type: 'triangle',
        },
        {
          delay: 0.22,
          duration: 0.19,
          frequency: 105,
          endFrequency: 52,
          volume: 0.2,
          type: 'sine',
        },
      ] satisfies Array<{
        delay: number
        duration: number
        frequency: number
        endFrequency: number
        volume: number
        type: OscillatorType
      }>

      tones.forEach(({ delay, duration, frequency, endFrequency, volume, type }) => {
        const start = now + delay
        const oscillator = context.createOscillator()
        const gain = this.createGain(0)
        oscillator.type = type
        oscillator.frequency.setValueAtTime(frequency, start)
        oscillator.frequency.exponentialRampToValueAtTime(endFrequency, start + duration)
        gain.gain.setValueAtTime(0.0001, start)
        gain.gain.exponentialRampToValueAtTime(volume, start + Math.min(0.012, duration / 3))
        gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)
        oscillator.connect(gain)

        const dispose = () => {
          oscillator.onended = null
          oscillator.disconnect()
          gain.disconnect()
          this.disposers.delete(dispose)
        }
        this.disposers.add(dispose)
        oscillator.onended = dispose
        oscillator.start(start)
        oscillator.stop(start + duration)
      })
    } catch {
      // Reward delivery must still succeed on devices without Web Audio.
    }
  }

  dispose() {
    this.disposers.forEach((dispose) => dispose())
    this.exclusive.clear()
    this.master?.disconnect()
    if (this.context) void this.context.close().catch(() => undefined)
    this.context = null
    this.master = null
  }
}

export const audioController = new AudioController()
if (import.meta.hot) import.meta.hot.dispose(() => audioController.dispose())
