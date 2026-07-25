import { GameEvent } from '../types'

// ============ 出身后续事件（特殊出身影响后续剧情） ============
export const originFollowupEvents: GameEvent[] = [
  {
    id: 'of_clan_pressure',
    title: '家族的期望与枷锁',
    icon: '⛩️',
    narrative: '家族长老召见了你："你是名门之后，一举一动都代表家族。"同辈的嫉妒、长辈的期许，像无形的锁链。你开始思考：你究竟是为了家族而活，还是为了自己？',
    minAge: 12, maxAge: 30, phases: ['childhood', 'school', 'career'], weight: 6,
    tags: ['origin_story'], requireTags: ['high_expectations'], excludeTags: ['of_clan_done'],
    grantTags: ['of_clan_done'],
    choices: [
      { id: 'a', text: '扛起家族的责任', attrEffects: { mental: 8, technique: 5 }, narrative: '你选择背负家族的期望。这份重量让你更快成熟，也让你失去了某些轻松。但你无怨无悔。', tags: ['clan_duty'] },
      { id: 'b', text: '走自己的路', attrEffects: { mental: 6, luck: 5 }, narrative: '"我的人生，我自己定义。"你顶住压力，选择了自己的道路。家族失望了，但你找到了自己。', tags: ['free_spirit'] },
    ],
  },
  {
    id: 'of_vessel_whisper',
    title: '容器深处的低语',
    icon: '👁️',
    narrative: '深夜，那个声音又来了。它在你体内低语，许诺力量，索要代价。你能感觉到，你的身体里沉睡着某种可怕的东西。它在等待，等待你松懈的那一刻。',
    minAge: 12, maxAge: 40, phases: ['childhood', 'school', 'career', 'legend'], weight: 6,
    tags: ['origin_story'], requireTags: ['vessel_body'], excludeTags: ['of_vessel_done'],
    grantTags: ['of_vessel_done'],
    choices: [
      { id: 'a', text: '用意志力筑起防线', attrEffects: { mental: 12, cursedEnergy: 5 }, narrative: '你在意识深处筑起高墙，把那个声音隔绝在外。这场无声的战争，你赢了第一回合。', tags: ['iron_will'] },
      { id: 'b', text: '试探性地汲取它的力量', attrEffects: { cursedEnergy: 15, mental: -10 }, narrative: '你小心翼翼地借用了一丝力量。它强大得令人战栗。你知道，这是在刀尖上跳舞。', tags: ['cursed_power', 'marked_by_sukuna'] },
    ],
  },
  {
    id: 'of_hybrid_identity',
    title: '我是谁',
    icon: '🪞',
    narrative: '人类的术师视你为异类，咒灵也不接纳你。你站在两个世界的夹缝中，找不到归属。镜子里的自己，瞳孔偶尔会闪过非人的竖瞳。你究竟是人，还是咒灵？',
    minAge: 12, maxAge: 35, phases: ['childhood', 'school', 'career'], weight: 6,
    tags: ['origin_story'], requireTags: ['half_cursed'], excludeTags: ['of_hybrid_done'],
    grantTags: ['of_hybrid_done'],
    choices: [
      { id: 'a', text: '接受自己的双重身份', attrEffects: { mental: 12, cursedEnergy: 6 }, narrative: '"我既是人，也是咒灵。这不是诅咒，是天赋。"你接纳了自己，两种力量开始在你体内和谐共存。', tags: ['self_acceptance'] },
      { id: 'b', text: '努力证明自己是人类', attrEffects: { mental: 6, physical: 5 }, narrative: '你拼命压抑体内的咒灵之血，努力像人类一样生活。这很累，但你不想成为怪物。', tags: ['human_at_heart'] },
    ],
  },
  {
    id: 'of_zenin_reject',
    title: '禅院家的嘲讽',
    icon: '😤',
    narrative: '禅院家的人找到了你，不是为了接纳，而是为了羞辱："没有咒力的废物，也配姓禅院？"他们的轻蔑像刀子。但你握紧了拳头——天与咒缚的力量，在你体内蛰伏。',
    minAge: 12, maxAge: 30, phases: ['childhood', 'school', 'career'], weight: 6,
    tags: ['origin_story'], requireTags: ['clan_outcast'], excludeTags: ['of_zenin_done'],
    grantTags: ['of_zenin_done'],
    choices: [
      { id: 'a', text: '用拳头回应嘲讽', attrEffects: { physical: 10, mental: 5 }, narrative: '你没有说话，只是挥出了一拳。那一拳的力量，让所有嘲讽者闭了嘴。肉体，就是你的咒术。', tags: ['proven_warrior'] },
      { id: 'b', text: '默默离开，用实力说话', attrEffects: { mental: 8, physical: 5 }, narrative: '你转身离开，没有回头。总有一天，你会强到让他们仰望。这份屈辱，是你前进的燃料。', tags: ['silent_resolve'] },
    ],
  },
  {
    id: 'of_star_fate',
    title: '星浆体的宿命',
    icon: '⭐',
    narrative: '有人告诉你真相：作为星浆体血脉，你注定要与天元大人同化——也就是说，注定要"消失"。这个命运从你出生起就已写好。你……接受吗？',
    minAge: 14, maxAge: 30, phases: ['school', 'career'], weight: 5,
    tags: ['origin_story', 'critical'], requireTags: ['star_plasma'], excludeTags: ['of_star_done'],
    grantTags: ['of_star_done'],
    choices: [
      { id: 'a', text: '反抗命运，我要活下去', attrEffects: { mental: 12, cursedEnergy: 8 }, narrative: '"去他的宿命！我的人生由我自己决定！"你发誓要打破这个诅咒。这份反抗，将改变整个咒术界。', tags: ['defy_fate'] },
      { id: 'b', text: '寻找替代同化的方法', attrEffects: { technique: 10, mental: 6 }, narrative: '你不接受，但也不莽撞。你开始研究古籍，寻找既能保全自己、又不影响天元的方法。智慧，是你最大的武器。', tags: ['seeker_of_truth'] },
    ],
  },
]

