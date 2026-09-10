import assert from 'node:assert/strict'
import { Buffer } from 'node:buffer'
import { readFileSync } from 'node:fs'
import { URL } from 'node:url'
import { test } from 'node:test'
import ts from 'typescript'

function compile(path, replacements = {}) {
  let source = readFileSync(new URL(path, import.meta.url), 'utf8')
  for (const [from, to] of Object.entries(replacements)) source = source.replaceAll(from, to)
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2023, module: ts.ModuleKind.ESNext },
  })
  return `data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`
}
const configUrl = compile('../src/features/beach-library/model/config.ts')
const { BOOKS, GENRES, LETTERS, placeBook, completedCabinets } = await import(configUrl)

test('45 unique books, five per genre, fixed rectangular letter sheet', () => {
  assert.equal(BOOKS.length, 45)
  assert.equal(new Set(BOOKS.map((book) => book.id)).size, 45)
  GENRES.forEach((_, genre) => assert.equal(BOOKS.filter((book) => book.genre === genre).length, 5))
  assert.equal(LETTERS.length, 12)
  assert.ok(LETTERS.every((line) => line.length === 12))
})
test('wrong placements are accepted, can be moved, and do not complete a cabinet', () => {
  const original = Array(45).fill(null)
  const wrong = placeBook(original, 0, 5)
  assert.equal(wrong[5], 0)
  assert.deepEqual(completedCabinets(wrong), [])
  const corrected = placeBook(wrong, 0, 0)
  assert.equal(corrected[5], null)
  assert.equal(corrected[0], 0)
  assert.ok(original.every((entry) => entry === null))
})
test('a full wrong library can be solved by swapping, with no lost or duplicated books', () => {
  const full = Array.from({ length: 45 }, (_, id) => id)
  const wrong = placeBook(full, 0, 5)
  assert.equal(wrong[0], 5)
  assert.equal(wrong[5], 0)
  assert.equal(new Set(wrong).size, 45)
  assert.deepEqual(completedCabinets(wrong), [1, 2])
  assert.deepEqual(completedCabinets(placeBook(wrong, 0, 0)), [0, 1, 2])
})
test('floor book replaces an occupied slot and displaces its book to the floor', () => {
  const slots = Array(45).fill(null)
  slots[0] = 5
  const next = placeBook(slots, 0, 0)
  assert.equal(next[0], 0)
  assert.equal(next.includes(5), false)
})
test('awards 3 + 3 + 2 pages and a final note exactly once, in any cabinet order', async () => {
  const memory = new Map()
  globalThis.localStorage = {
    getItem: (key) => memory.get(key) ?? null,
    setItem: (key, value) => memory.set(key, value),
    removeItem: (key) => memory.delete(key),
  }
  globalThis.window = { localStorage: globalThis.localStorage }
  const inventoryUrl = compile('../src/features/inventory/model/store.ts', {
    "'zustand'": `'${import.meta.resolve('zustand')}'`,
    "'zustand/middleware'": `'${import.meta.resolve('zustand/middleware')}'`,
  })
  const storeUrl = compile('../src/features/beach-library/model/store.ts', {
    "'zustand'": `'${import.meta.resolve('zustand')}'`,
    "'zustand/middleware'": `'${import.meta.resolve('zustand/middleware')}'`,
    "'./config'": `'${configUrl}'`,
    "'@/features/inventory/model/store'": `'${inventoryUrl}'`,
  })
  const { useLibraryStore } = await import(storeUrl)
  const { useInventoryStore } = await import(inventoryUrl)
  const state = useLibraryStore.getState()
  state.enter()
  state.enter()
  const counts = []
  for (const cabinet of [2, 0, 1]) {
    for (let offset = 0; offset < 15; offset++) {
      const id = cabinet * 15 + offset
      const rewards = state.place(id, id)
      if (offset < 14) assert.equal(rewards.length, 0)
      else counts.push(rewards.length)
    }
  }
  assert.deepEqual(counts, [3, 3, 3])
  const items = useInventoryStore.getState().items
  assert.equal(items.length, 10)
  assert.equal(items.filter((item) => item.id.includes('-page-')).length, 8)
  assert.ok(items.every((item) => item.quantity === 1))
  state.place(0, 5)
  assert.deepEqual(state.place(0, 0), [])
  assert.equal(useInventoryStore.getState().items.length, 10)
  const saved = memory.get('beach-library-v1')
  useLibraryStore.setState({ slots: Array(45).fill(null), rewarded: [] })
  memory.set('beach-library-v1', saved)
  await useLibraryStore.persist.rehydrate()
  assert.deepEqual(completedCabinets(useLibraryStore.getState().slots), [0, 1, 2])
  assert.deepEqual(useLibraryStore.getState().rewarded, [2, 0, 1])
  delete globalThis.localStorage
  delete globalThis.window
})
