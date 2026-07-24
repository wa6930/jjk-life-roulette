import { Ending, GameState } from '../types'

export const ENDINGS: Ending[] = [
  {
    id: 'special_grade_legend',
    title: '特级咒术师·活着的传说',
    icon: '👑',
    grade: '特级',
    description: '你的名字被刻入咒术史。后世的孩子们听着你的故事长大——那个从命运轮盘中转出奇迹的人。五条悟曾说："那家伙啊，说不定比我强呢。"',
    condition: (s) => s.attributes.cursedEnergy >= 85 && s.attributes.technique >= 80 && s.domainUnlocked && s.tags.includes('special_slayer'),
    priority: 100,
  },
  {
    id: 'strongest_candidate',
    title: '最强候补·新一代的顶点',
    icon: '⚡',
    grade: '特级候补',
    description: '你站在了咒术界的顶点附近。所有人都知道，"最强"的称号只是时间问题。但你不在乎称号——你在乎的是，明天还能不能遇到有趣的对手。',
    condition: (s) => s.attributes.cursedEnergy >= 80 && s.domainUnlocked && s.alive,
    priority: 90,
  },
  {
    id: 'pillar_of_school',
    title: '高专的支柱·桃李满天下',
    icon: '🏫',
    grade: '一级（教育功勋）',
    description: '你成为了高专的传奇教师。你的学生遍布咒术界，他们带着你的教诲守护人间。每年开学季，新生们都会听到关于你的传说。',
    condition: (s) => s.tags.includes('beloved_mentor') && s.attributes.mental >= 70,
    priority: 80,
  },
  {
    id: 'shadow_guardian',
    title: '无名守护者·人间的盾',
    icon: '🛡️',
    grade: '一级',
    description: '你没有惊天动地的名号，但你守护的每一条生命都是真实的。涩谷的幸存者记得你，山区的村民供奉着你的牌位。英雄不一定站在光里。',
    condition: (s) => (s.tags.includes('shibuya_hero') || s.tags.includes('guardian_legend') || s.tags.includes('eternal_guardian')) && s.alive,
    priority: 75,
  },
  {
    id: 'domain_master_ending',
    title: '领域大师·一界之主',
    icon: '🔮',
    grade: '准特级',
    description: '你的领域被誉为"艺术"。结界师们将你的领域构造写进教科书，术师们以接下你的领域一击为荣。在那个领域里，你就是神。',
    condition: (s) => s.domainUnlocked && s.attributes.technique >= 75,
    priority: 70,
  },
  {
    id: 'dark_path_ending',
    title: '诅咒师·深渊的凝视者',
    icon: '🌑',
    grade: '特级（通缉）',
    description: '你最终走上了先祖的道路。高专的通缉令上印着你的照片，诅咒师们尊你为王。深夜里，你偶尔会想起当年那个站在鸟居下的少年。',
    condition: (s) => s.faction === 'curse_user' || (s.tags.includes('blood_soaked') && s.attributes.mental < 40),
    priority: 65,
  },
  {
    id: 'free_spirit_ending',
    title: '自由术师·风一样的旅人',
    icon: '🌊',
    grade: '一级',
    description: '你没有加入任何组织，游走在人间与诅咒的边界。你帮过神社除灵，救过落难孩童，揍过不长眼的诅咒师。江湖上永远流传着你的传说。',
    condition: (s) => s.faction === 'freelance' && s.alive,
    priority: 60,
  },
  {
    id: 'balanced_ending',
    title: '一级咒术师·稳健的人生',
    icon: '⚖️',
    grade: '一级',
    description: '你成为了可靠的一级咒术师。没有惊天动地的壮举，但每一步都走得踏实。同事信任你，后辈尊敬你。这或许就是"幸福"的咒术。',
    condition: (s) => s.alive && s.attributes.cursedEnergy >= 50,
    priority: 50,
  },
  {
    id: 'retired_ending',
    title: '隐退术师·平凡的幸福',
    icon: '🏡',
    grade: '二级（已隐退）',
    description: '你选择了隐退。在乡下开了家小店，偶尔帮邻居看看"脏东西"。咒术界的风云与你无关了——你终于过上了曾经渴望的平凡生活。',
    condition: (s) => s.alive && s.attributes.cursedEnergy < 50,
    priority: 40,
  },
  {
    id: 'martyr_ending',
    title: '殉道者·燃烧的最后一刻',
    icon: '🔥',
    grade: '特级（追授）',
    description: '你在最终之战中燃尽了一切。高专为你举行了最高规格的葬礼，你的故事被写进教材。"他/她笑着离开了，因为身后的人间值得。"',
    condition: (s) => !s.alive && s.tags.includes('war_hero'),
    priority: 85,
  },
  {
    id: 'fallen_ending',
    title: '陨落·被诅咒吞噬',
    icon: '💀',
    grade: '——',
    description: '你的旅程在诅咒中终结。也许某个平行世界里，你做出了不同的选择。轮盘再次转动——这一次，你会走出不同的路吗？',
    condition: (s) => !s.alive,
    priority: 10,
  },
]

/** 根据状态选择结局 */
export function resolveEnding(state: GameState): Ending {
  const matched = ENDINGS
    .filter(e => e.condition(state))
    .sort((a, b) => b.priority - a.priority)
  return matched[0] || ENDINGS[ENDINGS.length - 1]
}
