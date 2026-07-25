import { BattleMove } from '../types'

/** 通用招式（所有玩家可用） */
export const GENERIC_MOVES: BattleMove[] = [
  {
    id: 'basic',
    name: '普通攻击',
    icon: '👊',
    spins: 1,
    bonus: 0,
    desc: '朴实无华的一击。',
  },
  {
    id: 'combo',
    name: '连续进攻',
    icon: '🥊',
    spins: 2,
    bonus: 6,
    desc: '不给对手喘息机会的连续攻击。',
  },
  {
    id: 'charged',
    name: '蓄力重击',
    icon: '💥',
    spins: 1,
    bonus: 32,
    desc: '凝聚全身咒力的全力一击，威力巨大。',
  },
  {
    id: 'guard',
    name: '咒力防御',
    icon: '🛡️',
    spins: 1,
    bonus: 0,
    guard: 0.6,
    desc: '以咒力护体，大幅减轻本回合受到的伤害。',
  },
]

/** 术式签名招式映射 */
export const TECHNIQUE_MOVES: Record<string, BattleMove> = {
  ten_shadows: { id: 'tm_ten_shadows', name: '玉犬「浑」连击', icon: '🐺', spins: 3, bonus: 16, desc: '召唤式神连续撕咬敌人。' },
  limitless: { id: 'tm_limitless', name: '虚式·茈', icon: '🟣', spins: 2, bonus: 42, desc: '假想质量撞击，毁灭性的一击。' },
  blood_manipulation: { id: 'tm_blood', name: '穿血', icon: '🩸', spins: 2, bonus: 26, desc: '高压血弹贯穿敌人。' },
  cursed_speech: { id: 'tm_speech', name: '咒言·「别动」', icon: '🗣️', spins: 1, bonus: 20, guard: 0.5, desc: '咒言束缚敌人，削弱其攻势。' },
  straw_doll: { id: 'tm_straw', name: '共鸣', icon: '🪆', spins: 2, bonus: 24, desc: '无视防御的共鸣伤害。' },
  projection: { id: 'tm_projection', name: '二十四帧连击', icon: '⚡', spins: 3, bonus: 18, desc: '一秒二十四帧的极速连打。' },
  idle_transfiguration: { id: 'tm_idle', name: '无为转变', icon: '🫠', spins: 2, bonus: 36, desc: '触碰灵魂的重击。' },
  disaster_flames: { id: 'tm_flames', name: '极之番·陨', icon: '🌋', spins: 2, bonus: 38, desc: '召唤烈焰陨石砸向敌人。' },
  cursed_spirit_manipulation: { id: 'tm_spirit', name: '咒灵群攻', icon: '🌀', spins: 3, bonus: 17, desc: '操纵多只咒灵围攻。' },
  boogie_woogie: { id: 'tm_boogie', name: '不义游戏', icon: '👏', spins: 2, bonus: 20, guard: 0.3, desc: '交换位置扰乱对手节奏。' },
  heavenly_restriction: { id: 'tm_heavenly', name: '超人体术', icon: '💪', spins: 3, bonus: 22, desc: '纯粹肉体爆发的暴力连击。' },
  reverse_output: { id: 'tm_reverse', name: '反转·治愈', icon: '💚', spins: 1, bonus: 12, heal: 35, desc: '反转术式回复自身生命。' },
  ratio_technique: { id: 'tm_ratio', name: '七三分·弱点', icon: '📐', spins: 2, bonus: 30, desc: '精准命中对手的七三弱点。' },
  star_rage: { id: 'tm_star', name: '星之怒', icon: '🌟', spins: 2, bonus: 44, desc: '附加虚质量的星辰重击。' },
  shrine: { id: 'tm_shrine', name: '解·捌', icon: '🔪', spins: 3, bonus: 32, desc: '诅咒之王的斩击连闪。' },
  simple_domain: { id: 'tm_domain', name: '一斩必杀', icon: '🗡️', spins: 1, bonus: 38, desc: '领域加持下的拔刀斩。' },
  // 彩蛋/搞笑术式招式
  kamehameha: { id: 'tm_kame', name: '龟派气功', icon: '🌊', spins: 2, bonus: 38, desc: '来自另一个世界的著名招式。' },
  stand_rush: { id: 'tm_stand', name: '欧拉欧拉连打', icon: '⭐', spins: 4, bonus: 14, desc: '替身使者的疯狂连打。' },
  serious_punch: { id: 'tm_punch', name: '认真一拳', icon: '🥇', spins: 1, bonus: 52, desc: '认真起来的一拳，威力惊人。' },
  time_stop: { id: 'tm_time', name: '砸瓦鲁多', icon: '⏰', spins: 3, bonus: 24, guard: 0.4, desc: '停止时间，为所欲为。' },
  magic_arrow: { id: 'tm_magic', name: '魔法箭雨', icon: '🏹', spins: 3, bonus: 20, desc: '魔法少女的箭矢连射。' },
}
