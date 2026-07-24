import { useState } from 'react'
import { GameEvent, Choice } from '../types'

interface EventCardProps {
  event: GameEvent
  age: number
  onChoice: (choiceId: string) => void
}

export default function EventCard({ event, age, onChoice }: EventCardProps) {
  const [revealed, setRevealed] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)

  const handleChoice = (choice: Choice) => {
    if (selected) return
    setSelected(choice.id)
    setTimeout(() => onChoice(choice.id), 600)
  }

  return (
    <div className="event-card">
      <div className="event-header">
        <span className="event-age">{age}岁</span>
        <span className="event-icon">{event.icon}</span>
        <h2 className="event-title">{event.title}</h2>
      </div>

      {!revealed ? (
        <div className="event-narrative-hidden" onClick={() => setRevealed(true)}>
          <div className="sealed-text">
            <span className="seal-icon">🔮</span>
            <p>命运的低语在耳边回响…</p>
            <p className="tap-hint">点击查看事件</p>
          </div>
        </div>
      ) : (
        <div className="event-body animate-in">
          <p className="event-narrative">{event.narrative}</p>
          {event.choices && event.choices.length > 0 ? (
            <div className="choices">
              <p className="choices-label">—— 你的选择是 ——</p>
              {event.choices.map((choice, i) => (
                <button
                  key={choice.id}
                  className={`choice-btn ${selected === choice.id ? 'selected' : ''} ${selected && selected !== choice.id ? 'dimmed' : ''}`}
                  onClick={() => handleChoice(choice)}
                  disabled={!!selected}
                >
                  <span className="choice-index">{['壹', '贰', '叁'][i]}</span>
                  <span className="choice-text">{choice.text}</span>
                </button>
              ))}
            </div>
          ) : (
            <button
              className="btn btn-primary choice-continue"
              onClick={() => handleChoice({ id: '__continue__', text: '继续', attrEffects: {}, narrative: '' })}
              disabled={!!selected}
            >
              继续 →
            </button>
          )}
        </div>
      )}
    </div>
  )
}
