import {
  GameState, GameEvent, Phase, Attributes, InjuryLevel,
  TimelineEntry, Character, Technique,
} from '../types'
import { ALL_EVENTS } from '../data/events'
import { ORIGINS } from '../data/origins'
import { TECHNIQUES } from '../data/techniques'
import { resolveEnding } from '../data/endings'
import { CHARACTER_POOL, getInitialCharacters, PHASE_CHARACTER_POOL } from '../data/characters'

export const PHASE_LABELS: Record<Phase, string> = {
  origin: '转生',
  childhood: '幼年篇',
  school: '高专篇',
  career: '实战篇',
  legend: '传说篇',
  ending: '终局',
}

export const PHASE_AGE_RANGE: Record<Phase, [number, number]> = {
  origin: [0, 0],
  childhood: [6, 14],
  school: [15, 18],
  career: [19, 35],
  legend: [36, 70],
  ending: [99, 99],
}

export const INJURY_LABELS: Record<InjuryLevel, string> = {
  none: '健康',
  light: '轻伤',
  moderate: '中度伤',
  heavy: '重伤',
  critical: '濒死',
}

export const ATTR_LABELS: Record<keyof Attributes, string> = {
  cursedEnergy: '咒力',
  physical: '体术',
  technique: '术式理解',
  mental: '精神',
  luck: '运气',
}

