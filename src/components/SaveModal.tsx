import { useState } from 'react'
import { GameState } from '../types'
import { getSaveSlots, saveToSlot } from '../utils/storage'

interface SaveModalProps {
  game: GameState
  onClose: () => void
  onSaved: (msg: string) => void
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString('zh-CN', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

export default function SaveModal({ game, onClose, onSaved }: SaveModalProps) {
  const [slots, setSlots] = useState(getSaveSlots())
  const [confirmSlot, setConfirmSlot] = useState<number | null>(null)

  const handleSave = (slotId: number) => {
    const occupied = slots[slotId] !== null
    // 已有存档的槽位需要二次确认才能覆盖
    if (occupied && confirmSlot !== slotId) {
      setConfirmSlot(slotId)
      return
    }
    if (saveToSlot(slotId, game)) {
      setSlots(getSaveSlots())
      setConfirmSlot(null)
      onSaved(`✅ 已保存到槽位 ${slotId + 1}`)
      onClose()
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal save-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>💾 保存进度</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <p className="save-modal-hint">选择一个槽位保存，已有存档可直接覆盖</p>

        <div className="save-slot-list">
          {slots.map((slot, i) => (
            <button
              key={i}
              className={`save-slot-btn ${slot ? 'occupied' : 'empty'} ${confirmSlot === i ? 'confirming' : ''}`}
              onClick={() => handleSave(i)}
            >
              <div className="slot-head">
                <span className="slot-num">槽位 {i + 1}</span>
                {slot && <span className="slot-saved-time">{formatTime(slot.savedAt)}</span>}
              </div>
              <div className="slot-body">
                {slot
                  ? <span className="slot-summary-text">{slot.summary}</span>
                  : <span className="slot-empty-text">—— 空 ——</span>}
              </div>
              <div className="slot-foot">
                {slot
                  ? (confirmSlot === i
                      ? <span className="slot-action danger">再点一次确认覆盖</span>
                      : <span className="slot-action">覆盖此存档</span>)
                  : <span className="slot-action">保存到这里</span>}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
