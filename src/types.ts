// ============ 咒术回战·人生轮盘 核心类型定义 ============

/** 人生阶段（时代） */
export type Phase =
  | 'origin'       // 转生·出身决定
  | 'childhood'    // 幼年篇 (0-15岁)
  | 'school'       // 高专篇 (15-18岁)
  | 'career'       // 实战篇 (18-30岁)
  | 'legend'       // 传说篇 (30岁+)
  | 'ending'       // 结局

/** 出身类型 */
export type OriginType =
  | 'sorcerer_clan'   // 咒术师名门
  | 'commoner'        // 普通人家庭
  | 'vessel'          // 容器体质
  | 'fallen'          // 堕落术师血脉
  | 'cursed_hybrid'   // 半咒灵混血
  | 'orphan'          // 孤儿·被咒灵养大
  | 'gojo_branch'     // 五条家旁系
  | 'zenin_outcast'   // 禅院家弃子
  | 'cursed_womb'     // 咒胎九相图
  | 'star_plasma'     // 星浆体血脉

/** 阵营 */
export type Faction =
  | 'tokyo_school'    // 东京高专
  | 'kyoto_school'    // 京都高专
  | 'freelance'       // 自由术师
  | 'curse_user'      // 诅咒师
  | 'neutral'         // 中立/未定

/** 术式类别 */
export type TechniqueCategory =
  | 'innate'          // 生得术式
  | 'inherited'       // 家传术式
  | 'cursed_spirit'   // 咒灵操术系
  | 'domain_master'   // 领域特化
  | 'body_type'       // 肉体强化系
  | 'special_grade'   // 特级术式

/** 属性键 */
export type AttrKey = 'cursedEnergy' | 'physical' | 'technique' | 'mental' | 'luck'

/** 属性集合 */
export type Attributes = Record<AttrKey, number>

/** 伤势等级 */
export type InjuryLevel = 'none' | 'light' | 'moderate' | 'heavy' | 'critical'

/** 关系类型 */
export type RelationType = 'ally' | 'rival' | 'mentor' | 'enemy' | 'friend' | 'family' | 'lover'

/** 性别 */
export type Gender = 'male' | 'female'

/** NPC角色 */
export interface Character {
  id: string
  name: string
  title: string
  alive: boolean
  relation: RelationType
  affinity: number        // 好感度 -100 ~ 100
  appearedInPhase: Phase
  romanceable?: boolean   // 是否可恋爱
  preferGender?: Gender   // 角色偏好的玩家性别（恋爱门控）
}

/** 轮盘条目 */
export interface WheelItem {
  id: string
  label: string
  icon: string
  weight: number
  color?: string
}

/** 选择项 */
export interface Choice {
  id: string
  text: string
  attrEffects: Partial<Attributes>
  narrative: string          // 选择后的叙事
  injuryRisk?: { level: InjuryLevel; chance: number }
  relationEffects?: { charId: string; delta: number }[]
  tags?: string[]            // 给状态打的标签
  nextEventId?: string       // 触发的后续事件
  killChar?: string          // 该选择可能导致的角色死亡
  deathChance?: number       // 该选择的玩家死亡概率
  heal?: boolean             // 该选择是否治疗伤势（恢复至健康）
  setLover?: string          // 该选择将某角色关系设为恋人（charId）
}

/** 战斗结果等级 */
export type BattleOutcome = 'crush_win' | 'narrow_win' | 'draw' | 'narrow_loss' | 'crush_loss'

/** 战斗配置（双方摇轮盘定输赢） */
export interface BattleConfig {
  enemyName: string
  enemyIcon: string
  enemyTitle: string
  difficulty: number         // 敌方战力 0-100
  rounds?: number            // 总回合数（多轮战斗，默认1）
  intro: string              // 开战前的叙事
  enemyCharId?: string       // 关联角色ID（胜利可将其击倒）
  killEnemyOnWin?: boolean   // 大胜/险胜是否击杀敌人
  rewards: {                 // 胜利奖励
    attrs?: Partial<Attributes>
    tags?: string[]
  }
  loseEffects: {             // 失败后果
    attrs?: Partial<Attributes>
    injury?: InjuryLevel
    deathChance?: number
    tags?: string[]
  }
  drawEffects?: {            // 平局后果
    attrs?: Partial<Attributes>
    injury?: InjuryLevel
    tags?: string[]
  }
  winNarrative: string
  loseNarrative: string
  drawNarrative: string
}

