import { useState } from 'react'
import { getSaveSlots, loadFromSlot, deleteSlot } from '../utils/storage'
import { GameState } from '../types'

interface TitleScreenProps {
  onStart: (name: string) => void
  onLoad: (state: GameState) => void
}

export default function TitleScreen({ onStart, onLoad }: TitleScreenProps) {
  const [name, setName] = useState('')
  const [slots, setSlots] = useState(getSaveSlots())

  const handleStart = () => {
    onStart(name.trim() || '无名术师')
  }

  const handleLoad = (slotId: number) => {
    const state = loadFromSlot(slotId)
    if (state) onLoad(state)
  }

  const handleDelete = (slotId: number) => {
    deleteSlot(slotId)
    setSlots(getSaveSlots())
  }

  return (
    <div className="title-screen">
      <div className="title-bg-effects">
        <div className="curse-orb orb-1" />
        <div className="curse-orb orb-2" />
        <div className="curse-orb orb-3" />
      </div>

      <div className="title-content animate-in">
        <div className="title-emblem">👁️</div>
        <h1 className="game-title">
          <span className="title-sub">咒术回战</span>
          <span className="title-main">人生轮盘</span>
        </h1>
        <p className="title-tagline">转动命运之轮，书写你的咒术人生</p>

        <div className="name-input-group">
          <input
            type="text"
            className="name-input"
            placeholder="输入你的名字（可选）"
            value={name}
            onChange={e => setName(e.target.value)}
            maxLength={12}
            onKeyDown={e => e.key === 'Enter' && handleStart()}
          />
          <button className="btn btn-primary btn-start" onClick={handleStart}>
            ⛩️ 开始转生
          </button>
        </div>

        <div className="title-features">
          <span>🎲 随机出身</span>
          <span>✨ 术式觉醒</span>
          <span>⚔️ 生死抉择</span>
          <span>🏁 多重结局</span>
        </div>

        {slots.some(s => s !== null) && (
          <div className="save-slots">
            <h3>📂 存档</h3>
            {slots.map((slot, i) => (
              <div key={i} className="save-slot">
                {slot ? (
                  <>
                    <div className="slot-info">
                      <span className="slot-summary">{slot.summary}</span>
                      <span className="slot-time">
                        {new Date(slot.savedAt).toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="slot-actions">
                      <button className="btn btn-small" onClick={() => handleLoad(i)}>读取</button>
                      <button className="btn btn-small btn-danger" onClick={() => handleDelete(i)}>删除</button>
                    </div>
                  </>
                ) : (
                  <span className="slot-empty">空槽位 {i + 1}</span>
                )}
              </div>
            ))}
          </div>
        )}

        <p className="title-hint">💡 游戏自动存档，可随时关闭。添加到主屏幕可获得App般体验。</p>
      </div>
    </div>
  )
}
