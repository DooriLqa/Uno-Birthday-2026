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
const { BOOKS, GENRES, DIRECTIONS, placeBook, completedCabinets, isBookCorrect } = await import(
  configUrl
)

test('45 unique books, five per genre Г— direction', () => {
  assert.equal(BOOKS.length, 45)
  assert.equal(new Set(BOOKS.map((book) => book.id)).size, 45)
  assert.equal(new Set(BOOKS.map((book) => book.title)).size, 45)
  assert.equal(GENRES.length, 3)
  assert.equal(DIRECTIONS.length, 3)
  GENRES.forEach((_, genre) =>
    DIRECTIONS.forEach((_, direction) =>
      assert.equal(
        BOOKS.filter((book) => book.genre === genre && book.direction === direction).length,
        5,
      ),
    ),
  )
})

test('a book must match both its genre column and its direction row', () => {
  for (const book of BOOKS) {
    for (let slot = 0; slot < 45; slot++) {
      assert.equal(isBookCorrect(book.id, slot), Math.floor(book.id / 5) === Math.floor(slot / 5))
    }
  }
  assert.equal(isBookCorrect(0, 5), false) // Same genre, wrong direction.
  assert.equal(isBookCorrect(0, 15), false) // Same direction, wrong genre.
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
test('awards four random pages before completion and two final sheets exactly once', async () => {
  const memory = new Map()
  globalThis.localStorage = {
    getItem: (key) => memory.get(key) ?? null,
    setItem: (key, value) => memory.set(key, value),
    removeItem: (key) => memory.delete(key),
  }
  globalThis.window = { localStorage: globalThis.localStorage }
  const inventoryUrl = compile('../src/features/inventory/model/store.ts', {
    "import { BOOK_ITEMS } from './items'": 'const BOOK_ITEMS = []',
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
  assert.equal(state.librarianIntroduced, false)
  state.introduceLibrarian()
  state.enter()
  state.enter()
  assert.equal(useInventoryStore.getState().items.length, 0)
  const counts = []
  for (const cabinet of [2, 0, 1]) {
    for (let offset = 0; offset < 15; offset++) {
      const id = cabinet * 15 + offset
      const rewards = state.place(id, id)
      counts.push(...rewards)
      if (counts.length < 5) assert.ok(!counts.includes('beach-library-letters'))
      if (cabinet === 1 && offset === 13) assert.equal(counts.length, 4)
    }
  }
  assert.equal(counts.length, 6)
  const items = useInventoryStore.getState().items
  assert.equal(items.length, 6)
  assert.equal(items.filter((item) => item.id.includes('-page-')).length, 4)
  assert.ok(items.every((item) => item.quantity === 1))
  state.place(0, 5)
  assert.deepEqual(state.place(0, 0), [])
  assert.equal(useInventoryStore.getState().items.length, 6)
  const saved = memory.get('beach-library-v1')
  useLibraryStore.setState({ slots: Array(45).fill(null), rewarded: [] })
  memory.set('beach-library-v1', saved)
  await useLibraryStore.persist.rehydrate()
  assert.equal(useLibraryStore.getState().librarianIntroduced, true)
  assert.deepEqual(completedCabinets(useLibraryStore.getState().slots), [0, 1, 2])
  assert.deepEqual([...useLibraryStore.getState().rewarded].sort(), [0, 1, 2, 3])
  delete globalThis.localStorage
  delete globalThis.window
})

test('scattered books stay left of the librarian even when rotated and hovered', () => {
  for (const book of BOOKS) {
    const angle = Math.abs(book.angle) * Math.PI / 180
    const width = 12
    const heightInWidthPercent = 13.5 * 941 / 1672
    const halfRotatedWidth = (width * Math.cos(angle) + heightInWidthPercent * Math.sin(angle)) / 2
    assert.ok(book.x + width / 2 + halfRotatedWidth * 1.1 < 81)
    assert.ok(book.y + 13.5 < 93)
  }
})

test('librarian repeats from the start after dismissal and completion; other dialogues resume', async () => {
  globalThis.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} }
  globalThis.window = { localStorage: globalThis.localStorage }
  const storeUrl = compile('../src/features/dialogues/model/store.ts', {
    "'zustand'": `'${import.meta.resolve('zustand')}'`,
    "'zustand/middleware'": `'${import.meta.resolve('zustand/middleware')}'`,
  })
  const { useDialogueStore } = await import(storeUrl)
  const dialogueUrl = compile('../src/features/beach-library/model/librarianDialogue.ts', {
    "import librarianSprite from '@/shared/assets/features/dialogues/poodle-librarian.png'":
      "const librarianSprite = 'poodle-librarian.png'",
    "'@/features/dialogues'": `'${storeUrl}'`,
  })
  const { librarianCompletionDialogue, librarianDialogue, finishLibrarianCleanup, talkToLibrarian } =
    await import(dialogueUrl)
  const store = useDialogueStore.getState()
  talkToLibrarian()
  store.nextMessage()
  store.closeDialogue()
  talkToLibrarian()
  assert.equal(useDialogueStore.getState().activeMessageIndex, 0)
  store.closeDialogue()
  store.openDialogueById(librarianDialogue.id)
  assert.equal(useDialogueStore.getState().activeMessageIndex, 0)
  librarianDialogue.messages.forEach(() => store.nextMessage())
  assert.equal(useDialogueStore.getState().activeDialogueId, null)
  talkToLibrarian()
  assert.equal(useDialogueStore.getState().activeMessageIndex, 0)
  const ordinary = { ...librarianDialogue, id: 'ordinary', restartOnOpen: false }
  store.openDialogue(ordinary)
  store.nextMessage()
  store.closeDialogue()
  store.openDialogue(ordinary)
  assert.equal(useDialogueStore.getState().activeMessageIndex, 1)
  finishLibrarianCleanup()
  assert.equal(useDialogueStore.getState().activeDialogueId, librarianCompletionDialogue.id)
  assert.equal(
    librarianCompletionDialogue.messages[0].text,
    'Спасибо за помощь с уборкой! Вот письмо, о котором я говорила.',
  )
  delete globalThis.localStorage
  delete globalThis.window
})
