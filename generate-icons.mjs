// 生成 PWA 图标（无依赖，纯 Node.js）
import { writeFileSync, mkdirSync } from 'fs'
import { deflateSync } from 'zlib'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const iconsDir = join(__dirname, 'public', 'icons')
mkdirSync(iconsDir, { recursive: true })

function crc32(buf) {
  let c = 0xFFFFFFFF
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i]
    for (let j = 0; j < 8; j++) {
      c = (c >>> 1) ^ (c & 1 ? 0xEDB88320 : 0)
    }
  }
  return (c ^ 0xFFFFFFFF) >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const typeAndData = Buffer.concat([Buffer.from(type), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(typeAndData))
  return Buffer.concat([len, typeAndData, crc])
}

function createPNG(size, drawPixel) {
  // drawPixel(x, y) => [r, g, b, a]
  const raw = Buffer.alloc(size * (size * 4 + 1))
  let offset = 0
  for (let y = 0; y < size; y++) {
    raw[offset++] = 0 // filter none
    for (let x = 0; x < size; x++) {
      const [r, g, b, a] = drawPixel(x, y, size)
      raw[offset++] = r
      raw[offset++] = g
      raw[offset++] = b
      raw[offset++] = a
    }
  }

  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8  // bit depth
  ihdr[9] = 6  // color type RGBA
  ihdr[10] = 0 // compression
  ihdr[11] = 0 // filter
  ihdr[12] = 0 // interlace

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

function drawIcon(x, y, size) {
  const cx = size / 2, cy = size / 2
  const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2)
  const r = size * 0.42

  // 背景：深紫渐变
  const bgT = y / size
  let pr = Math.round(13 + bgT * 13)
  let pg = Math.round(10 + bgT * 8)
  let pb = Math.round(26 + bgT * 20)

  if (dist <= r) {
    // 圆盘：紫色渐变
    const t = dist / r
    const angle = Math.atan2(y - cy, x - cx)
    // 轮盘扇区效果
    const seg = Math.floor(((angle + Math.PI) / (Math.PI * 2)) * 8) % 8
    const colors = [
      [139, 92, 246], [244, 63, 94], [6, 182, 212], [249, 115, 22],
      [34, 197, 94], [236, 72, 153], [234, 179, 8], [99, 102, 241],
    ]
    const [cr, cg, cb] = colors[seg]
    const shade = 1 - t * 0.35
    pr = Math.round(cr * shade)
    pg = Math.round(cg * shade)
    pb = Math.round(cb * shade)

    // 中心圆
    if (dist <= r * 0.22) {
      pr = 26; pg = 10; pb = 46
    }
    // 外圈描边
    if (dist > r * 0.94) {
      pr = 196; pg = 181; pb = 253
    }
  }

  // 顶部指针
  if (Math.abs(x - cx) < size * 0.04 && y > cy - r - size * 0.08 && y < cy - r + size * 0.06) {
    pr = 244; pg = 63; pb = 94
  }

  return [pr, pg, pb, 255]
}

for (const size of [192, 512]) {
  const png = createPNG(size, drawIcon)
  writeFileSync(join(iconsDir, `icon-${size}.png`), png)
  console.log(`✅ icon-${size}.png (${png.length} bytes)`)
}

// favicon
const favicon = createPNG(32, drawIcon)
writeFileSync(join(__dirname, 'public', 'favicon.ico'), favicon)
console.log('✅ favicon.ico')
