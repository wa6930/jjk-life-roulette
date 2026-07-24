import { useCallback, useEffect, useReducer } from 'react'
import { GameState, GameEvent, Attributes, BattleOutcome, Gender } from '../types'
import {
  createInitialState, applyOrigin, applyTechnique, drawEvent,
  applyChoice, shouldAdvancePhase, advancePhase, needsTechniqueWheel,
  finishGame, filterAvailableEvents, applyBattle, BATTLE_OUTCOME_LABELS,
} from '../game/engine'
import { ORIGIN_WHEEL_ITEMS } from '../data/origins'
import { getTechniqueWheelItems } from '../data/techniques'
import { autoSave, loadAutoSave, clearAutoSave } from '../utils/storage'
import { WheelItem } from '../types'

export type GameScreen = 'title' | 'creation' | 'wheel' | 'event' | 'battle' | 'choice_result' | 'ending'

export interface ResultDelta {
  title: string
  narrative: string
  icon: string
  deltas?: Partial<Attributes>
  healed?: boolean
}

interface GameReducerState {
  game: GameState
  screen: GameScreen
  wheelItems: WheelItem[]
  wheelTitle: string
  lastResult: ResultDelta | null
}

type Action =
  | { type: 'NEW_GAME'; name: string }
  | { type: 'CONFIRM_CREATION'; gender: Gender; appearance: number }
  | { type: 'LOAD_GAME'; state: GameState }
  | { type: 'SPIN_RESULT'; itemId: string }
  | { type: 'SHOW_EVENT'; event: GameEvent }
  | { type: 'MAKE_CHOICE'; choiceId: string }
  | { type: 'RESOLVE_BATTLE'; outcome: BattleOutcome }
  | { type: 'CONTINUE' }
  | { type: 'ADVANCE_PHASE' }
  | { type: 'FINISH' }
  | { type: 'RESET_TO_TITLE' }

