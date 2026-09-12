import assert from 'node:assert/strict'
import { Buffer } from 'node:buffer'
import { URL } from 'node:url'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import ts from 'typescript'

const source = readFileSync(
  new URL('../src/features/flappy-bird/model/pixelCollision.ts', import.meta.url),
  'utf8',
)
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2023, module: ts.ModuleKind.ESNext },
})
const { alphaMasksOverlap } = await import(
  `data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`
)

const mask = (rows) => ({
  width: rows[0].length,
  height: rows.length,
  alpha: Uint8ClampedArray.from(rows.flat().map((pixel) => (pixel ? 255 : 0))),
})

test('ignores overlapping transparent pixels', () => {
  const leftPixel = mask([
    [1, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ])
  const rightPixel = mask([
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 1],
  ])

  assert.equal(
    alphaMasksOverlap(
      { mask: leftPixel, x: 0, y: 0, width: 3, height: 3 },
      { mask: rightPixel, x: 0, y: 0, width: 3, height: 3 },
    ),
    false,
  )
})

test('detects contact between significant pixels', () => {
  const centrePixel = mask([
    [0, 0, 0],
    [0, 1, 0],
    [0, 0, 0],
  ])

  assert.equal(
    alphaMasksOverlap(
      { mask: centrePixel, x: 0, y: 0, width: 3, height: 3 },
      { mask: centrePixel, x: 0, y: 0, width: 3, height: 3 },
    ),
    true,
  )
})

test('ignores soft alpha halos below the significant-pixel threshold', () => {
  const softPixel = {
    width: 1,
    height: 1,
    alpha: Uint8ClampedArray.of(159),
  }
  const solidPixel = {
    width: 1,
    height: 1,
    alpha: Uint8ClampedArray.of(255),
  }

  assert.equal(
    alphaMasksOverlap(
      { mask: softPixel, x: 0, y: 0, width: 1, height: 1 },
      { mask: solidPixel, x: 0, y: 0, width: 1, height: 1 },
    ),
    false,
  )
})

test('uses the rendered rotation rather than an unrotated rectangle', () => {
  const topPixel = mask([
    [0, 1, 0],
    [0, 0, 0],
    [0, 0, 0],
  ])
  const rightPixel = mask([
    [0, 0, 0],
    [0, 0, 1],
    [0, 0, 0],
  ])

  assert.equal(
    alphaMasksOverlap(
      { mask: topPixel, x: 0, y: 0, width: 3, height: 3, rotation: Math.PI / 2 },
      { mask: rightPixel, x: 0, y: 0, width: 3, height: 3 },
    ),
    true,
  )
})