// ============ 阵营必打战役 ============
export const factionBattleEvents: GameEvent[] = [
  {
    id: 'fb_culling_game',
    title: '死灭回游',
    icon: '🎪',
    narrative: '羂索发动了"死灭回游"——全日本的术师被卷入结界，被迫互相厮杀。规则残酷：不杀人，就会被剥夺咒力而死。作为高专的一员，你别无选择，只能踏入这个地狱。',
    minAge: 18, maxAge: 45, phases: ['career', 'legend'], weight: 8,
    tags: ['canon_battle', 'major_battle'], requireFaction: ['tokyo_school', 'kyoto_school', 'freelance'],
    requireTechnique: true, excludeTags: ['culling_done'],
    battle: {
      enemyName: '回游泳者', enemyIcon: '🎭', enemyTitle: '死灭回游·觉醒术师', difficulty: 70, rounds: 2,
      intro: '结界内，一个被羂索改造的觉醒术师盯上了你。"抱歉，为了活下去，我必须杀了你。"他/她的眼里满是疯狂与绝望。这场战斗，没有正义，只有生存。',
      rewards: { attrs: { cursedEnergy: 10, mental: 8, technique: 6 }, tags: ['culling_done', 'culling_survivor'] },
      loseEffects: { attrs: { mental: -8 }, injury: 'heavy', deathChance: 0.2 },
      drawEffects: { injury: 'moderate' },
      winNarrative: '你赢了。对手倒下前，露出了释然的表情："这样……也好。"你握紧拳头——这场该死的游戏，你必须终结它。',
      loseNarrative: '你被击败了，靠着同伴的掩护才勉强逃生。死灭回游的残酷，深深烙印在你心里。',
      drawNarrative: '你和对手两败俱伤，最终各自退去。在这场游戏里，没有真正的赢家。',
    },
  },
  {
    id: 'fb_shibuya_frontline',
    title: '涩谷事变·前线',
    icon: '🌆',
    narrative: '10月31日，涩谷。"帐"降下，特级咒灵倾巢而出。作为高专的术师，你被派往前线。地铁站里挤满了被困的平民，而咒灵正在逼近。这是你经历过最惨烈的战斗。',
    minAge: 16, maxAge: 35, phases: ['school', 'career'], weight: 8,
    tags: ['canon_battle', 'major_battle'], requireFaction: ['tokyo_school', 'kyoto_school'],
    requireTechnique: true, excludeTags: ['shibuya_fought'],
    battle: {
      enemyName: '改造人军团', enemyIcon: '🧟', enemyTitle: '羂索的造物', difficulty: 62, rounds: 2,
      intro: '羂索用无为转变改造的平民，变成了没有意识的怪物，潮水般涌来。你必须在保护平民的同时，杀出一条血路。',
      rewards: { attrs: { cursedEnergy: 8, physical: 6, mental: 6 }, tags: ['shibuya_fought', 'shibuya_veteran'] },
      loseEffects: { attrs: { mental: -10 }, injury: 'heavy', deathChance: 0.15 },
      drawEffects: { injury: 'moderate' },
      winNarrative: '你杀穿了改造人军团，救下了数十名平民。当你浑身是血地走出地铁站时，幸存者的掌声让你热泪盈眶。',
      loseNarrative: '改造人太多了，你被淹没在人潮中，重伤倒地。是同伴把你拖了出来。涩谷，成了你的噩梦。',
      drawNarrative: '你拼尽全力，勉强守住了一条通道。伤亡惨重，但你没有退缩。',
    },
  },
  {
    id: 'fb_final_war',
    title: '新宿决战·总攻',
    icon: '⚔️',
    narrative: '最终决战在新宿打响。全咒术界的力量集结，对抗诅咒之王两面宿傩。这是关乎人类存亡的一战。作为高专的精英，你站在了最前线。',
    minAge: 20, maxAge: 60, phases: ['legend'], weight: 8,
    tags: ['canon_battle', 'final_battle'], requireFaction: ['tokyo_school', 'kyoto_school', 'freelance'],
    requireTechnique: true, excludeTags: ['final_war_done'],
    battle: {
      enemyName: '宿傩的眷属', enemyIcon: '👹', enemyTitle: '诅咒之王的先锋', difficulty: 85, rounds: 3,
      intro: '宿傩的眷属挡住了去路。要抵达诅咒之王，你必须先跨过这道坎。"为了所有人——"你深吸一口气，冲了上去。',
      rewards: { attrs: { cursedEnergy: 12, technique: 10, mental: 10 }, tags: ['final_war_done', 'war_hero'] },
      loseEffects: { attrs: { mental: -10 }, injury: 'critical', deathChance: 0.3 },
      drawEffects: { injury: 'heavy' },
      winNarrative: '你击败了宿傩的眷属，为最终决战打开了通路。你的英勇，将被载入咒术史册。',
      loseNarrative: '眷属太强了，你倒在了通往宿傩的路上。但你的牺牲，为同伴争取了时间。',
      drawNarrative: '你与眷属两败俱伤，最终它退去了。你拖着残躯，继续向前。',
    },
  },
]

