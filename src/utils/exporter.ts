import { GameState, ExportFormat } from '../types'
import { PHASE_LABELS, ATTR_LABELS, INJURY_LABELS, GENDER_LABELS, APPEARANCE_LABELS } from '../game/engine'
import { ORIGINS } from '../data/origins'

const FACTION_NAMES: Record<string, string> = {
  tokyo_school: '东京咒术高专',
  kyoto_school: '京都咒术高专',
  freelance: '自由术师',
  curse_user: '诅咒师',
  neutral: '无所属',
}

/** 导出为 JSON */
export function exportAsJSON(state: GameState): string {
  const origin = ORIGINS.find(o => o.id === state.origin)
  return JSON.stringify({
    meta: {
      game: '咒术回战·人生轮盘',
      version: state.version,
      exportedAt: new Date().toISOString(),
      gameId: state.gameId,
    },
    player: {
      name: state.playerName,
      gender: state.gender ? GENDER_LABELS[state.gender] : null,
      appearance: state.appearance ? APPEARANCE_LABELS[state.appearance] : null,
      origin: origin ? { id: origin.id, label: origin.label } : null,
      faction: state.faction ? FACTION_NAMES[state.faction] : null,
      technique: state.technique ? {
        name: state.technique.name,
        category: state.technique.category,
        domain: state.technique.domainName || null,
      } : null,
      domainUnlocked: state.domainUnlocked,
      finalAge: state.age,
      alive: state.alive,
      ending: state.ending ? {
        title: state.ending.title,
        grade: state.ending.grade,
        description: state.ending.description,
      } : null,
    },
    finalAttributes: state.attributes,
    injury: INJURY_LABELS[state.injury],
    stateTags: state.tags,
    characters: state.characters.map(c => ({
      name: c.name, title: c.title, alive: c.alive,
      relation: c.relation, affinity: c.affinity,
    })),
    timeline: state.timeline.map(t => ({
      turn: t.turn, age: t.age, phase: t.phaseLabel,
      type: t.eventType, title: t.title,
      description: t.description,
      chosenOption: t.chosenOption || null,
      wheelUsed: t.wheelUsed,
      attrSnapshot: t.attrSnapshot,
    })),
  }, null, 2)
}

