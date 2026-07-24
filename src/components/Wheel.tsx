import { useRef, useState, useCallback, useEffect } from 'react'
import { WheelItem } from '../types'

interface WheelProps {
  items: WheelItem[]
  title: string
  onResult: (itemId: string) => void
  disabled?: boolean
}

const WHEEL_COLORS = [
  '#8b5cf6', '#ef4444', '#06b6d4', '#f97316', '#22c55e',
  '#ec4899', '#eab308', '#6366f1', '#14b8a6', '#f43f5e',
]

/** 根据权重计算每个扇区的起始角与角度（权重越大扇区越大） */
function computeSegs(items: WheelItem[]): { start: number; angle: number }[] {
  const total = items.reduce((s, it) => s + (it.weight || 1), 0) || 1
  let acc = 0
  return items.map(it => {
    const angle = ((it.weight || 1) / total) * Math.PI * 2
    const seg = { start: acc, angle }
    acc += angle
    return seg
  })
}

/** 按权重随机抽取一个扇区索引 */
function pickWeighted(items: WheelItem[]): number {
  const total = items.reduce((s, it) => s + (it.weight || 1), 0) || 1
  let r = Math.random() * total
  for (let i = 0; i < items.length; i++) {
    r -= (items[i].weight || 1)
    if (r <= 0) return i
  }
  return items.length - 1
}

