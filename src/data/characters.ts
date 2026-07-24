import { Character } from '../types'

/** NPC角色库 */
export const CHARACTER_POOL: Omit<Character, 'alive' | 'affinity' | 'appearedInPhase'>[] = [
  { id: 'gojo', name: '五条悟', title: '最强咒术师', relation: 'mentor' },
  { id: 'sukuna', name: '两面宿傩', title: '诅咒之王', relation: 'enemy' },
  { id: 'megumi', name: '伏黑惠', title: '十种影法术使用者', relation: 'friend' },
  { id: 'nobara', name: '的原野蔷薇', title: '刍灵咒法使用者', relation: 'friend' },
  { id: 'yuji', name: '虎杖悠仁', title: '宿傩的容器', relation: 'friend' },
  { id: 'nanami', name: '七海建人', title: '一级咒术师', relation: 'mentor' },
  { id: 'todo', name: '东堂葵', title: '不义游戏使用者', relation: 'rival' },
  { id: 'maki', name: '禅院真希', title: '咒具使い', relation: 'friend' },
  { id: 'toge', name: '狗卷棘', title: '咒言师', relation: 'friend' },
  { id: 'panda', name: '胖达', title: '夜蛾学长的造物', relation: 'friend' },
  { id: 'geto', name: '夏油杰', title: '诅咒师·最恶', relation: 'enemy' },
  { id: 'mahito', name: '真人', title: '特級咒灵', relation: 'enemy' },
  { id: 'jogo', name: '漏瑚', title: '特級咒灵·火山', relation: 'enemy' },
  { id: 'hanami', name: '花御', title: '特級咒灵·森', relation: 'enemy' },
  { id: 'choso', name: '胀相', title: '咒胎九相图', relation: 'rival' },
  { id: 'yaga', name: '夜蛾正道', title: '东京高专校长', relation: 'mentor' },
  { id: 'shoko', name: '家入硝子', title: '反转术式医师', relation: 'mentor' },
  { id: 'zenin', name: '禅院直毗人', title: '禅院家当主', relation: 'family' },
  { id: 'kamo', name: '加茂宪纪', title: '加茂家继承者', relation: 'rival' },
  { id: 'mei', name: '冥冥', title: '自由术师·乌鸦使', relation: 'mentor' },
  { id: 'uta', name: '歌姬', title: '京都高专教师', relation: 'mentor' },
  { id: 'kenjaku', name: '羂索', title: '千年诅咒师', relation: 'enemy' },
  { id: 'yuta', name: '乙骨忧太', title: '特级咒术师', relation: 'rival' },
  { id: 'riko', name: '天内理子', title: '星浆体', relation: 'friend' },
  { id: 'toji', name: '伏黑甚尔', title: '术师杀手', relation: 'enemy' },
]

/** 根据出身获取初始角色 */
export function getInitialCharacters(originId: string): string[] {
  const map: Record<string, string[]> = {
    sorcerer_clan: ['zenin', 'kamo', 'yaga'],
    commoner: ['yuji', 'nobara', 'nanami'],
    vessel: ['sukuna', 'yuji', 'gojo'],
    fallen: ['geto', 'mei', 'nanami'],
    cursed_hybrid: ['mahito', 'choso', 'hanami'],
    orphan: ['gojo', 'panda', 'toge'],
  }
  return map[originId] || ['gojo', 'yuji']
}

/** 各阶段可能新登场的角色 */
export const PHASE_CHARACTER_POOL: Record<string, string[]> = {
  childhood: ['gojo', 'nanami', 'megumi', 'nobara', 'yuji', 'yaga', 'shoko'],
  school: ['todo', 'maki', 'toge', 'panda', 'yuta', 'kamo', 'mei', 'uta', 'riko'],
  career: ['geto', 'mahito', 'jogo', 'hanami', 'choso', 'toji', 'kenjaku', 'sukuna'],
  legend: ['kenjaku', 'sukuna', 'geto', 'mahito', 'yuta', 'gojo'],
}