/** 导出为 Markdown */
export function exportAsMarkdown(state: GameState): string {
  const origin = ORIGINS.find(o => o.id === state.origin)
  const lines: string[] = []

  lines.push(`# 咒术回战·人生轮盘 —— ${state.playerName} 的一生`)
  lines.push('')
  lines.push(`> 导出时间：${new Date().toLocaleString('zh-CN')}`)
  lines.push('')
  lines.push('## 角色总览')
  lines.push('')
  lines.push(`| 项目 | 内容 |`)
  lines.push(`|------|------|`)
  lines.push(`| 姓名 | ${state.playerName} |`)
  lines.push(`| 性别 | ${state.gender ? GENDER_LABELS[state.gender] : '未知'} |`)
  lines.push(`| 相貌 | ${state.appearance ? `${APPEARANCE_LABELS[state.appearance]}（${'★'.repeat(state.appearance)}）` : '未知'} |`)
  lines.push(`| 出身 | ${origin ? `${origin.icon} ${origin.label}` : '未知'} |`)
  lines.push(`| 阵营 | ${state.faction ? FACTION_NAMES[state.faction] : '无'} |`)
  lines.push(`| 术式 | ${state.technique ? `${state.technique.icon} ${state.technique.name}` : '无'} |`)
  lines.push(`| 领域 | ${state.domainUnlocked && state.technique?.domainName ? state.technique.domainName : '未解锁'} |`)
  lines.push(`| 终年 | ${state.age}岁 |`)
  lines.push(`| 状态 | ${state.alive ? '存活' : '死亡'} |`)
  lines.push(`| 伤势 | ${INJURY_LABELS[state.injury]} |`)
  lines.push('')

  lines.push('## 最终属性')
  lines.push('')
  for (const [key, label] of Object.entries(ATTR_LABELS)) {
    const val = state.attributes[key as keyof typeof state.attributes]
    lines.push(`- **${label}**: ${val}/100 ${'█'.repeat(Math.floor(val / 10))}${'░'.repeat(10 - Math.floor(val / 10))}`)
  }
  lines.push('')

  if (state.ending) {
    lines.push('## 结局')
    lines.push('')
    lines.push(`### ${state.ending.icon} ${state.ending.title}`)
    lines.push('')
    lines.push(`**术师等级**: ${state.ending.grade}`)
    lines.push('')
    lines.push(state.ending.description)
    lines.push('')
  }

  lines.push('## 人物关系')
  lines.push('')
  lines.push('| 角色 | 身份 | 关系 | 好感度 | 状态 |')
  lines.push('|------|------|------|--------|------|')
  for (const c of state.characters) {
    const relNames: Record<string, string> = {
      ally: '盟友', rival: '劲敌', mentor: '导师', enemy: '敌人', friend: '友人', family: '家族',
    }
    lines.push(`| ${c.name} | ${c.title} | ${relNames[c.relation]} | ${c.affinity} | ${c.alive ? '存活' : '死亡'} |`)
  }
  lines.push('')

  lines.push('## 人生时间线')
  lines.push('')
  let currentPhase = ''
  for (const t of state.timeline) {
    if (t.phaseLabel !== currentPhase) {
      currentPhase = t.phaseLabel
      lines.push(`### ${currentPhase}`)
      lines.push('')
    }
    const typeIcons: Record<string, string> = {
      origin: '🎲', technique: '✨', event: '📜', choice: '🔀',
      injury: '🩸', stage_change: '⏩', char_death: '⚰️', ending: '🏁',
    }
    lines.push(`- **${t.age}岁** ${typeIcons[t.eventType] || '📌'} **${t.title}**`)
    lines.push(`  ${t.description}`)
    if (t.chosenOption) {
      lines.push(`  > 你的选择：${t.chosenOption}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}

/** 生成 AI 总结提示词 */
export function exportAsAIPrompt(state: GameState): string {
  const origin = ORIGINS.find(o => o.id === state.origin)
  const md = exportAsMarkdown(state)

  return `你是一位精通《咒术回战》世界观的叙事大师。以下是我通过"咒术回战·人生轮盘"游戏度过的完整一生记录。

请你以芥见下下（咒术回战作者）的叙事风格，将我的人生改写为一篇精彩的短篇小说/人物传记。要求：
1. 保留所有关键事件和选择，但用更文学化的笔触重新演绎
2. 突出命运的无常与个人意志的对抗这一主题
3. 为我的角色设计一句标志性的台词/座右铭
4. 给出一个"咒术师档案卡"式的评价（等级、术式、威胁度、人物短评）
5. 如果有角色死亡，请写出有分量的告别场景
6. 结尾请给出"如果重来一次"的平行世界展望

以下是完整人生记录（Markdown格式）：

---
${md}
---

请开始你的创作。`
}

/** 统一导出入口 */
export function exportGame(state: GameState, format: ExportFormat): string {
  switch (format) {
    case 'json': return exportAsJSON(state)
    case 'markdown': return exportAsMarkdown(state)
    case 'ai-prompt': return exportAsAIPrompt(state)
  }
}

/** 下载文件 */
export function downloadExport(state: GameState, format: ExportFormat) {
  const content = exportGame(state, format)
  const ext = format === 'json' ? 'json' : 'md'
  const mime = format === 'json' ? 'application/json' : 'text/markdown'
  const blob = new Blob([content], { type: `${mime};charset=utf-8` })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `jjk_life_${state.playerName}_${new Date().toISOString().slice(0, 10)}.${ext}`
  a.click()
  URL.revokeObjectURL(url)
}

/** 复制到剪贴板 */
export async function copyToClipboard(state: GameState, format: ExportFormat): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(exportGame(state, format))
    return true
  } catch {
    return false
  }
}
