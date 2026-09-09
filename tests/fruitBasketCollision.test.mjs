import assert from 'node:assert/strict'
import { Buffer } from 'node:buffer'
import { URL } from 'node:url'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import ts from 'typescript'

const source = readFileSync(new URL('../src/features/fruit-basket/model/collision.ts', import.meta.url), 'utf8')
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2023, module: ts.ModuleKind.ESNext },
})
const { isCaught, isMissed } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`)

test('catches when the lower edge of an item reaches the basket rim', () => {
  assert.equal(isCaught({ x: 52.8, y: 65 }, { x: 52.8, y: 69 }, 50, 50), true)
  assert.equal(isCaught({ x: 52.8, y: 60 }, { x: 52.8, y: 64 }, 50, 50), false)
})

test('allows moving under an item below the rim, without counting it as missed', () => {
  assert.equal(isCaught({ x: 60, y: 83 }, { x: 60, y: 84 }, 48, 55), true)
  assert.equal(isMissed(84), false)
})

test('uses the basket on the right, not the empty space left of the character', () => {
  assert.equal(isCaught({ x: 43, y: 75 }, { x: 43, y: 76 }, 50, 50), false)
  assert.equal(isCaught({ x: 57, y: 75 }, { x: 57, y: 76 }, 50, 50), true)
})

test('fast items cannot jump through the catch region', () => {
  assert.equal(isCaught({ x: 52.8, y: 60 }, { x: 52.8, y: 96 }, 50, 50), true)
  assert.equal(isCaught({ x: 20, y: 60 }, { x: 20, y: 96 }, 50, 50), false)
})

test('a diagonal near miss is not caught merely because its bounds overlap', () => {
  assert.equal(isCaught({ x: 40, y: 86 }, { x: 52.8, y: 98 }, 50, 50), false)
})

test('items below the feet cannot be caught and eventually count as missed', () => {
  assert.equal(isCaught({ x: 52.8, y: 91 }, { x: 52.8, y: 95 }, 50, 50), false)
  assert.equal(isMissed(95), true)
})
