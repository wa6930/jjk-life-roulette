import { useState } from 'react'
import { GameState } from '../types'
import { ATTR_LABELS, INJURY_LABELS, PHASE_LABELS, GENDER_LABELS, APPEARANCE_LABELS } from '../game/engine'
import { ORIGINS } from '../data/origins'

interface StatusPanelProps {
  game: GameState
}

const FACTION_NAMES: Record<string, string> = {
  tokyo_school: '东京高专', kyoto_school: '京都高专',
  freelance: '自由术师', curse_user: '诅咒师', neutral: '无所属',
}

const RELATION_NAMES: Record<string, string> = {
  ally: '盟友', rival: '劲敌', mentor: '导师', enemy: '敌人', friend: '友人', family: '家族', lover: '恋人',
}

export default function StatusPanel({ game }: StatusPanelProps) {
  const [expanded, setExpanded] = useState(false)
  const origin = ORIGINS.find(o => o.id === game.origin)

  return (
    <div className={`status-panel ${expanded ? 'expanded' : ''}`}>
      <div className="status-bar" onClick={() => setExpanded(!expanded)}>
        <div className="status-main">
          <span className="status-name">{game.playerName || '无名术师'}</span>
          <span className="status-phase">{PHASE_LABELS[game.phase]}</span>
          <span className="status-age">{game.age}岁</span>
        </div>
        <div className="status-mini-attrs">
          <span title="咒力">🔮{game.attributes.cursedEnergy}</span>
          <span title="体术">💪{game.attributes.physical}</span>
          <span title="术式">📖{game.attributes.technique}</span>
          <span title="精神">🧠{game.attributes.mental}</span>
          <span title="运气">🍀{game.attributes.luck}</span>
        </div>
        <span className={`expand-arrow ${expanded ? 'up' : ''}`}>▼</span>
      </div>

      {expanded && (
        <div className="status-detail animate-in">
          <div className="detail-section">
            <h4>身份</h4>
            <div className="identity-grid">
              <div className="identity-item">
                <span className="label">性别</span>
                <span className="value">{game.gender ? GENDER_LABELS[game.gender] : '—'}</span>
              </div>
              <div className="identity-item">
                <span className="label">相貌</span>
                <span className="value">{game.appearance ? `${APPEARANCE_LABELS[game.appearance]}·${'★'.repeat(game.appearance)}` : '—'}</span>
              </div>
              <div className="identity-item">
                <span className="label">出身</span>
                <span className="value">{origin ? `${origin.icon} ${origin.label}` : '—'}</span>
              </div>
              <div className="identity-item">
                <span className="label">阵营</span>
                <span className="value">{game.faction ? FACTION_NAMES[game.faction] : '—'}</span>
              </div>
              <div className="identity-item">
                <span className="label">术式</span>
                <span className="value">{game.technique ? `${game.technique.icon} ${game.technique.name}` : '未觉醒'}</span>
              </div>
              <div className="identity-item">
                <span className="label">领域</span>
                <span className="value">
                  {game.domainUnlocked && game.technique?.domainName ? `✅ ${game.technique.domainName}` : '未解锁'}
                </span>
              </div>
              <div className="identity-item">
                <span className="label">伤势</span>
                <span className={`value injury-${game.injury}`}>{INJURY_LABELS[game.injury]}</span>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h4>属性</h4>
            {Object.entries(ATTR_LABELS).map(([key, label]) => {
              const val = game.attributes[key as keyof typeof game.attributes]
              return (
                <div key={key} className="attr-row">
                  <span className="attr-label">{label}</span>
                  <div className="attr-bar-bg">
                    <div className="attr-bar" style={{ width: `${val}%` }} />
                  </div>
                  <span className="attr-value">{val}</span>
                </div>
              )
            })}
          </div>

          {game.characters.length > 0 && (
            <div className="detail-section">
              <h4>人际关系</h4>
              <div className="char-list">
                {game.characters.map(c => (
                  <div key={c.id} className={`char-item ${!c.alive ? 'dead' : ''}`}>
                    <span className="char-name">{c.name}</span>
                    <span className="char-title">{c.title}</span>
                    <span className="char-rel">{RELATION_NAMES[c.relation]}</span>
                    <span className="char-status">{c.alive ? (c.affinity >= 50 ? '❤️' : c.affinity >= 0 ? '💛' : '💔') : '⚰️'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {game.tags.length > 0 && (
            <div className="detail-section">
              <h4>状态标签</h4>
              <div className="tag-list">
                {game.tags.slice(0, 12).map(t => (
                  <span key={t} className="state-tag">{t.replace(/_/g, ' ')}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
