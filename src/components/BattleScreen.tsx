import { useRef, useState, useCallback, useEffect } from 'react'
import { GameEvent, GameState, BattleOutcome } from '../types'
import {
  BATTLE_SEGMENTS, battleWeights, computePlayerPower,
  determineBattleOutcome, BATTLE_OUTCOME_LABELS,
} from '../game/engine'

interface BattleScreenProps {
  event: GameEvent
  game: GameState
  onResolve: (outcome: BattleOutcome) => void
}

const WHEEL_SIZE = 132

const OUTCOME_COLORS: Record<BattleOutcome, string> = {
  crush_win: '#22c55e',
  narrow_win: '#84cc16',
  draw: '#eab308',
  narrow_loss: '#f97316',
  crush_loss: '#ef4444',
}

type Phase = 'ready' | 'spinning' | 'roundResult' | 'finished'

function pickIndex(weights: number[]): number {
  const total = weights.reduce((a, b) => a + b, 0)
  let r = Math.random() * total
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i]
    if (r <= 0) return i
  }
  return weights.length - 1
}

function drawBattleWheel(
  canvas: HTMLCanvasElement | null,
  rotation: number,
  highlightIdx: number | null
) {
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const dpr = window.devicePixelRatio || 1
  canvas.width = WHEEL_SIZE * dpr
  canvas.height = WHEEL_SIZE * dpr
  ctx.scale(dpr, dpr)

  const cx = WHEEL_SIZE / 2
  const cy = WHEEL_SIZE / 2
  const radius = WHEEL_SIZE / 2 - 8
  const n = BATTLE_SEGMENTS.length
  const segAngle = (Math.PI * 2) / n

  ctx.clearRect(0, 0, WHEEL_SIZE, WHEEL_SIZE)

  BATTLE_SEGMENTS.forEach((seg, i) => {
    const start = rotation + i * segAngle
    const end = start + segAngle
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.arc(cx, cy, radius, start, end)
    ctx.closePath()
    ctx.globalAlpha = highlightIdx === null || highlightIdx === i ? 1 : 0.3
    ctx.fillStyle = seg.color
    ctx.fill()
    ctx.globalAlpha = 1
    ctx.strokeStyle = highlightIdx === i ? '#fff' : 'rgba(255,255,255,0.18)'
    ctx.lineWidth = highlightIdx === i ? 2 : 1
    ctx.stroke()

    // 片段数值标签
    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate(start + segAngle / 2)
    ctx.textAlign = 'right'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = '#fff'
    ctx.shadowColor = 'rgba(0,0,0,0.6)'
    ctx.shadowBlur = 2
    ctx.font = 'bold 10px "PingFang SC", "Microsoft YaHei", sans-serif'
    ctx.fillText(seg.label, radius - 4, 0)
    ctx.restore()
  })

  // 中心圆
  ctx.beginPath()
  ctx.arc(cx, cy, 16, 0, Math.PI * 2)
  ctx.fillStyle = '#1a0a2e'
  ctx.fill()
  ctx.strokeStyle = '#8b5cf6'
  ctx.lineWidth = 2
  ctx.stroke()

  // 指针（顶部朝下）
  ctx.beginPath()
  ctx.moveTo(cx, 14)
  ctx.lineTo(cx - 7, 1)
  ctx.lineTo(cx + 7, 1)
  ctx.closePath()
  ctx.fillStyle = '#f43f5e'
  ctx.shadowColor = '#f43f5e'
  ctx.shadowBlur = 6
  ctx.fill()
  ctx.shadowBlur = 0
}