export default function Wheel({ items, title, onResult, disabled }: WheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [spinning, setSpinning] = useState(false)
  const rotationRef = useRef(0)
  const animFrameRef = useRef(0)
  const sizeRef = useRef(320)

  const drawWheel = useCallback((rotation: number) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const size = sizeRef.current
    const dpr = window.devicePixelRatio || 1
    canvas.width = size * dpr
    canvas.height = size * dpr
    ctx.scale(dpr, dpr)

    const cx = size / 2
    const cy = size / 2
    const radius = size / 2 - 12
    const segs = computeSegs(items)

    ctx.clearRect(0, 0, size, size)

    // 外圈光晕
    const glow = ctx.createRadialGradient(cx, cy, radius - 5, cx, cy, radius + 10)
    glow.addColorStop(0, 'rgba(139, 92, 246, 0.3)')
    glow.addColorStop(1, 'rgba(139, 92, 246, 0)')
    ctx.fillStyle = glow
    ctx.beginPath()
    ctx.arc(cx, cy, radius + 10, 0, Math.PI * 2)
    ctx.fill()

    // 绘制扇区
    items.forEach((item, i) => {
      const seg = segs[i]
      const startAngle = rotation + seg.start
      const endAngle = startAngle + seg.angle

      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.arc(cx, cy, radius, startAngle, endAngle)
      ctx.closePath()

      const color = item.color || WHEEL_COLORS[i % WHEEL_COLORS.length]
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius)
      grad.addColorStop(0, shadeColor(color, -30))
      grad.addColorStop(0.7, color)
      grad.addColorStop(1, shadeColor(color, -15))
      ctx.fillStyle = grad
      ctx.fill()

      ctx.strokeStyle = 'rgba(255,255,255,0.15)'
      ctx.lineWidth = 1.5
      ctx.stroke()

      // ---- 文字与图标 ----
      const centerR = 32                 // 中心圆半径
      const iconR = centerR + 18         // 图标固定在中心圆外圈，不会被挤到中心
      const textInner = iconR + 16       // 文字内边界（图标外侧留间隙）
      const textOuter = radius - 14      // 文字外边界
      const maxTextW = textOuter - textInner
      const fontFace = '"PingFang SC", "Microsoft YaHei", sans-serif'

      // 图标（固定径向位置，textAlign center）
      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(startAngle + seg.angle / 2)
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      const iconSize = items.length > 8 ? 15 : 19
      ctx.font = `${iconSize}px sans-serif`
      ctx.fillText(item.icon, iconR, 1)
      ctx.restore()

      // 文字（自适应缩放，超长换行，保证完整显示）
      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(startAngle + seg.angle / 2)
      ctx.textAlign = 'right'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = '#fff'
      ctx.shadowColor = 'rgba(0,0,0,0.55)'
      ctx.shadowBlur = 3

      const label = item.label
      let fs = items.length > 8 ? 11 : items.length > 5 ? 13 : 15
      const minFs = 8
      ctx.font = `bold ${fs}px ${fontFace}`
      let w = ctx.measureText(label).width
      while (w > maxTextW && fs > minFs) {
        fs -= 0.5
        ctx.font = `bold ${fs}px ${fontFace}`
        w = ctx.measureText(label).width
      }

      if (w <= maxTextW) {
        ctx.fillText(label, textOuter, 1)
      } else {
        // 仍然放不下 → 拆成两行完整展示
        const mid = Math.ceil(label.length / 2)
        const line1 = label.slice(0, mid)
        const line2 = label.slice(mid)
        ctx.fillText(line1, textOuter, -fs * 0.6)
        ctx.fillText(line2, textOuter, fs * 0.6)
      }
      ctx.restore()
    })

    // 中心圆
    const centerGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 34)
    centerGrad.addColorStop(0, '#2d1b4e')
    centerGrad.addColorStop(1, '#1a0a2e')
    ctx.beginPath()
    ctx.arc(cx, cy, 32, 0, Math.PI * 2)
    ctx.fillStyle = centerGrad
    ctx.fill()
    ctx.strokeStyle = '#8b5cf6'
    ctx.lineWidth = 3
    ctx.stroke()

    // 中心文字
    ctx.fillStyle = '#e2d9f3'
    ctx.font = 'bold 13px "PingFang SC", "Microsoft YaHei", sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('转', cx, cy + 5)

    // 指针（顶部，尖端朝下指向转盘）
    ctx.beginPath()
    ctx.moveTo(cx, 24)
    ctx.lineTo(cx - 12, 2)
    ctx.lineTo(cx + 12, 2)
    ctx.closePath()
    ctx.fillStyle = '#f43f5e'
    ctx.shadowColor = '#f43f5e'
    ctx.shadowBlur = 8
    ctx.fill()
    ctx.shadowBlur = 0
  }, [items])

  useEffect(() => {
    const updateSize = () => {
      sizeRef.current = Math.min(window.innerWidth - 40, 360)
      drawWheel(rotationRef.current)
    }
    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [drawWheel])

  const spin = useCallback(() => {
    if (spinning || disabled || items.length === 0) return
    setSpinning(true)

    // 先按权重抽取结果，再计算目标角度
    const segs = computeSegs(items)
    const targetIndex = pickWeighted(items)

    // 目标：让 targetIndex 扇区的中心对准指针（顶部 -π/2 方向）
    const targetSegCenter = segs[targetIndex].start + segs[targetIndex].angle / 2
    const desiredRotation = -Math.PI / 2 - targetSegCenter

    // 在当前旋转基础上加 5~8 整圈 + 对齐到目标角度
    const currentNormalized = ((rotationRef.current % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)
    const desiredNormalized = ((desiredRotation % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)
    let delta = desiredNormalized - currentNormalized
    if (delta < 0) delta += Math.PI * 2
    const extraSpins = Math.PI * 2 * (5 + Math.floor(Math.random() * 4)) // 5~8 整圈
    const totalRotation = extraSpins + delta

    const duration = 3500 + Math.random() * 1000
    const startTime = performance.now()
    const startRotation = rotationRef.current

    const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4)

    const animate = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = easeOutQuart(progress)

      rotationRef.current = startRotation + totalRotation * eased
      drawWheel(rotationRef.current)

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate)
      } else {
        // 精确设定最终角度，消除浮点累积误差
        rotationRef.current = startRotation + totalRotation
        drawWheel(rotationRef.current)
        setSpinning(false)
        setTimeout(() => onResult(items[targetIndex].id), 400)
      }
    }

    animFrameRef.current = requestAnimationFrame(animate)
  }, [spinning, disabled, items, drawWheel, onResult])

  useEffect(() => {
    return () => cancelAnimationFrame(animFrameRef.current)
  }, [])

  return (
    <div className="wheel-container">
      <h2 className="wheel-title">{title}</h2>
      <div className="wheel-wrapper" onClick={spin}>
        <canvas
          ref={canvasRef}
          style={{ width: sizeRef.current, height: sizeRef.current }}
          className={`wheel-canvas ${spinning ? 'spinning' : ''}`}
        />
        {!spinning && !disabled && (
          <div className="spin-hint">点击转盘</div>
        )}
      </div>
      <button
        className="btn btn-primary spin-btn"
        onClick={spin}
        disabled={spinning || disabled}
      >
        {spinning ? '命运转动中…' : '🎲 转动轮盘'}
      </button>
    </div>
  )
}

function shadeColor(color: string, percent: number): string {
  const num = parseInt(color.replace('#', ''), 16)
  const amt = Math.round(2.55 * percent)
  const R = Math.max(0, Math.min(255, (num >> 16) + amt))
  const G = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amt))
  const B = Math.max(0, Math.min(255, (num & 0x0000FF) + amt))
  return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`
}
