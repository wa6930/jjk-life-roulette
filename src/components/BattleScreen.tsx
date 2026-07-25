import { useRef, useState, useCallback, useEffect } from 'react'
import { GameEvent, GameState, BattleOutcome, BattleMove } from '../types'
import {
  BATTLE_SEGMENTS, battleWeights, getPlayerMoves, getEnemyMoves,
  computePlayerMaxHP, computeEnemyMaxHP, computeMoveDamage,
  BATTLE_OUTCOME_LABELS,
} from '../game/engine'

interface BattleScreenProps {
  event: GameEvent
  game: GameState
  onResolve: (outcome: BattleOutcome) => void
}

const WHEEL_SIZE = 128
const MAX_ROUNDS = 6

const OUTCOME_COLORS: Record<BattleOutcome, string> = {
  crush_win: '#22c55e',
  narrow_win: '#84cc16',
  draw: '#eab308',
  narrow_loss: '#f97316',
  crush_loss: '#ef4444',
}

type Phase = 'intro' | 'selectMove' | 'spinning' | 'roundResult' | 'finished'

function pickIndex(weights: number[]): number {
  const total = weights.reduce((a, b) => a + b, 0)
  let r = Math.random() * total
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i]
    if (r <= 0) return i
  }
  return weights.length - 1
}

function drawBattleWheel(canvas: HTMLCanvasElement | null, rotation: number, highlightIdx: number | null) {
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const dpr = window.devicePixelRatio || 1
  canvas.width = WHEEL_SIZE * dpr
  canvas.height = WHEEL_SIZE * dpr
  ctx.scale(dpr, dpr)
  const cx = WHEEL_SIZE / 2, cy = WHEEL_SIZE / 2
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
    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate(start + segAngle / 2)
    ctx.textAlign = 'right'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = '#fff'
    ctx.shadowColor = 'rgba(0,0,0,0.6)'
    ctx.shadowBlur = 2
    ctx.font = 'bold 9px "PingFang SC", "Microsoft YaHei", sans-serif'
    ctx.fillText(seg.label, radius - 4, 0)
    ctx.restore()
  })
  ctx.beginPath()
  ctx.arc(cx, cy, 15, 0, Math.PI * 2)
  ctx.fillStyle = '#1a0a2e'
  ctx.fill()
  ctx.strokeStyle = '#8b5cf6'
  ctx.lineWidth = 2
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(cx, 13)
  ctx.lineTo(cx - 7, 1)
  ctx.lineTo(cx + 7, 1)
  ctx.closePath()
  ctx.fillStyle = '#f43f5e'
  ctx.fill()
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