export default function BattleScreen({ event, game, onResolve }: BattleScreenProps) {
  const battle = event.battle!
  const totalRounds = battle.rounds || 1
  const neededWins = Math.ceil(totalRounds / 2)

  const playerCanvasRef = useRef<HTMLCanvasElement>(null)
  const enemyCanvasRef = useRef<HTMLCanvasElement>(null)
  const [phase, setPhase] = useState<Phase>('ready')
  const [round, setRound] = useState(1)
  const [playerWins, setPlayerWins] = useState(0)
  const [enemyWins, setEnemyWins] = useState(0)
  const [lastRoll, setLastRoll] = useState<{ p: number; e: number; result: 'win' | 'lose' | 'tie' } | null>(null)
  const [finalOutcome, setFinalOutcome] = useState<BattleOutcome | null>(null)

  const playerPower = computePlayerPower(game)
  const enemyPower = battle.difficulty

  useEffect(() => {
    drawBattleWheel(playerCanvasRef.current, 0, null)
    drawBattleWheel(enemyCanvasRef.current, 0, null)
  }, [])

  const spinRound = useCallback(() => {
    if (phase === 'spinning') return
    setPhase('spinning')
    setLastRoll(null)

    const pIdx = pickIndex(battleWeights(playerPower))
    const eIdx = pickIndex(battleWeights(enemyPower))
    const n = BATTLE_SEGMENTS.length
    const segAngle = (Math.PI * 2) / n
    const target = (idx: number) => -Math.PI / 2 - (idx * segAngle + segAngle / 2)

    const pEnd = Math.PI * 2 * (6 + Math.floor(Math.random() * 3)) + target(pIdx)
    const eEnd = Math.PI * 2 * (6 + Math.floor(Math.random() * 3)) + target(eIdx)
    const duration = 3000
    const startTime = performance.now()
    const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4)

    const animate = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1)
      const eased = easeOutQuart(progress)
      drawBattleWheel(playerCanvasRef.current, pEnd * eased, null)
      drawBattleWheel(enemyCanvasRef.current, eEnd * eased, null)
      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        drawBattleWheel(playerCanvasRef.current, pEnd, pIdx)
        drawBattleWheel(enemyCanvasRef.current, eEnd, eIdx)

        const pVal = BATTLE_SEGMENTS[pIdx].value
        const eVal = BATTLE_SEGMENTS[eIdx].value
        const result: 'win' | 'lose' | 'tie' = pVal > eVal ? 'win' : pVal < eVal ? 'lose' : 'tie'
        const newPW = playerWins + (result === 'win' ? 1 : 0)
        const newEW = enemyWins + (result === 'lose' ? 1 : 0)
        setPlayerWins(newPW)
        setEnemyWins(newEW)
        setLastRoll({ p: pIdx, e: eIdx, result })

        if (totalRounds === 1) {
          setFinalOutcome(determineBattleOutcome(pVal, eVal))
          setPhase('finished')
        } else if (newPW >= neededWins || newEW >= neededWins || round >= totalRounds) {
          let outcome: BattleOutcome
          if (newPW > newEW) outcome = newPW - newEW >= 2 ? 'crush_win' : 'narrow_win'
          else if (newPW === newEW) outcome = 'draw'
          else outcome = newEW - newPW >= 2 ? 'crush_loss' : 'narrow_loss'
          setFinalOutcome(outcome)
          setPhase('finished')
        } else {
          setPhase('roundResult')
        }
      }
    }
    requestAnimationFrame(animate)
  }, [phase, playerPower, enemyPower, playerWins, enemyWins, round, totalRounds, neededWins])

  const nextRound = () => {
    setRound(r => r + 1)
    setPhase('ready')
  }

  const roundResultText = lastRoll
    ? lastRoll.result === 'win' ? '本回合：你胜！' : lastRoll.result === 'lose' ? '本回合：敌方胜' : '本回合：平局'
    : ''

  return (
    <div className="battle-screen animate-in">
      <div className="battle-header">
        <span className="battle-badge">⚔️ 对决{totalRounds > 1 ? ` · 第${round}/${totalRounds}回合` : ''}</span>
        <h2 className="battle-title">{battle.enemyName}</h2>
        <p className="battle-enemy-title">{battle.enemyIcon} {battle.enemyTitle}</p>
      </div>

      {phase === 'ready' && round === 1 && (
        <p className="battle-intro">{battle.intro}</p>
      )}

      <div className="battle-arena">
        <div className="battle-side">
          <div className="side-label you">你</div>
          <canvas ref={playerCanvasRef} style={{ width: WHEEL_SIZE, height: WHEEL_SIZE }} />
          <div className="power-bar"><div className="power-fill you" style={{ width: `${playerPower}%` }} /></div>
          <span className="power-num">战力 {playerPower}</span>
          {lastRoll && <span className="roll-value you">{BATTLE_SEGMENTS[lastRoll.p].label} · {BATTLE_SEGMENTS[lastRoll.p].value}</span>}
        </div>

        <div className="battle-vs">VS</div>

        <div className="battle-side">
          <div className="side-label enemy">{battle.enemyName.slice(0, 4)}</div>
          <canvas ref={enemyCanvasRef} style={{ width: WHEEL_SIZE, height: WHEEL_SIZE }} />
          <div className="power-bar"><div className="power-fill enemy" style={{ width: `${enemyPower}%` }} /></div>
          <span className="power-num">战力 {enemyPower}</span>
          {lastRoll && <span className="roll-value enemy">{BATTLE_SEGMENTS[lastRoll.e].label} · {BATTLE_SEGMENTS[lastRoll.e].value}</span>}
        </div>
      </div>

      {totalRounds > 1 && (
        <div className="battle-score">
          <span className="score-you">你 {playerWins}</span>
          <span className="score-sep">:</span>
          <span className="score-enemy">{enemyWins} 敌</span>
        </div>
      )}

      {phase === 'roundResult' && lastRoll && (
        <div className="round-result animate-in">
          <p className={`round-result-text ${lastRoll.result}`}>{roundResultText}</p>
        </div>
      )}

      {phase === 'finished' && finalOutcome && (
        <div className="battle-outcome animate-in" style={{ borderColor: OUTCOME_COLORS[finalOutcome] }}>
          <span className="outcome-label" style={{ color: OUTCOME_COLORS[finalOutcome] }}>
            {BATTLE_OUTCOME_LABELS[finalOutcome]}
          </span>
        </div>
      )}

      <div className="battle-actions">
        {phase === 'ready' && (
          <button className="btn btn-primary btn-battle" onClick={spinRound}>
            {round === 1 ? '🎲 摇动命运之轮' : `🎲 第 ${round} 回合`}
          </button>
        )}
        {phase === 'spinning' && (
          <button className="btn btn-primary btn-battle" disabled>对决进行中…</button>
        )}
        {phase === 'roundResult' && (
          <button className="btn btn-primary btn-battle" onClick={nextRound}>下一回合 →</button>
        )}
        {phase === 'finished' && finalOutcome && (
          <button className="btn btn-primary btn-battle" onClick={() => onResolve(finalOutcome)}>继续 →</button>
        )}
      </div>
    </div>
  )
}
