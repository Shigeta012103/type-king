import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { OwnedEngineer, OwnedUpgrade } from '../types/game'
import { ENGINEER_DEFINITIONS } from '../constants/engineers'
import {
  UPGRADE_DEFINITIONS,
  LEVEL_POWER_GROWTH,
  LEVEL_COST_GROWTH,
} from '../constants/upgrades'

const SAVE_KEY = 'type-king-save'
const AUTO_TICK_INTERVAL_MS = 100
const FEVER_INTERVAL_MS = 180_000
const FEVER_WARN_MS = 5_000
const FEVER_DURATION_MS = 10_000
const FEVER_MULTIPLIER = 5

/**
 * エンジニアの桁ボーナス倍率を算出
 * 10人ごとに+10%、100人で+30%、1000人で+60%...
 */
function calcEngineerDigitBonus(count: number): number {
  if (count < 10) return 1
  const digits = Math.floor(Math.log10(count))
  return 1 + digits * 0.3
}

/**
 * アップグレードのレベルLにおけるボーナスを算出
 * Lv.1: basePower, Lv.2: basePower * 2000, Lv.3: basePower * 2000^2...
 */
function calcLevelBonus(basePower: number, level: number): number {
  return basePower * Math.pow(LEVEL_POWER_GROWTH, level - 1)
}

/**
 * アップグレードの累計ボーナスを算出（Lv.1〜levelの合計）
 */
function calcTotalUpgradeBonus(basePower: number, level: number): number {
  if (level === 0) return 0
  if (level === 1) return basePower
  return basePower * (Math.pow(LEVEL_POWER_GROWTH, level) - 1) / (LEVEL_POWER_GROWTH - 1)
}

