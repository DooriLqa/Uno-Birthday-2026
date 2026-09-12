import { readFileSync } from 'node:fs'
import { Buffer } from 'node:buffer'
import { URL } from 'node:url'
import assert from 'node:assert/strict'
import { afterEach, beforeEach, test } from 'node:test'
import ts from 'typescript'

// Run the actual TypeScript controller without introducing a test framework dependency.
const source = readFileSync(
  new URL('../src/shared/lib/audio/audioController.ts', import.meta.url),
  'utf8',
)
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2023, module: ts.ModuleKind.ESNext },
})
const { AudioController } = await import(
  `data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`
)

class Param {
  value = 1
  cancelScheduledValues() {}
  setValueAtTime(value) {
    this.value = value
  }
  linearRampToValueAtTime(value) {
    this.value = value
  }
  exponentialRampToValueAtTime(value) {
    this.value = value
  }
}
class AudioNode {
  connections = []
  gain = new Param()
  frequency = new Param()
  connect(node) {
    this.connections.push(node)
    return node
  }
  disconnect() {
    this.connections = []
  }
  start() {}
  stop() {
    this.stopped = true
  }
}
class Context {
  static instances = []
  state = 'suspended'
  currentTime = 10
  sampleRate = 100
  destination = new AudioNode()
  gains = []
  media = []
  buffers = []
  oscillators = []
  constructor() {
    Context.instances.push(this)
  }
  createGain() {
    const node = new AudioNode()
    this.gains.push(node)
    return node
  }
  createMediaElementSource(element) {
    const node = new AudioNode()
    node.element = element
    this.media.push(node)
    return node
  }
  createBufferSource() {
    const node = new AudioNode()
    this.buffers.push(node)
    return node
  }
  createOscillator() {
    const node = new AudioNode()
    this.oscillators.push(node)
    return node
  }
  createBuffer(_channels, length) {
    return { getChannelData: () => new Float32Array(length) }
  }
  async resume() {
    this.state = 'running'
  }
  async close() {
    this.state = 'closed'
  }
}
class Media extends globalThis.EventTarget {
  static instances = []
  static rejectPlay = false
  paused = true
  currentTime = 0
  playCount = 0
  constructor(src) {
    super()
    this.src = src
    Media.instances.push(this)
  }
  async play() {
    this.playCount++
    if (Media.rejectPlay) throw new Error('Playback blocked')
    this.paused = false
  }
  pause() {
    this.paused = true
  }
  removeAttribute(name) {
    if (name === 'src') this.src = ''
  }
  load() {}
}

const originalWindow = globalThis.window
const originalAudio = globalThis.Audio
let controller
beforeEach(() => {
  Context.instances = []
  Media.instances = []
  Media.rejectPlay = false
  globalThis.window = { AudioContext: Context }
  globalThis.Audio = Media
  controller = new AudioController()
})
afterEach(() => {
  controller.dispose()
  globalThis.window = originalWindow
  globalThis.Audio = originalAudio
})
const flush = () => new Promise((resolve) => globalThis.queueMicrotask(resolve))

test('master volume applies before the first sound and changes playing audio without restarting', async () => {
  controller.setMasterVolume(0.5)
  assert.equal(Context.instances.length, 0)
  const sound = controller.createSound('track.mp3', { volume: 0.4 })
  await sound.play()
  sound.element.currentTime = 17
  const context = Context.instances[0]
  const [master, local] = context.gains
  assert.equal(master.gain.value * local.gain.value, 0.2)
  assert.deepEqual(context.media[0].connections, [local])
  assert.deepEqual(local.connections, [master])
  assert.deepEqual(master.connections, [context.destination])
  controller.setMasterVolume(0)
  assert.equal(master.gain.value * local.gain.value, 0)
  sound.setVolume(0.8)
  assert.equal(master.gain.value * local.gain.value, 0)
  controller.setMasterVolume(0.25)
  assert.equal(master.gain.value * local.gain.value, 0.2)
  assert.equal(sound.element.currentTime, 17)
  assert.equal(sound.element.playCount, 1)
})

