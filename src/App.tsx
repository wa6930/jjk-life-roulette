import { useState } from 'react'
import { useGame } from './hooks/useGame'
import TitleScreen from './components/TitleScreen'
import Wheel from './components/Wheel'
import EventCard from './components/EventCard'
import StatusPanel from './components/StatusPanel'
import EndingScreen from './components/EndingScreen'
import ExportModal from './components/ExportModal'
import Timeline from './components/Timeline'
import SaveModal from './components/SaveModal'
import BattleScreen from './components/BattleScreen'
import CreationScreen from './components/CreationScreen'
import { ATTR_LABELS } from './game/engine'
import { Attributes } from './types'

const ATTR_ICONS: Record<keyof Attributes, string> = {
  cursedEnergy: '🔮', physical: '💪', technique: '📖', mental: '🧠', luck: '🍀',
}

function DeltaBadges({ deltas, healed }: { deltas?: Partial<Attributes>; healed?: boolean }) {
  const entries = deltas ? Object.entries(deltas).filter(([, v]) => v !== 0) : []
  if (entries.length === 0 && !healed) return null
  return (
    <div className="delta-badges">
      {entries.map(([key, val]) => (
        <span key={key} className={`delta-badge ${(val as number) > 0 ? 'up' : 'down'}`}>
          {ATTR_ICONS[key as keyof Attributes]} {ATTR_LABELS[key as keyof Attributes]} {(val as number) > 0 ? `+${val}` : val}
        </span>
      ))}
      {healed && <span className="delta-badge heal">💚 伤势痊愈</span>}
    </div>
  )
}

export default function App() {
  const {
    game, screen, wheelItems, wheelTitle, lastResult,
    newGame, confirmCreation, loadGame, spinResult, makeChoice, resolveBattle, continueGame, resetToTitle,
  } = useGame()

  const [showExport, setShowExport] = useState(false)
  const [showTimeline, setShowTimeline] = useState(false)
  const [showSave, setShowSave] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')

  const handleSaved = (msg: string) => {
    setSaveMsg(msg)
    setTimeout(() => setSaveMsg(''), 2000)
  }

  if (screen === 'title') {
    return <TitleScreen onStart={newGame} onLoad={loadGame} />
  }

  if (screen === 'creation') {
    return <CreationScreen playerName={game.playerName} onConfirm={confirmCreation} />
  }

  if (screen === 'ending') {
    return <EndingScreen game={game} onRestart={resetToTitle} />
  }

  return (
    <div className="game-screen">
      <StatusPanel game={game} />

      <div className="game-toolbar">
        <button className="toolbar-btn" onClick={() => setShowTimeline(true)}>
          📜
        </button>
        <button className="toolbar-btn" onClick={() => setShowSave(true)}>💾</button>
        <button className="toolbar-btn" onClick={() => setShowExport(true)}>📤</button>
        <button className="toolbar-btn" onClick={resetToTitle}>🏠</button>
      </div>

      {saveMsg && <div className="toast">{saveMsg}</div>}

      <main className="game-main">
        {lastResult && screen === 'wheel' && (
          <div className="result-card animate-in">
            <span className="result-icon">{lastResult.icon}</span>
            <h3 className="result-title">{lastResult.title}</h3>
            <p className="result-narrative">{lastResult.narrative}</p>
            <button className="btn btn-primary" onClick={continueGame}>
              继续 →
            </button>
          </div>
        )}
        {screen === 'wheel' && !lastResult && (
          <Wheel
            items={wheelItems}
            title={wheelTitle}
            onResult={spinResult}
          />
        )}

        {screen === 'event' && game.currentEvent && (
          <EventCard
            key={game.currentEvent.id}
            event={game.currentEvent}
            age={game.age}
            onChoice={makeChoice}
          />
        )}

        {screen === 'battle' && game.currentEvent && (
          <BattleScreen
            key={game.currentEvent.id}
            event={game.currentEvent}
            game={game}
            onResolve={resolveBattle}
          />
        )}

        {screen === 'choice_result' && lastResult && (
          <div className="result-card animate-in">
            <span className="result-icon">{lastResult.icon}</span>
            <h3 className="result-title">{lastResult.title}</h3>
            <p className="result-narrative">{lastResult.narrative}</p>
            <DeltaBadges deltas={lastResult.deltas} healed={lastResult.healed} />
            {game.injury !== 'none' && (
              <p className="injury-notice">🩸 当前伤势：{game.injury}</p>
            )}
            <button className="btn btn-primary" onClick={continueGame}>
              继续 →
            </button>
          </div>
        )}

      </main>

      {showTimeline && (
        <Timeline entries={game.timeline} onClose={() => setShowTimeline(false)} />
      )}
      {showSave && (
        <SaveModal game={game} onClose={() => setShowSave(false)} onSaved={handleSaved} />
      )}
      {showExport && <ExportModal game={game} onClose={() => setShowExport(false)} />}
    </div>
  )
}