export default function BattleScreen({ event, game, onResolve }: BattleScreenProps) {
  const battle = event.battle!
  const difficulty = battle.difficulty

  const playerCanvasRef = useRef<HTMLCanvasElement>(null)
  const enemyCanvasRef = useRef<HTMLCanvasElement>(null)
  const playerRotRef = useRef(0)
  const enemyRotRef = useRef(0)
  const busyRef = useRef(false)

  const playerMoves = getPlayerMoves(game)
  const enemyMoves = getEnemyMoves(difficulty)
  const playerMaxHP = computePlayerMaxHP(game)
  const enemyMaxHP = computeEnemyMaxHP(difficulty)

  const [phase, setPhase] = useState<Phase>('intro')
  const [round, setRound] = useState(1)
  const [playerHP, setPlayerHP] = useState(playerMaxHP)
  const [enemyHP, setEnemyHP] = useState(enemyMaxHP)
  const [spinInfo, setSpinInfo] = useState<{ side: 'player' | 'enemy'; step: number; total: number; moveName: string } | null>(null)
  const [roundLog, setRoundLog] = useState<{ pDmg: number; eDmg: number; pMove: string; eMove: string; heal: number } | null>(null)
  const [finalOutcome, setFinalOutcome] = useState<BattleOutcome | null>(null)

  const hpRef = useRef({ p: playerMaxHP, e: enemyMaxHP })

  useEffect(() => {
    drawBattleWheel(playerCanvasRef.current, 0, null)
    drawBattleWheel(enemyCanvasRef.current, 0, null)
  }, [])

  const animateToIndex = useCallback((
    canvas: HTMLCanvasElement | null,
    rotRef: React.MutableRefObject<number>,
    targetIdx: number,
    duration: number
  ): Promise<void> => {
    return new Promise(resolve => {
      const n = BATTLE_SEGMENTS.length
      const segAngle = (Math.PI * 2) / n
      const targetCenter = -Math.PI / 2 - (targetIdx * segAngle + segAngle / 2)
      const current = ((rotRef.current % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)
      const desired = ((targetCenter % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)
      let delta = desired - current
      if (delta < 0) delta += Math.PI * 2
      const total = Math.PI * 2 * 2 + delta
      const start = rotRef.current
      const startTime = performance.now()
      const ease = (t: number) => 1 - Math.pow(1 - t, 3)
      const step = (now: number) => {
        const p = Math.min((now - startTime) / duration, 1)
        rotRef.current = start + total * ease(p)
        drawBattleWheel(canvas, rotRef.current, p >= 1 ? targetIdx : null)
        if (p < 1) requestAnimationFrame(step)
        else resolve()
      }
      requestAnimationFrame(step)
    })
  }, [])

  const determineOutcome = useCallback((pHP: number, eHP: number): BattleOutcome => {
    const pRatio = pHP / playerMaxHP
    const eRatio = eHP / enemyMaxHP
    if (eHP <= 0 && pHP <= 0) return 'draw'
    if (eHP <= 0) return pRatio > 0.5 ? 'crush_win' : 'narrow_win'
    if (pHP <= 0) return eRatio > 0.5 ? 'crush_loss' : 'narrow_loss'
    if (Math.abs(pRatio - eRatio) < 0.08) return 'draw'
    return pRatio > eRatio ? 'narrow_win' : 'narrow_loss'
  }, [playerMaxHP, enemyMaxHP])

  const useMove = useCallback(async (move: BattleMove) => {
    if (busyRef.current) return
    busyRef.current = true
    setPhase('spinning')
    setRoundLog(null)

    const playerPower = Math.max(5,
      game.attributes.cursedEnergy * 0.5 + game.attributes.technique * 0.3 + game.attributes.physical * 0.2)

    const pValues: number[] = []
    for (let s = 0; s < move.spins; s++) {
      const idx = pickIndex(battleWeights(playerPower))
      pValues.push(BATTLE_SEGMENTS[idx].value)
      setSpinInfo({ side: 'player', step: s + 1, total: move.spins, moveName: move.name })
      await animateToIndex(playerCanvasRef.current, playerRotRef, idx, 650)
      await sleep(180)
    }
    const pDmg = computeMoveDamage(pValues, move)

    const eMove = enemyMoves[Math.floor(Math.random() * enemyMoves.length)]
    const eValues: number[] = []
    for (let s = 0; s < eMove.spins; s++) {
      const idx = pickIndex(battleWeights(difficulty))
      eValues.push(BATTLE_SEGMENTS[idx].value)
      setSpinInfo({ side: 'enemy', step: s + 1, total: eMove.spins, moveName: eMove.name })
      await animateToIndex(enemyCanvasRef.current, enemyRotRef, idx, 650)
      await sleep(180)
    }
    let eDmg = computeMoveDamage(eValues, eMove)

    let heal = 0
    if (move.guard) eDmg = Math.round(eDmg * (1 - move.guard))
    if (move.heal) heal = move.heal

    const newP = Math.max(0, Math.min(playerMaxHP, hpRef.current.p - eDmg + heal))
    const newE = Math.max(0, hpRef.current.e - pDmg)
    hpRef.current = { p: newP, e: newE }
    setPlayerHP(newP)
    setEnemyHP(newE)
    setSpinInfo(null)
    setRoundLog({ pDmg, eDmg, pMove: move.name, eMove: eMove.name, heal })
    setPhase('roundResult')
    busyRef.current = false
  }, [animateToIndex, enemyMoves, difficulty, game.attributes, playerMaxHP])

  const nextRound = useCallback(() => {
    if (enemyHP <= 0 || playerHP <= 0 || round >= MAX_ROUNDS) {
      setFinalOutcome(determineOutcome(playerHP, enemyHP))
      setPhase('finished')
    } else {
      setRound(r => r + 1)
      setRoundLog(null)
      setPhase('selectMove')
    }
  }, [enemyHP, playerHP, round, determineOutcome])

  const startBattle = () => {
    hpRef.current = { p: playerMaxHP, e: enemyMaxHP }
    setPlayerHP(playerMaxHP)
    setEnemyHP(enemyMaxHP)
    setPhase('selectMove')
  }

  const hpPercent = (cur: number, max: number) => Math.max(0, (cur / max) * 100)

  return (
    <div className="battle-screen animate-in">
      <div className="battle-header">
        <span className="battle-badge">⚔️ 对决 · 第{round}回合</span>
        <h2 className="battle-title">{battle.enemyName}</h2>
        <p className="battle-enemy-title">{battle.enemyIcon} {battle.enemyTitle}</p>
      </div>

      {phase === 'intro' && <p className="battle-intro">{battle.intro}</p>}

      <div className="hp-bars">
        <div className="hp-row">
          <span className="hp-name you">你</span>
          <div className="hp-track"><div className="hp-fill you" style={{ width: `${hpPercent(playerHP, playerMaxHP)}%` }} /></div>
          <span className="hp-num">{playerHP}/{playerMaxHP}</span>
        </div>
        <div className="hp-row">
          <span className="hp-name enemy">{battle.enemyName.slice(0, 4)}</span>
          <div className="hp-track"><div className="hp-fill enemy" style={{ width: `${hpPercent(enemyHP, enemyMaxHP)}%` }} /></div>
          <span className="hp-num">{enemyHP}/{enemyMaxHP}</span>
        </div>
      </div>

      <div className="battle-arena">
        <div className="battle-side">
          <canvas ref={playerCanvasRef} style={{ width: WHEEL_SIZE, height: WHEEL_SIZE }} />
          {spinInfo?.side === 'player' && (
            <div className="spin-progress">{spinInfo.moveName} {spinInfo.step}/{spinInfo.total}</div>
          )}
        </div>
        <div className="battle-vs">VS</div>
        <div className="battle-side">
          <canvas ref={enemyCanvasRef} style={{ width: WHEEL_SIZE, height: WHEEL_SIZE }} />
          {spinInfo?.side === 'enemy' && (
            <div className="spin-progress">{spinInfo.moveName} {spinInfo.step}/{spinInfo.total}</div>
          )}
        </div>
      </div>

      {phase === 'selectMove' && (
        <div className="move-select animate-in">
          <p className="move-select-label">选择你的招式</p>
          <div className="move-grid">
            {playerMoves.map(m => (
              <button key={m.id} className="move-btn" onClick={() => useMove(m)}>
                <span className="move-icon">{m.icon}</span>
                <span className="move-name">{m.name}</span>
                <span className="move-meta">
                  {m.spins > 0 ? `连击×${m.spins}` : '防御'}
                  {m.bonus > 0 ? ` 威力+${m.bonus}` : ''}
                  {m.guard ? ` 减伤${Math.round(m.guard * 100)}%` : ''}
                  {m.heal ? ` 回复${m.heal}` : ''}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {phase === 'spinning' && (
        <div className="battle-status">
          <span className="status-pulse">⚡ {spinInfo?.side === 'player' ? '你' : battle.enemyName}正在出招…</span>
        </div>
      )}

      {phase === 'roundResult' && roundLog && (
        <div className="round-summary animate-in">
          <p className="summary-line you-line">你的「{roundLog.pMove}」造成 <b>{roundLog.pDmg}</b> 伤害</p>
          {roundLog.heal > 0 && <p className="summary-line heal-line">你回复了 <b>{roundLog.heal}</b> 生命</p>}
          <p className="summary-line enemy-line">敌方「{roundLog.eMove}」造成 <b>{roundLog.eDmg}</b> 伤害</p>
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
        {phase === 'intro' && (
          <button className="btn btn-primary btn-battle" onClick={startBattle}>🎲 开始对决</button>
        )}
        {phase === 'roundResult' && (
          <button className="btn btn-primary btn-battle" onClick={nextRound}>
            {enemyHP <= 0 || playerHP <= 0 || round >= MAX_ROUNDS ? '查看结果 →' : '下一回合 →'}
          </button>
        )}
        {phase === 'finished' && finalOutcome && (
          <button className="btn btn-primary btn-battle" onClick={() => onResolve(finalOutcome)}>继续 →</button>
        )}
      </div>
    </div>
  )
}