/** 计算属性增量 */
function computeDelta(before: Attributes, after: Attributes): Partial<Attributes> {
  const delta: Partial<Attributes> = {}
  for (const key of Object.keys(after) as (keyof Attributes)[]) {
    const d = after[key] - before[key]
    if (d !== 0) delta[key] = d
  }
  return delta
}

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
  // 事件轮盘：展示当前可用的命运碎片（最多8个）
  const events = filterAvailableEvents(game)
  if (events.length === 0) {
    return { items: [{ id: '__advance__', label: '时光流转', icon: '⏳', weight: 1 }], title: '命运之轮' }
  }
  const injured = game.injury !== 'none'
  const isHealing = (e: { requireInjured?: boolean; tags: string[] }) =>
    !!e.requireInjured || e.tags.includes('healing')
  // 受伤时治疗事件排在前面并加权（占比更高）
  const sorted = injured
    ? [...events].sort((a, b) => Number(isHealing(b)) - Number(isHealing(a)))
    : events
  const shown = sorted.slice(0, 8)
  const items: WheelItem[] = shown.map(e => ({
    id: e.id, label: e.title, icon: e.icon,
    weight: injured && isHealing(e) ? e.weight * 4 : e.weight,
  }))
  return { items, title: getPhaseWheelName(game.phase) }
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
      return { game, screen: 'creation', wheelItems: ORIGIN_WHEEL_ITEMS, wheelTitle: '出身轮盘·命运的起点', lastResult: null }
    }

    case 'CONFIRM_CREATION': {
      // 相貌影响初始运气与精神；随后进入出身轮盘
      const game: GameState = {
        ...state.game,
        gender: action.gender,
        appearance: action.appearance,
        attributes: {
          ...state.game.attributes,
          luck: Math.min(100, state.game.attributes.luck + action.appearance * 2),
          mental: Math.min(100, state.game.attributes.mental + Math.floor(action.appearance / 2)),
        },
      }
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

      // 推进占位（当前阶段事件已耗尽）→ 直接进入下一阶段
      if (action.itemId === '__advance__') {
        const newGame = advancePhase(game)
        if (newGame.phase === 'ending') {
          const final = finishGame(newGame)
          return { ...state, game: final, screen: 'ending', lastResult: null }
        }
        const wheel = buildWheelForState(newGame)
        return { game: newGame, screen: 'wheel', wheelItems: wheel.items, wheelTitle: wheel.title, lastResult: null }
      }

      // 事件轮盘 → 根据转到的条目展示对应事件
      const available = filterAvailableEvents(game)
      const event = available.find(e => e.id === action.itemId) || drawEvent(game)
      if (!event) {
        const newGame = advancePhase(game)
        if (newGame.phase === 'ending') {
          const final = finishGame(newGame)
          return { ...state, game: final, screen: 'ending' }
        }
        const wheel = buildWheelForState(newGame)
        return { game: newGame, screen: 'wheel', wheelItems: wheel.items, wheelTitle: wheel.title, lastResult: null }
      }
      // 战斗事件 → 进入对决轮盘
      if (event.battle) {
        return { ...state, game: { ...game, currentEvent: event }, screen: 'battle', lastResult: null }
      }
      return { ...state, game: { ...game, currentEvent: event }, screen: 'event' }
    }

    case 'SHOW_EVENT': {
      return { ...state, game: { ...state.game, currentEvent: action.event }, screen: 'event' }
    }

    case 'MAKE_CHOICE': {
      const { game } = state
      if (!game.currentEvent) return state
      const before = game.attributes
      const wasInjured = game.injury !== 'none'
      const newGame = applyChoice(game, game.currentEvent, action.choiceId)

      if (!newGame.alive || newGame.phase === 'ending') {
        const final = newGame.phase === 'ending' ? newGame : finishGame(newGame)
        return { ...state, game: final, screen: 'ending', lastResult: null }
      }

      const lastChoice = game.currentEvent.choices?.find(c => c.id === action.choiceId)
      const healed = wasInjured && newGame.injury === 'none'
      return {
        ...state,
        game: newGame,
        screen: 'choice_result',
        lastResult: {
          title: game.currentEvent.title,
          narrative: lastChoice?.narrative || game.currentEvent.narrative,
          icon: game.currentEvent.icon,
          deltas: computeDelta(before, newGame.attributes),
          healed,
        },
      }
    }

    case 'RESOLVE_BATTLE': {
      const { game } = state
      if (!game.currentEvent || !game.currentEvent.battle) return state
      const before = game.attributes
      const newGame = applyBattle(game, game.currentEvent, action.outcome)

      if (!newGame.alive || newGame.phase === 'ending') {
        const final = newGame.phase === 'ending' ? newGame : finishGame(newGame)
        return { ...state, game: final, screen: 'ending', lastResult: null }
      }

      const battle = game.currentEvent.battle
      const isWin = action.outcome === 'crush_win' || action.outcome === 'narrow_win'
      const narrative = isWin ? battle.winNarrative
        : action.outcome === 'draw' ? battle.drawNarrative : battle.loseNarrative
      return {
        ...state,
        game: newGame,
        screen: 'choice_result',
        lastResult: {
          title: `对决·${battle.enemyName}（${BATTLE_OUTCOME_LABELS[action.outcome]}）`,
          narrative,
          icon: battle.enemyIcon,
          deltas: computeDelta(before, newGame.attributes),
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
        return { game: newGame, screen: 'wheel', wheelItems: wheel.items, wheelTitle: wheel.title, lastResult: null }
      }
      const wheel = buildWheelForState(game)
      return { ...state, screen: 'wheel', wheelItems: wheel.items, wheelTitle: wheel.title, lastResult: null }
    }

    case 'FINISH': {
      const final = finishGame(state.game)
      return { ...state, game: final, screen: 'ending' }
    }

    case 'RESET_TO_TITLE': {
      return {
        game: createInitialState(''),
        screen: 'title',
        wheelItems: ORIGIN_WHEEL_ITEMS,
        wheelTitle: '出身轮盘·命运的起点',
        lastResult: null,
      }
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
  const confirmCreation = useCallback((gender: Gender, appearance: number) => dispatch({ type: 'CONFIRM_CREATION', gender, appearance }), [])
  const loadGame = useCallback((gs: GameState) => dispatch({ type: 'LOAD_GAME', state: gs }), [])
  const spinResult = useCallback((itemId: string) => dispatch({ type: 'SPIN_RESULT', itemId }), [])
  const makeChoice = useCallback((choiceId: string) => dispatch({ type: 'MAKE_CHOICE', choiceId }), [])
  const resolveBattle = useCallback((outcome: BattleOutcome) => dispatch({ type: 'RESOLVE_BATTLE', outcome }), [])
  const continueGame = useCallback(() => dispatch({ type: 'CONTINUE' }), [])
  const finish = useCallback(() => dispatch({ type: 'FINISH' }), [])
  const resetToTitle = useCallback(() => {
    clearAutoSave()
    dispatch({ type: 'RESET_TO_TITLE' })
  }, [])

  return {
    game: state.game,
    screen: state.screen,
    wheelItems: state.wheelItems,
    wheelTitle: state.wheelTitle,
    lastResult: state.lastResult,
    newGame, confirmCreation, loadGame, spinResult, makeChoice, resolveBattle, continueGame, finish, resetToTitle,
  }
}
