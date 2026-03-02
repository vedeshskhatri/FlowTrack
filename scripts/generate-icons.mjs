/**
 * Generates icon-192.png and icon-512.png for the PWA manifest.
 * Uses only Node.js built-ins (zlib) — no extra dependencies needed.
 * Run: node scripts/generate-icons.mjs
 */
import zlib from 'zlib'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** Write a big-endian 32-bit unsigned int into a buffer at offset */
function writeUInt32BE(buf, value, offset) {
  buf[offset]     = (value >>> 24) & 0xff
  buf[offset + 1] = (value >>> 16) & 0xff
  buf[offset + 2] = (value >>> 8)  & 0xff
  buf[offset + 3] =  value         & 0xff
}

/** CRC32 for PNG chunks */
const crcTable = (() => {
  const t = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1)
    t[n] = c
  }
  return t
})()

function crc32(buf) {
  let crc = 0xffffffff
  for (const byte of buf) crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const typeBytes = Buffer.from(type, 'ascii')
  const len = Buffer.alloc(4)
  writeUInt32BE(len, data.length, 0)
  const crcInput = Buffer.concat([typeBytes, data])
  const crcBuf = Buffer.alloc(4)
  writeUInt32BE(crcBuf, crc32(crcInput), 0)
  return Buffer.concat([len, typeBytes, data, crcBuf])
}

/**
 * Build a minimal PNG from an RGBA pixel array.
 * @param {number} size - width and height in pixels
 * @param {(x:number,y:number)=>[number,number,number,number]} getPixel
 */
function buildPNG(size, getPixel) {
  // Collect raw scanlines: each row begins with filter byte 0x00
  const rawRows = []
  for (let y = 0; y < size; y++) {
    const row = Buffer.alloc(1 + size * 4)
    row[0] = 0 // filter type: None
    for (let x = 0; x < size; x++) {
      const [r, g, b, a] = getPixel(x, y)
      const i = 1 + x * 4
      row[i] = r; row[i+1] = g; row[i+2] = b; row[i+3] = a
    }
    rawRows.push(row)
  }
  const raw = Buffer.concat(rawRows)
  const compressed = zlib.deflateSync(raw)

  const ihdr = Buffer.alloc(13)
  writeUInt32BE(ihdr, size, 0)   // width
  writeUInt32BE(ihdr, size, 4)   // height
  ihdr[8]  = 8  // bit depth
  ihdr[9]  = 6  // colour type: RGBA
  ihdr[10] = 0  // compression
  ihdr[11] = 0  // filter
  ihdr[12] = 0  // interlace: none

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), // PNG sig
    chunk('IHDR', ihdr),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

/** Parse a hex color string to [r, g, b] */
function hex(h) {
  const v = parseInt(h.slice(1), 16)
  return [(v >> 16) & 0xff, (v >> 8) & 0xff, v & 0xff]
}

const BG    = hex('#0A0A0A')  // dark background
const CYAN  = hex('#22D3EE')  // accent
const VIOLT = hex('#A78BFA')  // violet accent

/**
 * Draw a barbell icon in a rounded-square canvas.
 * Returns pixel value at (x, y).
 */
function barbellPixel(size) {
  const s = size
  // Proportional regions (relative to 512 reference)
  const sc = s / 512

  // Rounded-square background: corner radius = s/6
  const r = s / 6

  // Barbell geometry (scaled from reference 512 design)
  const barY1 = Math.round(242 * sc), barY2 = Math.round(270 * sc)     // shaft
  const plateOY1 = Math.round(196 * sc), plateOY2 = Math.round(316 * sc) // outer plate
  const plateIY1 = Math.round(216 * sc), plateIY2 = Math.round(296 * sc) // inner plate
  // Left side
  const lPlateX1 = Math.round(40 * sc),  lPlateX2 = Math.round(76 * sc)
  const lIPlateX1 = Math.round(84 * sc), lIPlateX2 = Math.round(104 * sc)
  // Right side
  const rIPlateX1 = Math.round(408 * sc), rIPlateX2 = Math.round(428 * sc)
  const rPlateX1  = Math.round(436 * sc), rPlateX2  = Math.round(472 * sc)
  // Shaft
  const shaftX1 = Math.round(104 * sc), shaftX2 = Math.round(408 * sc)

  return function(x, y) {
    // Rounded square mask
    const dx = Math.max(r - x, 0, x - (s - 1 - r))
    const dy = Math.max(r - y, 0, y - (s - 1 - r))
    if (dx * dx + dy * dy > r * r) return [...BG, 0] // transparent outside

    // Barbell shaft
    if (x >= shaftX1 && x < shaftX2 && y >= barY1 && y < barY2)
      return [...CYAN, 255]

    // Left outer plate (cyan)
    if (x >= lPlateX1 && x < lPlateX2 && y >= plateOY1 && y < plateOY2)
      return [...CYAN, 255]

    // Left inner collar (violet)
    if (x >= lIPlateX1 && x < lIPlateX2 && y >= plateIY1 && y < plateIY2)
      return [...VIOLT, 255]

    // Right inner collar (violet)
    if (x >= rIPlateX1 && x < rIPlateX2 && y >= plateIY1 && y < plateIY2)
      return [...VIOLT, 255]

    // Right outer plate (cyan)
    if (x >= rPlateX1 && x < rPlateX2 && y >= plateOY1 && y < plateOY2)
      return [...CYAN, 255]

    return [...BG, 255] // dark background
  }
}

const outDir = path.resolve(__dirname, '..', 'public', 'icons')
fs.mkdirSync(outDir, { recursive: true })

for (const size of [192, 512]) {
  const getPixel = barbellPixel(size)
  const png = buildPNG(size, getPixel)
  const outPath = path.join(outDir, `icon-${size}.png`)
  fs.writeFileSync(outPath, png)
  console.log(`✓ Written ${outPath} (${png.length} bytes)`)
}