// ============ 好感度后续事件 ============
export const affinityEvents: GameEvent[] = [
  {
    id: 'af_yuji_bond',
    title: '与虎杖的约定',
    icon: '🌅',
    narrative: '任务结束后，虎杖拉着你坐在天台上。"我一直没告诉你，"他看着夕阳，"我爷爷临终前让我去「拯救他人」。有时候我也会迷茫……但和你并肩作战，我觉得自己没那么孤单了。"他向你伸出手："以后也要一起啊。"',
    minAge: 15, maxAge: 40, phases: ['school', 'career', 'legend'], weight: 5,
    tags: ['bond_deep'], requireChars: ['yuji'], requireAffinity: { charId: 'yuji', min: 55 }, excludeTags: ['af_yuji_done'],
    grantTags: ['af_yuji_done'],
    attrEffects: { mental: 8, luck: 5 },
    choices: [
      { id: 'a', text: '握住他的手，许下约定', attrEffects: { mental: 6 }, relationEffects: [{ charId: 'yuji', delta: 15 }], narrative: '你握住了他的手。"一言为定。"夕阳下，两个少年的约定，比任何咒术都要坚固。', tags: ['yuji_promise'] },
    ],
  },
  {
    id: 'af_megumi_bond',
    title: '伏黑惠的深夜长谈',
    icon: '🌙',
    narrative: '深夜，你发现惠一个人坐在院子里发呆。难得地，他主动开口："我姐姐……津美菜，她因为我被卷入了诅咒。我一直很自责。"这个从不示弱的少年，第一次向你展露了脆弱。',
    minAge: 15, maxAge: 40, phases: ['school', 'career', 'legend'], weight: 5,
    tags: ['bond_deep'], requireChars: ['megumi'], requireAffinity: { charId: 'megumi', min: 55 }, excludeTags: ['af_megumi_done'],
    grantTags: ['af_megumi_done'],
    attrEffects: { mental: 8 },
    choices: [
      { id: 'a', text: '安静地陪着他', attrEffects: { mental: 6 }, relationEffects: [{ charId: 'megumi', delta: 15 }], narrative: '你没有说安慰的话，只是坐在他身边。有时候，陪伴比言语更有力量。良久，他轻声说了句："谢谢。"', tags: ['megumi_trust'] },
    ],
  },
  {
    id: 'af_gojo_bond',
    title: '五条悟的认可',
    icon: '🕶️',
    narrative: '五条悟罕见地收起了玩世不恭的表情，认真地看着你："你知道吗，我一直想改变这个腐朽的咒术界。一个人太累了……但看到你，我觉得未来有希望了。"他拍了拍你的肩："变强吧，然后和我一起，改变这个世界。"',
    minAge: 16, maxAge: 40, phases: ['school', 'career', 'legend'], weight: 4,
    tags: ['bond_deep'], requireChars: ['gojo'], requireAffinity: { charId: 'gojo', min: 50 }, excludeTags: ['af_gojo_done'],
    grantTags: ['af_gojo_done'],
    attrEffects: { cursedEnergy: 8, mental: 8, technique: 5 },
    choices: [
      { id: 'a', text: '郑重地接受这份期望', attrEffects: { mental: 8 }, relationEffects: [{ charId: 'gojo', delta: 15 }], narrative: '"我不会让您失望的。"你郑重地点头。最强的认可，是你最珍贵的勋章。', tags: ['gojo_successor'] },
    ],
  },
]

