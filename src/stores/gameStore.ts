import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { OwnedEngineer, OwnedUpgrade } from '../types/game'
import { ENGINEER_DEFINITIONS } from '../constants/engineers'
import { UPGRADE_DEFINITIONS } from '../constants/upgrades'

const SAVE_KEY = 'type-king-save'
const AUTO_TICK_INTERVAL_MS = 100

/**
 * エンジニアの桁ボーナス倍率を算出
 * 10人ごとに+10%、100人で+30%、1000人で+60%...
 * 緩やかなボーナスにして急激なインフレを防ぐ
 */
function calcEngineerDigitBonus(count: number): number {
  if (count < 10) return 1
  const digits = Math.floor(Math.log10(count))
  return 1 + digits * 0.3
}

export const useGameStore = defineStore('game', () => {
  const totalTypes = ref(0)
  const engineers = ref<OwnedEngineer[]>(
    ENGINEER_DEFINITIONS.map((def) => ({ definitionId: def.id, count: 0 }))
  )
  const upgrades = ref<OwnedUpgrade[]>(
    UPGRADE_DEFINITIONS.map((def) => ({ definitionId: def.id, level: 0 }))
  )

  // プレイヤーのタイピング倍率（アップグレードで加算式に強化）
  const typingMultiplier = computed(() => {
    let bonus = 0
    for (const owned of upgrades.value) {
      if (owned.level === 0) continue
      const def = UPGRADE_DEFINITIONS.find((d) => d.id === owned.definitionId)
      if (def) {
        bonus += def.bonusPerLevel * owned.level
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

  function addTypes(count: number): void {
    totalTypes.value += count * typingMultiplier.value
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
    return Math.floor(def.baseCost * Math.pow(def.costMultiplier, owned.level))
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
      const increment = typesPerSecond.value / (1000 / AUTO_TICK_INTERVAL_MS)
      if (increment > 0) {
        totalTypes.value += increment
      }
    }, AUTO_TICK_INTERVAL_MS)
  }

  function stopAutoTick(): void {
    if (tickInterval) {
      clearInterval(tickInterval)
      tickInterval = null
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

      // 旧セーブデータからの移行（purchasedUpgradeIds形式）
      if (Array.isArray(saveData.purchasedUpgradeIds)) {
        for (const upgradeId of saveData.purchasedUpgradeIds) {
          const owned = upgrades.value.find(
            (u) => u.definitionId === upgradeId
          )
          if (owned && owned.level === 0) {
            owned.level = 1
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
    typesPerSecond,
    addTypes,
    getEngineerCost,
    hireEngineer,
    getUpgradeCost,
    purchaseUpgrade,
    startAutoTick,
    stopAutoTick,
    saveGame,
    loadGame,
  }
})