/** 创建新游戏状态 */
export function createInitialState(playerName: string): GameState {
  return {
    version: 1,
    gameId: `jjk_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    playerName,
    phase: 'origin',
    age: 0,
    turn: 0,
    origin: null,
    faction: null,
    technique: null,
    domainUnlocked: false,
    attributes: { cursedEnergy: 10, physical: 10, technique: 10, mental: 10, luck: 10 },
    injury: 'none',
    tags: [],
    characters: [],
    timeline: [],
    usedEventIds: [],
    alive: true,
    ending: null,
    currentEvent: null,
    pendingWheel: null,
    spinCount: 0,
    maxSpinsPerPhase: {
      origin: 1, childhood: 4, school: 4, career: 5, legend: 3, ending: 0,
    },
  }
}

/** 加权随机选择 */
export function weightedRandom<T extends { weight: number }>(items: T[]): T {
  const total = items.reduce((sum, i) => sum + i.weight, 0)
  let roll = Math.random() * total
  for (const item of items) {
    roll -= item.weight
    if (roll <= 0) return item
  }
  return items[items.length - 1]
}

/**
 * 核心防矛盾过滤器：根据当前状态过滤可用事件
 */
export function filterAvailableEvents(state: GameState): GameEvent[] {
  return ALL_EVENTS.filter(evt => {
    // 1. 阶段匹配
    if (!evt.phases.includes(state.phase)) return false
    // 2. 年龄匹配
    if (state.age < evt.minAge || state.age > evt.maxAge) return false
    // 3. 事件未使用过
    if (state.usedEventIds.includes(evt.id)) return false
    // 4. 标签需求
    if (evt.requireTags && evt.requireTags.length > 0 &&
        !evt.requireTags.some(t => state.tags.includes(t))) return false
    // 5. 标签排斥（防矛盾核心）
    if (evt.excludeTags && evt.excludeTags.some(t => state.tags.includes(t))) return false
    // 6. 阵营限制
    if (evt.requireFaction && !evt.requireFaction.includes(state.faction || 'neutral')) return false
    if (evt.excludeFaction && evt.excludeFaction.includes(state.faction || 'neutral')) return false
    // 7. 术式条件
    if (evt.requireTechnique && !state.technique) return false
    if (evt.requireNoTechnique && state.technique) return false
    // 8. 角色存活条件
    if (evt.requireChars && !evt.requireChars.some(c => isCharAlive(state, c))) return false
    if (evt.excludeChars && evt.excludeChars.some(c => isCharAlive(state, c))) return false
    return true
  })
}

function isCharAlive(state: GameState, charId: string): boolean {
  const char = state.characters.find(c => c.id === charId)
  return char ? char.alive : false
}

/** 应用出身 */
export function applyOrigin(state: GameState, originId: string): GameState {
  const origin = ORIGINS.find(o => o.id === originId)!
  const chars = getInitialCharacters(originId).map(id => {
    const base = CHARACTER_POOL.find(c => c.id === id)!
    return { ...base, alive: true, affinity: 30, appearedInPhase: 'origin' as Phase }
  })

  const newState: GameState = {
    ...state,
    origin: origin.id,
    phase: 'childhood',
    age: 6,
    turn: 1,
    attributes: { ...origin.baseAttrs },
    tags: [...origin.grantTags],
    characters: chars,
    faction: origin.id === 'fallen' ? 'neutral' : 'neutral',
  }

  newState.timeline = [...state.timeline, {
    turn: 1, age: 6, phase: 'origin', phaseLabel: PHASE_LABELS.origin,
    eventType: 'origin',
    title: `转生·${origin.label}`,
    description: origin.narrative,
    attrSnapshot: { ...origin.baseAttrs },
    wheelUsed: '出身轮盘',
  }]

  return newState
}

/** 应用术式 */
export function applyTechnique(state: GameState, techId: string): GameState {
  const tech = TECHNIQUES.find(t => t.id === techId)!
  const newAttrs = applyAttrEffects(state.attributes, tech.attrBonus)

  const newState: GameState = {
    ...state,
    technique: tech,
    attributes: newAttrs,
    tags: [...state.tags, ...tech.grantTags.filter(t => !state.tags.includes(t))],
    pendingWheel: null,
  }

  newState.timeline = [...state.timeline, {
    turn: state.turn, age: state.age, phase: state.phase,
    phaseLabel: PHASE_LABELS[state.phase],
    eventType: 'technique',
    title: `术式觉醒·${tech.name}`,
    description: `${tech.description}${tech.domainName ? `（领域：${tech.domainName}）` : ''}`,
    attrSnapshot: { ...newAttrs },
    wheelUsed: '术式轮盘',
  }]

  return newState
}

/** 抽取下一个事件（带防矛盾过滤） */
export function drawEvent(state: GameState): GameEvent | null {
  const available = filterAvailableEvents(state)
  if (available.length === 0) return null
  return weightedRandom(available)
}

/** 应用属性效果 */
export function applyAttrEffects(attrs: Attributes, effects: Partial<Attributes>): Attributes {
  const result = { ...attrs }
  for (const [key, val] of Object.entries(effects)) {
    const k = key as keyof Attributes
    result[k] = Math.max(0, Math.min(100, result[k] + (val || 0)))
  }
  return result
}

/** 阶段推进检查 */
export function shouldAdvancePhase(state: GameState): boolean {
  const maxSpins = state.maxSpinsPerPhase[state.phase]
  return state.spinCount >= maxSpins
}

/** 推进到下一阶段 */
export function advancePhase(state: GameState): GameState {
  const order: Phase[] = ['childhood', 'school', 'career', 'legend', 'ending']
  const idx = order.indexOf(state.phase)
  if (idx === -1 || idx >= order.length - 1) return state

  const nextPhase = order[idx + 1]
  const [minAge] = PHASE_AGE_RANGE[nextPhase]

  // 阶段转换时的特殊处理
  let newState = { ...state, phase: nextPhase, spinCount: 0, currentEvent: null }

  if (nextPhase === 'school') {
    // 决定阵营
    if (!newState.faction || newState.faction === 'neutral') {
      if (newState.tags.includes('school_bound') || newState.tags.includes('noticed_by_school')) {
        newState.faction = Math.random() > 0.3 ? 'tokyo_school' : 'kyoto_school'
      } else if (newState.tags.includes('independent_path')) {
        newState.faction = 'freelance'
      } else {
        newState.faction = Math.random() > 0.5 ? 'tokyo_school' : 'freelance'
      }
    }
  }

  if (nextPhase === 'career' && (!newState.faction || newState.faction === 'tokyo_school' || newState.faction === 'kyoto_school')) {
    // 毕业后选择
    if (newState.tags.includes('rebel_heart') || newState.tags.includes('tempted_by_dark')) {
      newState.faction = Math.random() > 0.6 ? 'freelance' : newState.faction
    }
  }

  newState.age = minAge
  newState.turn = state.turn + 1

  // 新阶段角色登场
  const pool = PHASE_CHARACTER_POOL[nextPhase] || []
  const existingIds = new Set(newState.characters.map(c => c.id))
  const newChars: Character[] = []
  for (const id of pool) {
    if (!existingIds.has(id) && Math.random() > 0.45) {
      const base = CHARACTER_POOL.find(c => c.id === id)
      if (base) {
        newChars.push({ ...base, alive: true, affinity: Math.floor(Math.random() * 40) - 10, appearedInPhase: nextPhase })
      }
    }
  }
  newState.characters = [...newState.characters, ...newChars]

  const factionNames: Record<string, string> = {
    tokyo_school: '东京咒术高专', kyoto_school: '京都咒术高专',
    freelance: '自由术师', curse_user: '诅咒师', neutral: '无所属',
  }

  newState.timeline = [...state.timeline, {
    turn: newState.turn, age: minAge, phase: nextPhase,
    phaseLabel: PHASE_LABELS[nextPhase],
    eventType: 'stage_change',
    title: `进入·${PHASE_LABELS[nextPhase]}`,
    description: nextPhase === 'school'
      ? `你踏入了新的时代。所属：${factionNames[newState.faction || 'neutral']}`
      : `时光流转，你进入了人生的新阶段。`,
    attrSnapshot: { ...newState.attributes },
    wheelUsed: '命运之轮',
  }]

  return newState
}

/** 处理选择结果 */
export function applyChoice(
  state: GameState,
  event: GameEvent,
  choiceId: string
): GameState {
  const choice = event.choices.find(c => c.id === choiceId)!
  let newState = { ...state }

  // 1. 事件本身属性效果
  if (event.attrEffects) {
    newState.attributes = applyAttrEffects(newState.attributes, event.attrEffects)
  }
  // 2. 选择属性效果
  newState.attributes = applyAttrEffects(newState.attributes, choice.attrEffects)

  // 3. 事件标签
  if (event.grantTags) {
    newState.tags = [...new Set([...newState.tags, ...event.grantTags])]
  }
  // 4. 选择标签
  if (choice.tags) {
    newState.tags = [...new Set([...newState.tags, ...choice.tags])]
  }

  // 5. 伤势判定
  let injuryNarrative = ''
  const injuryRoll = event.injury || choice.injuryRisk
  if (injuryRoll && Math.random() < injuryRoll.chance) {
    newState.injury = injuryRoll.level
    injuryNarrative = `你受到了${INJURY_LABELS[injuryRoll.level]}。`
    newState.timeline = [...newState.timeline, {
      turn: newState.turn, age: newState.age, phase: newState.phase,
      phaseLabel: PHASE_LABELS[newState.phase],
      eventType: 'injury',
      title: `负伤·${INJURY_LABELS[injuryRoll.level]}`,
      description: injuryNarrative,
      attrSnapshot: { ...newState.attributes },
      wheelUsed: '命运之轮',
    }]
  }

  // 6. 关系变化
  if (choice.relationEffects) {
    newState.characters = newState.characters.map(c => {
      const eff = choice.relationEffects!.find(e => e.charId === c.id)
      return eff ? { ...c, affinity: Math.max(-100, Math.min(100, c.affinity + eff.delta)) } : c
    })
  }

  // 7. 角色死亡判定
  if (event.killChar && Math.random() < (event.deathChance || 0.3)) {
    const target = newState.characters.find(c => c.id === event.killChar && c.alive)
    if (target) {
      newState.characters = newState.characters.map(c =>
        c.id === event.killChar ? { ...c, alive: false } : c
      )
      newState.timeline = [...newState.timeline, {
        turn: newState.turn, age: newState.age, phase: newState.phase,
        phaseLabel: PHASE_LABELS[newState.phase],
        eventType: 'char_death',
        title: `讣报·${target.name}`,
        description: `${target.name}（${target.title}）在这场战斗中陨落。`,
        attrSnapshot: { ...newState.attributes },
        wheelUsed: '命运之轮',
      }]
    }
  }

  // 8. 玩家死亡判定
  if (event.deathChance && Math.random() < event.deathChance * 0.5) {
    newState.alive = false
    newState.phase = 'ending'
    newState.ending = resolveEnding(newState)
  }

  // 9. 领域解锁判定
  if (!newState.domainUnlocked && newState.technique?.domainName &&
      newState.attributes.cursedEnergy >= 70 && newState.attributes.technique >= 65 &&
      Math.random() > 0.5) {
    newState.domainUnlocked = true
  }

  // 10. 记录时间线
  newState.timeline = [...newState.timeline, {
    turn: newState.turn, age: newState.age, phase: newState.phase,
    phaseLabel: PHASE_LABELS[newState.phase],
    eventType: 'event',
    title: event.title,
    description: event.narrative,
    attrSnapshot: { ...newState.attributes },
    wheelUsed: `${PHASE_LABELS[newState.phase]}事件轮盘`,
    chosenOption: choice.text,
  }]

  if (choice.narrative) {
    newState.timeline = [...newState.timeline, {
      turn: newState.turn, age: newState.age, phase: newState.phase,
      phaseLabel: PHASE_LABELS[newState.phase],
      eventType: 'choice',
      title: `抉择·${choice.text}`,
      description: choice.narrative,
      attrSnapshot: { ...newState.attributes },
      wheelUsed: '自由意志',
    }]
  }

  // 11. 推进
  newState.usedEventIds = [...newState.usedEventIds, event.id]
  newState.currentEvent = null
  newState.spinCount = state.spinCount + 1
  newState.turn = state.turn + 1
  newState.age = Math.min(
    state.age + Math.floor(Math.random() * 2) + 1,
    PHASE_AGE_RANGE[state.phase][1]
  )

  // 伤势自然恢复
  if (newState.injury !== 'none' && Math.random() > 0.6) {
    const levels: InjuryLevel[] = ['none', 'light', 'moderate', 'heavy', 'critical']
    const idx = levels.indexOf(newState.injury)
    if (idx > 0) newState.injury = levels[idx - 1]
  }

  return newState
}

/** 检查是否需要触发术式轮盘 */
export function needsTechniqueWheel(state: GameState): boolean {
  return !state.technique && state.phase !== 'origin' && state.phase !== 'ending' &&
    state.age >= 8 && !state.tags.includes('heavenly_restriction')
}

/** 结束游戏，计算结局 */
export function finishGame(state: GameState): GameState {
  const ending = resolveEnding(state)
  const newState = { ...state, phase: 'ending' as Phase, ending }

  newState.timeline = [...state.timeline, {
    turn: state.turn, age: state.age, phase: 'ending',
    phaseLabel: PHASE_LABELS.ending,
    eventType: 'ending',
    title: `终局·${ending.title}`,
    description: ending.description,
    attrSnapshot: { ...state.attributes },
    wheelUsed: '命运之轮',
  }]

  return newState
}