// ============ 更多随机事件（丰富日常） ============
export const extraRandomEvents: GameEvent[] = [
  {
    id: 'er_street_food',
    title: '任务后的拉面',
    icon: '🍜',
    narrative: '任务结束后，你路过一家拉面店。热气腾腾的汤底，是疲惫一天后最好的慰藉。老板看你满身伤痕，多加了一个蛋："年轻人，辛苦了。"',
    minAge: 12, maxAge: 60, phases: ['childhood', 'school', 'career', 'legend'], weight: 4,
    tags: ['daily_life'], repeatable: true,
    attrEffects: { mental: 4, luck: 2 },
  },
  {
    id: 'er_movie_night',
    title: '电影之夜',
    icon: '🎬',
    narrative: '难得的休息日，你和同伴们窝在宿舍看电影。虎杖对剧情大呼小叫，惠在一旁默默吐槽，野蔷薇则为男主角尖叫。这样的平凡时光，在咒术师的生活里弥足珍贵。',
    minAge: 15, maxAge: 35, phases: ['school', 'career'], weight: 4,
    tags: ['daily_life'], repeatable: true,
    attrEffects: { mental: 5, luck: 3 },
  },
  {
    id: 'er_merchant',
    title: '神秘商人',
    icon: '🎒',
    narrative: '一个神神秘秘的商人拦住了你，兜售着各种来路不明的咒具和药剂。"保证正品，假一赔十！"他的笑容里透着狡黠。你有点心动，又有点怀疑。',
    minAge: 14, maxAge: 60, phases: ['school', 'career', 'legend'], weight: 4,
    tags: ['encounter'], repeatable: true,
    choices: [
      { id: 'a', text: '买一瓶"咒力强化药剂"', attrEffects: { cursedEnergy: 6, luck: -3 }, narrative: '你买了一瓶。喝下去后，咒力确实短暂增强了——虽然味道像是在喝臭水沟。值了？大概吧。' },
      { id: 'b', text: '警惕地离开', attrEffects: { mental: 3 }, narrative: '你摇摇头走了。"切，不识货。"商人在身后嘟囔。也许你错过了什么，也许你避开了一个坑。' },
    ],
  },
  {
    id: 'er_nightmare',
    title: '诅咒的噩梦',
    icon: '😱',
    narrative: '你又做噩梦了。梦里全是死去的同伴、流血的场景、还有那些你没能救下的人。你惊醒时浑身冷汗。咒术师的创伤后应激，是无人提及的隐痛。',
    minAge: 14, maxAge: 60, phases: ['school', 'career', 'legend'], weight: 4,
    tags: ['reflection'], repeatable: true,
    choices: [
      { id: 'a', text: '直面创伤，自我调节', attrEffects: { mental: 6 }, narrative: '你深呼吸，告诉自己：那些牺牲不会白费。你带着伤痛继续前行，因为这就是你选择的路。' },
      { id: 'b', text: '找同伴倾诉', attrEffects: { mental: 5, luck: 2 }, narrative: '你敲开了同伴的门，把噩梦说了出来。他/她安静地听完，递给你一杯热茶。被理解的感觉，让你好受多了。' },
    ],
  },
  {
    id: 'er_wandering_curse',
    title: '路边的低级咒灵',
    icon: '👻',
    narrative: '回家的路上，你发现一只低级咒灵在骚扰路人。对现在的你来说，这不过是举手之劳。你随手祓除了它。路人们毫无察觉——他们永远不知道，自己刚刚被守护了。',
    minAge: 12, maxAge: 60, phases: ['childhood', 'school', 'career', 'legend'], weight: 5,
    tags: ['daily_battle'], repeatable: true, requireTechnique: true,
    attrEffects: { cursedEnergy: 3, physical: 2, mental: 2 },
  },
  {
    id: 'er_library',
    title: '高专图书馆',
    icon: '📚',
    narrative: '你在高专的图书馆里翻到了一本古籍，上面记载着失传的咒法理论。虽然晦涩难懂，但你隐约触摸到了咒术更深层的奥秘。知识的积累，终将在某一天开花结果。',
    minAge: 14, maxAge: 50, phases: ['school', 'career', 'legend'], weight: 4,
    tags: ['study'], repeatable: true,
    attrEffects: { technique: 5, cursedEnergy: 2 },
  },
]
