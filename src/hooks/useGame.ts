import { useCallback, useEffect, useReducer } from 'react'
import { GameState, GameEvent } from '../types'
import {
  createInitialState, applyOrigin, applyTechnique, drawEvent,
  applyChoice, shouldAdvancePhase, advancePhase, needsTechniqueWheel,
  finishGame, weightedRandom,
} from '../game/engine'
import { ORIGIN_WHEEL_ITEMS } from '../data/origins'
import { getTechniqueWheelItems } from '../data/techniques'
import { autoSave, loadAutoSave, clearAutoSave } from '../utils/storage'
import { WheelItem } from '../types'

export type GameScreen = 'title' | 'wheel' | 'event' | 'choice_result' | 'ending'

interface GameReducerState {
  game: GameState
  screen: GameScreen
  wheelItems: WheelItem[]
  wheelTitle: string
  lastResult: { title: string; narrative: string; icon: string } | null
}

type Action =
  | { type: 'NEW_GAME'; name: string }
  | { type: 'LOAD_GAME'; state: GameState }
  | { type: 'SPIN_RESULT'; itemId: string }
  | { type: 'SHOW_EVENT'; event: GameEvent }
  | { type: 'MAKE_CHOICE'; choiceId: string }
  | { type: 'CONTINUE' }
  | { type: 'ADVANCE_PHASE' }
  | { type: 'FINISH' }

function buildWheelForState(game: GameState): { items: WheelItem[]; title: string } {
  if (game.phase === 'origin') {
    return { items: ORIGIN_WHEEL_ITEMS, title: '出身轮盘·命运的起点' }
  }
  if (needsTechniqueWheel(game)) {
    const items = getTechniqueWheelItems(game.tags, game.phase)
    if (items.length > 0) {
      return { items, title: '术式轮盘·觉醒之刻' }
    }
  }
  const events = drawEvent(game)
  if (!events) {
    return { items: [{ id: '__advance__', label: '时光流转', icon: '⏳', weight: 1 }], title: '命运之轮' }
  }
  // 事件轮盘：展示当前可用事件的"命运碎片"
  const items: WheelItem[] = [
    { id: events.id, label: events.title, icon: events.icon, weight: 1 },
  ]
  return { items, title: `${getPhaseWheelName(game.phase)}` }
}

function getPhaseWheelName(phase: string): string {
  const names: Record<string, string> = {
    childhood: '幼年轮盘·觉醒之章',
    school: '高专轮盘·青春之章',
    career: '实战轮盘·修罗之章',
    legend: '传说轮盘·终焉之章',
  }
  return names[phase] || '命运之轮'
}

