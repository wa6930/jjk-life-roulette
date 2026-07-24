import { useState } from 'react'
import { GameState } from '../types'
import { ATTR_LABELS } from '../game/engine'
import { ORIGINS } from '../data/origins'
import Timeline from './Timeline'
import ExportModal from './ExportModal'

interface EndingScreenProps {
  game: GameState
  onRestart: () => void
}

export default function EndingScreen({ game, onRestart }: EndingScreenProps) {
  const [showExport, setShowExport] = useState(false)
  const [showTimeline, setShowTimeline] = useState(false)
  const origin = ORIGINS.find(o => o.id === game.origin)
  const ending = game.ending

  if (!ending) return null

  return (
    <div className="ending-screen">
      <div className="ending-card animate-in">
        <div className="ending-grade-badge">{ending.grade}</div>
        <div className="ending-icon">{ending.icon}</div>
        <h1 className="ending-title">{ending.title}</h1>
        <p className="ending-desc">{ending.description}</p>

        <div className="ending-stats">
          <div className="ending-stat-row">
            <span>出身</span><span>{origin ? `${origin.icon} ${origin.label}` : '—'}</span>
          </div>
          <div className="ending-stat-row">
            <span>术式</span><span>{game.technique ? `${game.technique.icon} ${game.technique.name}` : '无'}</span>
          </div>
          <div className="ending-stat-row">
            <span>领域</span>
            <span>{game.domainUnlocked && game.technique?.domainName ? game.technique.domainName : '未解锁'}</span>
          </div>
          <div className="ending-stat-row">
            <span>终年</span><span>{game.age}岁 · {game.alive ? '存活' : '死亡'}</span>
          </div>
          <div className="ending-stat-row">
            <span>经历事件</span><span>{game.usedEventIds.length}个</span>
          </div>
        </div>

        <div className="ending-attrs">
          {Object.entries(ATTR_LABELS).map(([key, label]) => (
            <div key={key} className="ending-attr">
              <span>{label}</span>
              <div className="attr-bar-bg small">
                <div className="attr-bar" style={{ width: `${game.attributes[key as keyof typeof game.attributes]}%` }} />
              </div>
              <span>{game.attributes[key as keyof typeof game.attributes]}</span>
            </div>
          ))}
        </div>

        <div className="ending-actions">
          <button className="btn btn-primary" onClick={() => setShowExport(true)}>
            📤 导出人生 / AI总结
          </button>
          <button className="btn btn-ghost" onClick={() => setShowTimeline(!showTimeline)}>
            {showTimeline ? '收起时间线' : '📜 回顾一生'}
          </button>
          <button className="btn btn-ghost" onClick={onRestart}>
            🔄 再转一世
          </button>
        </div>
      </div>

      {showTimeline && <Timeline entries={game.timeline} onClose={() => setShowTimeline(false)} />}
      {showExport && <ExportModal game={game} onClose={() => setShowExport(false)} />}
    </div>
  )
}
