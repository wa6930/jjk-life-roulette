import { useState } from 'react'
import { Gender } from '../types'
import { APPEARANCE_LABELS } from '../game/engine'

interface CreationScreenProps {
  playerName: string
  onConfirm: (gender: Gender, appearance: number) => void
}

const APPEARANCE_FLAVOR: Record<number, string> = {
  1: '丢进人堆里转眼就找不着了。',
  2: '邻居家的孩子，越看越顺眼。',
  3: '走在路上，偶尔会有人回头看你一眼。',
  4: '高专里公认的美人，任务时总能多刷点脸卡。',
  5: '惊为天人，连咒灵都忍不住多看你两眼。',
}

export default function CreationScreen({ playerName, onConfirm }: CreationScreenProps) {
  const [gender, setGender] = useState<Gender | null>(null)
  const [appearance, setAppearance] = useState<number | null>(null)
  const [rolling, setRolling] = useState(false)

  const randomGender = () => setGender(Math.random() > 0.5 ? 'male' : 'female')

  const rollAppearance = () => {
    if (rolling) return
    setRolling(true)
    let ticks = 0
    const timer = setInterval(() => {
      setAppearance(Math.floor(Math.random() * 5) + 1)
      ticks++
      if (ticks > 10) {
        clearInterval(timer)
        // 加权：中间值更常见
        const pool = [1, 2, 2, 3, 3, 3, 3, 4, 4, 5]
        setAppearance(pool[Math.floor(Math.random() * pool.length)])
        setRolling(false)
      }
    }, 70)
  }

  const canConfirm = gender !== null && appearance !== null && !rolling

  return (
    <div className="creation-screen">
      <div className="creation-card animate-in">
        <div className="creation-emblem">🎴</div>
        <h2 className="creation-title">塑造你的术师</h2>
        <p className="creation-name">{playerName}，在踏入咒术界之前……</p>

        <div className="creation-section">
          <div className="section-head">
            <h3>性别</h3>
            <button className="mini-roll" onClick={randomGender}>🎲 随机</button>
          </div>
          <div className="gender-options">
            <button
              className={`gender-btn ${gender === 'male' ? 'active' : ''}`}
              onClick={() => setGender('male')}
            >
              <span className="gender-icon">♂</span>
              <span>男</span>
            </button>
            <button
              className={`gender-btn ${gender === 'female' ? 'active' : ''}`}
              onClick={() => setGender('female')}
            >
              <span className="gender-icon">♀</span>
              <span>女</span>
            </button>
          </div>
        </div>

        <div className="creation-section">
          <div className="section-head">
            <h3>相貌</h3>
            <button className="mini-roll" onClick={rollAppearance} disabled={rolling}>
              {rolling ? '…' : '🎲 摇一摇'}
            </button>
          </div>
          {appearance !== null ? (
            <div className="appearance-result animate-in">
              <div className="appearance-stars">
                {'★'.repeat(appearance)}{'☆'.repeat(5 - appearance)}
              </div>
              <div className="appearance-label">{APPEARANCE_LABELS[appearance]}</div>
              <p className="appearance-flavor">{APPEARANCE_FLAVOR[appearance]}</p>
            </div>
          ) : (
            <p className="appearance-hint">点击"摇一摇"抽取你的相貌，或手动选择：</p>
          )}
          <div className="appearance-picker">
            {[1, 2, 3, 4, 5].map(n => (
              <button
                key={n}
                className={`appearance-chip ${appearance === n ? 'active' : ''}`}
                onClick={() => setAppearance(n)}
              >
                {APPEARANCE_LABELS[n]}
              </button>
            ))}
          </div>
        </div>

        <button
          className="btn btn-primary btn-confirm"
          disabled={!canConfirm}
          onClick={() => canConfirm && onConfirm(gender!, appearance!)}
        >
          {canConfirm ? '⛩️ 转动出身轮盘' : '请先选择性别与相貌'}
        </button>
        <p className="creation-tip">💡 相貌越高，初始运气越好，也越容易触发恋爱缘分。</p>
      </div>
    </div>
  )
}