function gameReducer(state: GameReducerState, action: Action): GameReducerState {
  switch (action.type) {
    case 'NEW_GAME': {
      const game = createInitialState(action.name)
      const wheel = buildWheelForState(game)
      return { game, screen: 'wheel', wheelItems: wheel.items, wheelTitle: wheel.title, lastResult: null }
    }

    case 'LOAD_GAME': {
      const game = action.state
      if (game.phase === 'ending') {
        return { game, screen: 'ending', wheelItems: [], wheelTitle: '', lastResult: null }
      }
      const wheel = buildWheelForState(game)
      return { game, screen: 'wheel', wheelItems: wheel.items, wheelTitle: wheel.title, lastResult: null }
    }

    case 'SPIN_RESULT': {
      const { game } = state

      // 出身轮盘
      if (game.phase === 'origin') {
        const newGame = applyOrigin(game, action.itemId)
        const wheel = buildWheelForState(newGame)
        const origin = newGame.timeline[newGame.timeline.length - 1]
        return {
          game: newGame, screen: 'wheel',
          wheelItems: wheel.items, wheelTitle: wheel.title,
          lastResult: { title: origin.title, narrative: origin.description, icon: '🎲' },
        }
      }

      // 术式轮盘
      if (needsTechniqueWheel(game)) {
        const items = getTechniqueWheelItems(game.tags, game.phase)
        if (items.length > 0 && items.some(i => i.id === action.itemId)) {
          const newGame = applyTechnique(game, action.itemId)
          const tech = newGame.technique!
          const wheel = buildWheelForState(newGame)
          return {
            game: newGame, screen: 'wheel',
            wheelItems: wheel.items, wheelTitle: wheel.title,
            lastResult: {
              title: `术式觉醒·${tech.name}`,
              narrative: tech.description,
              icon: tech.icon,
            },
          }
        }
      }

      // 推进占位
      if (action.itemId === '__advance__') {
        return { ...state, screen: 'wheel' }
      }

      // 事件轮盘 → 展示事件
      const event = drawEvent(game)
      if (!event) {
        const newGame = advancePhase(game)
        if (newGame.phase === 'ending') {
          const final = finishGame(newGame)
          return { ...state, game: final, screen: 'ending' }
        }
        const wheel = buildWheelForState(newGame)
        return { game: newGame, screen: 'wheel', wheelItems: wheel.items, wheelTitle: wheel.title }
      }
      return { ...state, game: { ...game, currentEvent: event }, screen: 'event' }
    }

    case 'SHOW_EVENT': {
      return { ...state, game: { ...state.game, currentEvent: action.event }, screen: 'event' }
    }

    case 'MAKE_CHOICE': {
      const { game } = state
      if (!game.currentEvent) return state
      const newGame = applyChoice(game, game.currentEvent, action.choiceId)

      if (!newGame.alive || newGame.phase === 'ending') {
        const final = newGame.phase === 'ending' ? newGame : finishGame(newGame)
        return { ...state, game: final, screen: 'ending', lastResult: null }
      }

      const lastChoice = game.currentEvent.choices.find(c => c.id === action.choiceId)!
      return {
        ...state,
        game: newGame,
        screen: 'choice_result',
        lastResult: {
          title: game.currentEvent.title,
          narrative: lastChoice.narrative,
          icon: game.currentEvent.icon,
        },
      }
    }

    case 'CONTINUE': {
      const { game } = state
      // 检查是否需要阶段推进
      if (shouldAdvancePhase(game)) {
        const newGame = advancePhase(game)
        if (newGame.phase === 'ending') {
          const final = finishGame(newGame)
          return { ...state, game: final, screen: 'ending', lastResult: null }
        }
        const wheel = buildWheelForState(newGame)
        return { game: newGame, screen: 'wheel', wheelItems: wheel.items, wheelTitle: wheel.title, lastResult: state.lastResult }
      }
      const wheel = buildWheelForState(game)
      return { ...state, screen: 'wheel', wheelItems: wheel.items, wheelTitle: wheel.title }
    }

    case 'FINISH': {
      const final = finishGame(state.game)
      return { ...state, game: final, screen: 'ending' }
    }

    default:
      return state
  }
}

export function useGame() {
  const [state, dispatch] = useReducer(gameReducer, null, () => {
    const saved = loadAutoSave()
    if (saved && saved.phase !== 'origin') {
      const wheel = buildWheelForState(saved)
      return {
        game: saved,
        screen: (saved.phase === 'ending' ? 'ending' : 'wheel') as GameScreen,
        wheelItems: wheel.items,
        wheelTitle: wheel.title,
        lastResult: null,
      }
    }
    return {
      game: createInitialState(''),
      screen: 'title' as GameScreen,
      wheelItems: ORIGIN_WHEEL_ITEMS,
      wheelTitle: '出身轮盘·命运的起点',
      lastResult: null,
    }
  })

  // 自动保存
  useEffect(() => {
    if (state.game.turn > 0) {
      autoSave(state.game)
    }
  }, [state.game])

  const newGame = useCallback((name: string) => dispatch({ type: 'NEW_GAME', name }), [])
  const loadGame = useCallback((gs: GameState) => dispatch({ type: 'LOAD_GAME', state: gs }), [])
  const spinResult = useCallback((itemId: string) => dispatch({ type: 'SPIN_RESULT', itemId }), [])
  const makeChoice = useCallback((choiceId: string) => dispatch({ type: 'MAKE_CHOICE', choiceId }), [])
  const continueGame = useCallback(() => dispatch({ type: 'CONTINUE' }), [])
  const finish = useCallback(() => dispatch({ type: 'FINISH' }), [])
  const resetToTitle = useCallback(() => {
    clearAutoSave()
    dispatch({ type: 'NEW_GAME', name: '' })
  }, [])

  return {
    game: state.game,
    screen: state.screen,
    wheelItems: state.wheelItems,
    wheelTitle: state.wheelTitle,
    lastResult: state.lastResult,
    newGame, loadGame, spinResult, makeChoice, continueGame, finish, resetToTitle,
  }
}
