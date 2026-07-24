import { GameState, SaveSlot } from '../types'
import { PHASE_LABELS } from '../game/engine'
import { ORIGINS } from '../data/origins'

const SAVE_KEY = 'jjk_roulette_saves'
const AUTOSAVE_KEY = 'jjk_roulette_autosave'
const MAX_SLOTS = 3

/** 自动保存 */
export function autoSave(state: GameState) {
  try {
    localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(state))
  } catch (e) {
    console.warn('自动保存失败', e)
  }
}

/** 读取自动存档 */
export function loadAutoSave(): GameState | null {
  try {
    const raw = localStorage.getItem(AUTOSAVE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

/** 清除自动存档 */
export function clearAutoSave() {
  localStorage.removeItem(AUTOSAVE_KEY)
}

/** 获取所有存档槽 */
export function getSaveSlots(): (SaveSlot | null)[] {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    const saves: SaveSlot[] = raw ? JSON.parse(raw) : []
    return Array.from({ length: MAX_SLOTS }, (_, i) =>
      saves.find(s => s.slotId === i) || null
    )
  } catch {
    return [null, null, null]
  }
}

/** 保存到指定槽位 */
export function saveToSlot(slotId: number, state: GameState): boolean {
  try {
    const saves = getSaveSlots().filter(Boolean) as SaveSlot[]
    const origin = ORIGINS.find(o => o.id === state.origin)
    const slot: SaveSlot = {
      slotId,
      savedAt: new Date().toISOString(),
      state,
      summary: `${state.playerName} · ${origin?.label || '?'} · ${PHASE_LABELS[state.phase]} · ${state.age}岁`,
    }
    const existing = saves.findIndex(s => s.slotId === slotId)
    if (existing >= 0) saves[existing] = slot
    else saves.push(slot)
    localStorage.setItem(SAVE_KEY, JSON.stringify(saves))
    return true
  } catch (e) {
    console.warn('保存失败', e)
    return false
  }
}

/** 从槽位读取 */
export function loadFromSlot(slotId: number): GameState | null {
  const slots = getSaveSlots()
  return slots[slotId]?.state || null
}

/** 删除槽位 */
export function deleteSlot(slotId: number) {
  try {
    const saves = getSaveSlots().filter(s => s && s.slotId !== slotId)
    localStorage.setItem(SAVE_KEY, JSON.stringify(saves))
  } catch (e) {
    console.warn('删除失败', e)
  }
}