/** 游戏事件 */
export interface GameEvent {
  id: string
  title: string
  icon: string
  narrative: string          // 事件叙事文本（支持{state}插值）
  minAge: number
  maxAge: number
  phases: Phase[]
  weight: number
  tags: string[]             // 事件标签
  requireTags?: string[]     // 需要的状态标签
  excludeTags?: string[]     // 排斥的状态标签（防矛盾核心）
  requireChars?: string[]    // 需要存活的角色
  excludeChars?: string[]    // 角色死亡则排除
  requireFaction?: Faction[] // 阵营限制
  excludeFaction?: Faction[] // 阵营排斥
  requireTechnique?: boolean // 需要已有术式
  requireNoTechnique?: boolean
  requireInjured?: boolean   // 需要处于受伤状态（治疗类事件门控）
  requireMinInjury?: InjuryLevel  // 需要达到最低伤势等级
  requireGender?: Gender     // 性别门控（恋爱事件）
  requireMinAppearance?: number   // 最低相貌门控（1-5）
  requireAffinity?: { charId: string; min: number }  // 需要某角色好感度达标
  repeatable?: boolean       // 可重复触发（修炼/日常类事件，不进入已用列表）
  choices?: Choice[]         // 可选项；留空则为纯叙事事件（无选择，直接继续）
  battle?: BattleConfig      // 战斗事件配置（存在时进入对决轮盘）
  attrEffects?: Partial<Attributes>   // 事件本身的属性影响
  injury?: { level: InjuryLevel; chance: number }
  grantTags?: string[]       // 事件赋予的标签
  killChar?: string          // 事件可能导致的角色死亡
  deathChance?: number       // 玩家死亡概率（触发坏结局）
}

/** 出身定义 */
export interface Origin {
  id: OriginType
  label: string
  icon: string
  description: string
  narrative: string
  baseAttrs: Attributes
  grantTags: string[]
  initialChars: string[]     // 初始角色ID
  color: string
}

/** 战斗招式 */
export interface BattleMove {
  id: string
  name: string
  icon: string
  spins: number          // 转盘次数（连击数）
  bonus: number          // 招式威力加成
  desc: string
  guard?: number         // 本回合减伤比例 0-1（防御类招式）
  heal?: number          // 本回合回复生命（治疗类招式）
}

/** 术式定义 */
export interface Technique {
  id: string
  name: string
  icon: string
  category: TechniqueCategory
  description: string
  domainName?: string        // 领域展开名
  move?: BattleMove          // 术式签名招式（战斗中使用）
  attrBonus: Partial<Attributes>
  grantTags: string[]
  minPhase: Phase
  weight: number
  requireTags?: string[]
  excludeTags?: string[]
}

/** 时间线条目 */
export interface TimelineEntry {
  turn: number
  age: number
  phase: Phase
  phaseLabel: string
  eventType: 'origin' | 'technique' | 'event' | 'choice' | 'injury' | 'stage_change' | 'char_death' | 'ending'
  title: string
  description: string
  attrSnapshot: Attributes
  wheelUsed: string          // 使用了哪个轮盘
  chosenOption?: string
}

/** 结局定义 */
export interface Ending {
  id: string
  title: string
  icon: string
  grade: string              // 术师等级评价
  description: string
  condition: (state: GameState) => boolean
  priority: number
}

/** 游戏主状态（状态机核心） */
export interface GameState {
  version: number
  gameId: string
  playerName: string
  gender: Gender | null      // 性别
  appearance: number         // 相貌 1-5（平凡~绝世）
  phase: Phase
  age: number
  turn: number
  origin: OriginType | null
  faction: Faction | null
  technique: Technique | null
  domainUnlocked: boolean
  attributes: Attributes
  injury: InjuryLevel
  injuryTurns: number        // 受伤持续的回合数（用于自动愈合）
  tags: string[]             // 状态标签（防矛盾的关键）
  characters: Character[]
  timeline: TimelineEntry[]
  usedEventIds: string[]     // 已触发的事件（避免重复）
  alive: boolean
  ending: Ending | null
  currentEvent: GameEvent | null
  pendingWheel: 'technique' | null   // 待转的轮盘
  spinCount: number          // 本阶段转盘次数
  maxSpinsPerPhase: Record<Phase, number>
}

/** 存档 */
export interface SaveSlot {
  slotId: number
  savedAt: string
  state: GameState
  summary: string
}

/** 导出格式 */
export type ExportFormat = 'json' | 'markdown' | 'ai-prompt'