test('radio signal, noise and synthesized effects share the same master and context', () => {
  controller.setMasterVolume(0.5)
  controller.createSound('radio.mp3', { volume: 0.7 * 0.75 })
  const noise = controller.createNoiseLoop()
  noise.setVolume(0.7 * 0.25)
  controller.playTone({ frequency: 900, endFrequency: 470 })
  assert.equal(Context.instances.length, 1)
  const context = Context.instances[0]
  const master = context.gains[0]
  for (const gain of context.gains.slice(1)) assert.deepEqual(gain.connections, [master])
  assert.equal(master.gain.value * context.gains[1].gain.value, 0.5 * 0.7 * 0.75)
  assert.equal(master.gain.value * context.gains[2].gain.value, 0.5 * 0.7 * 0.25)
  controller.setMasterVolume(0)
  for (const gain of context.gains.slice(1)) assert.equal(master.gain.value * gain.gain.value, 0)
})

test('vending reward sound is synthesized through the shared master output', () => {
  controller.setMasterVolume(0.5)
  controller.playVendingDrop()
  const context = Context.instances[0]
  const master = context.gains[0]

  assert.equal(context.oscillators.length, 3)
  assert.ok(context.gains.slice(1).every((gain) => gain.connections.includes(master)))
  assert.ok(context.oscillators.every((oscillator) => oscillator.stopped))
})

test('replacing an exclusive one-shot stops its predecessor without stopping other effects', async () => {
  controller.playOneShot('first.wav', { key: 'dialogue' })
  controller.playOneShot('shot.wav', { key: 'shot' })
  controller.playOneShot('next.wav', { key: 'dialogue' })
  await flush()
  const [first, shot, next] = Media.instances
  assert.equal(first.paused, true)
  assert.equal(first.src, '')
  assert.equal(shot.paused, false)
  assert.equal(next.paused, false)
  controller.stop('dialogue')
  assert.equal(next.paused, true)
  assert.equal(shot.paused, false)
})

test('ended and failed one-shots release media and audio graph nodes', async () => {
  controller.playOneShot('ok.wav')
  await flush()
  Media.instances[0].dispatchEvent(new globalThis.Event('ended'))
  assert.equal(Media.instances[0].src, '')
  assert.deepEqual(Context.instances[0].media[0].connections, [])
  Media.rejectPlay = true
  controller.playOneShot('blocked.wav', { key: 'dialogue' })
  await flush()
  assert.equal(Media.instances[1].src, '')
  assert.deepEqual(Context.instances[0].media[1].connections, [])
})

test('pause preserves position; explicit restart resets it; disposed sounds cannot replay', async () => {
  const sound = controller.createSound('track.wav')
  await sound.play()
  sound.element.currentTime = 12
  sound.pause()
  await sound.play()
  assert.equal(sound.element.currentTime, 12)
  await sound.play(true)
  assert.equal(sound.element.currentTime, 0)
  sound.dispose()
  sound.dispose()
  assert.equal(await sound.play(), false)
})

test('invalid volume is clamped and disposal closes shared audio resources', () => {
  controller.setMasterVolume(Number.NaN)
  const sound = controller.createSound('track.wav', { volume: 2 })
  const context = Context.instances[0]
  assert.equal(context.gains[0].gain.value, 0)
  assert.equal(context.gains[1].gain.value, 1)
  controller.setMasterVolume(5)
  sound.setVolume(-1)
  assert.equal(context.gains[0].gain.value, 1)
  assert.equal(context.gains[1].gain.value, 0)
  controller.createNoiseLoop()
  controller.dispose()
  assert.equal(context.state, 'closed')
  assert.equal(context.buffers[0].stopped, true)
  assert.ok(context.gains.every((gain) => gain.connections.length === 0))
})