export const useGameStore = defineStore('game', () => {
  const totalTypes = ref(0)
  const engineers = ref<OwnedEngineer[]>(
    ENGINEER_DEFINITIONS.map((def) => ({ definitionId: def.id, count: 0 }))
  )
  const upgrades = ref<OwnedUpgrade[]>(
    UPGRADE_DEFINITIONS.map((def) => ({ definitionId: def.id, level: 0 }))
  )

  // フィーバー状態
  const isFeverActive = ref(false)
  const isFeverWarning = ref(false)
  const feverRemainingMs = ref(0)
  const nextFeverMs = ref(FEVER_INTERVAL_MS)

  // プレイヤーのタイピング倍率（各アップグレードの累計ボーナスの合算）
  const typingMultiplier = computed(() => {
    let bonus = 0
    for (const owned of upgrades.value) {
      if (owned.level === 0) continue
      const def = UPGRADE_DEFINITIONS.find((d) => d.id === owned.definitionId)
      if (def) {
        bonus += calcTotalUpgradeBonus(def.basePower, owned.level)
      }
    }
    return 1 + bonus
  })

  const typesPerSecond = computed(() => {
    let tps = 0
    for (const owned of engineers.value) {
      const def = ENGINEER_DEFINITIONS.find((d) => d.id === owned.definitionId)
      if (def && owned.count > 0) {
        const digitBonus = calcEngineerDigitBonus(owned.count)
        tps += def.typesPerSecond * owned.count * digitBonus
      }
    }
    return tps
  })

  const effectiveTypingMultiplier = computed(() => {
    const fever = isFeverActive.value ? FEVER_MULTIPLIER : 1
    return typingMultiplier.value * fever
  })

  function addTypes(count: number): void {
    totalTypes.value += count * effectiveTypingMultiplier.value
  }

  function getEngineerCost(definitionId: string): number {
    const def = ENGINEER_DEFINITIONS.find((d) => d.id === definitionId)
    const owned = engineers.value.find((e) => e.definitionId === definitionId)
    if (!def || !owned) return Infinity
    return Math.floor(def.baseCost * Math.pow(def.costMultiplier, owned.count))
  }

  function hireEngineer(definitionId: string): boolean {
    const cost = getEngineerCost(definitionId)
    if (totalTypes.value < cost) return false

    totalTypes.value -= cost
    const owned = engineers.value.find((e) => e.definitionId === definitionId)
    if (owned) {
      owned.count++
    }
    saveGame()
    return true
  }

  function getUpgradeCost(definitionId: string): number {
    const def = UPGRADE_DEFINITIONS.find((d) => d.id === definitionId)
    const owned = upgrades.value.find((u) => u.definitionId === definitionId)
    if (!def || !owned) return Infinity
    return Math.floor(def.baseCost * Math.pow(LEVEL_COST_GROWTH, owned.level))
  }

  function getUpgradeNextBonus(definitionId: string): number {
    const def = UPGRADE_DEFINITIONS.find((d) => d.id === definitionId)
    const owned = upgrades.value.find((u) => u.definitionId === definitionId)
    if (!def || !owned) return 0
    return calcLevelBonus(def.basePower, owned.level + 1)
  }

  function getUpgradeTotalBonus(definitionId: string): number {
    const def = UPGRADE_DEFINITIONS.find((d) => d.id === definitionId)
    const owned = upgrades.value.find((u) => u.definitionId === definitionId)
    if (!def || !owned) return 0
    return calcTotalUpgradeBonus(def.basePower, owned.level)
  }

  function purchaseUpgrade(definitionId: string): boolean {
    const cost = getUpgradeCost(definitionId)
    if (totalTypes.value < cost) return false

    totalTypes.value -= cost
    const owned = upgrades.value.find((u) => u.definitionId === definitionId)
    if (owned) {
      owned.level++
    }
    saveGame()
    return true
  }

  let tickInterval: ReturnType<typeof setInterval> | null = null

  function startAutoTick(): void {
    if (tickInterval) return
    tickInterval = setInterval(() => {
      // エンジニア自動タイプ
      const increment = typesPerSecond.value / (1000 / AUTO_TICK_INTERVAL_MS)
      if (increment > 0) {
        totalTypes.value += increment
      }

      // フィーバータイマー更新
      updateFeverTimer(AUTO_TICK_INTERVAL_MS)
    }, AUTO_TICK_INTERVAL_MS)
  }

  function stopAutoTick(): void {
    if (tickInterval) {
      clearInterval(tickInterval)
      tickInterval = null
    }
  }

  function updateFeverTimer(elapsedMs: number): void {
    if (isFeverActive.value) {
      feverRemainingMs.value = Math.max(0, feverRemainingMs.value - elapsedMs)
      if (feverRemainingMs.value <= 0) {
        isFeverActive.value = false
        nextFeverMs.value = FEVER_INTERVAL_MS
      }
      return
    }

    nextFeverMs.value = Math.max(0, nextFeverMs.value - elapsedMs)

    isFeverWarning.value = !isFeverActive.value && nextFeverMs.value <= FEVER_WARN_MS

    if (nextFeverMs.value <= 0) {
      isFeverActive.value = true
      isFeverWarning.value = false
      feverRemainingMs.value = FEVER_DURATION_MS
    }
  }

  function saveGame(): void {
    const saveData = {
      totalTypes: totalTypes.value,
      engineers: engineers.value,
      upgrades: upgrades.value,
      savedAt: Date.now(),
    }
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(saveData))
    } catch {
      // localStorage unavailable
    }
  }

  function loadGame(): void {
    try {
      const raw = localStorage.getItem(SAVE_KEY)
      if (!raw) return

      const saveData = JSON.parse(raw)
      totalTypes.value = saveData.totalTypes ?? 0

      if (Array.isArray(saveData.engineers)) {
        for (const saved of saveData.engineers) {
          const owned = engineers.value.find(
            (e) => e.definitionId === saved.definitionId
          )
          if (owned) {
            owned.count = saved.count ?? 0
          }
        }
      }

      if (Array.isArray(saveData.upgrades)) {
        for (const saved of saveData.upgrades) {
          const owned = upgrades.value.find(
            (u) => u.definitionId === saved.definitionId
          )
          if (owned) {
            owned.level = saved.level ?? 0
          }
        }
      }

      // オフライン中の自動タイプ分を加算
      if (saveData.savedAt) {
        const elapsedSeconds = (Date.now() - saveData.savedAt) / 1000
        const offlineGain = typesPerSecond.value * elapsedSeconds
        if (offlineGain > 0) {
          totalTypes.value += offlineGain
        }
      }
    } catch {
      // parse error
    }
  }

  // 定期セーブ
  setInterval(saveGame, 30000)

  return {
    totalTypes,
    engineers,
    upgrades,
    typingMultiplier,
    effectiveTypingMultiplier,
    typesPerSecond,
    isFeverActive,
    isFeverWarning,
    feverRemainingMs,
    nextFeverMs,
    addTypes,
    getEngineerCost,
    hireEngineer,
    getUpgradeCost,
    getUpgradeNextBonus,
    getUpgradeTotalBonus,
    purchaseUpgrade,
    startAutoTick,
    stopAutoTick,
    saveGame,
    loadGame,
  }
})
