import { TimelineEntry } from '../types'

interface TimelineProps {
  entries: TimelineEntry[]
  onClose: () => void
}

const TYPE_ICONS: Record<string, string> = {
  origin: '🎲', technique: '✨', event: '📜', choice: '🔀',
  injury: '🩸', stage_change: '⏩', char_death: '⚰️', ending: '🏁',
}

export default function Timeline({ entries, onClose }: TimelineProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal timeline-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>📜 命运的轨迹</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {entries.length === 0 ? (
          <p className="timeline-empty">命运尚未开始转动……</p>
        ) : (
          <div className="timeline-list modal-scroll">
            {[...entries].reverse().map((entry, i) => (
              <div
                key={`${entry.turn}-${i}`}
                className={`timeline-item ${entry.eventType}`}
                style={{ animationDelay: `${Math.min(i * 35, 350)}ms` }}
              >
                <div className="timeline-dot" />
                <div className="timeline-content">
                  <div className="timeline-meta">
                    <span className="tl-icon">{TYPE_ICONS[entry.eventType] || '📌'}</span>
                    <span className="tl-age">{entry.age}岁</span>
                    <span className="tl-phase">{entry.phaseLabel}</span>
                  </div>
                  <p className="tl-title">{entry.title}</p>
                  <p className="tl-desc">{entry.description}</p>
                  {entry.chosenOption && (
                    <p className="tl-choice">→ 你的选择：{entry.chosenOption}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
