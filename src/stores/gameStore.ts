import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { OwnedEngineer } from '../types/game'
import { ENGINEER_DEFINITIONS } from '../constants/engineers'
import { UPGRADE_DEFINITIONS } from '../constants/upgrades'

const SAVE_KEY = 'type-king-save'
const AUTO_TICK_INTERVAL_MS = 100

export const useGameStore = defineStore('game', () => {
  const totalTypes = ref(0)
  const engineers = ref<OwnedEngineer[]>(
    ENGINEER_DEFINITIONS.map((def) => ({ definitionId: def.id, count: 0 }))
  )
  const purchasedUpgradeIds = ref<string[]>([])

  const globalMultiplier = computed(() => {
    let multiplier = 1
    for (const upgradeId of purchasedUpgradeIds.value) {
      const upgrade = UPGRADE_DEFINITIONS.find((u) => u.id === upgradeId)
      if (upgrade) {
        multiplier *= upgrade.multiplier
      }
    }
    return multiplier
  })

  const typesPerSecond = computed(() => {
    let tps = 0
    for (const owned of engineers.value) {
      const def = ENGINEER_DEFINITIONS.find((d) => d.id === owned.definitionId)
      if (def) {
        tps += def.typesPerSecond * owned.count
      }
    }
    return tps * globalMultiplier.value
  })

  function addTypes(count: number): void {
    totalTypes.value += count * globalMultiplier.value
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

  function purchaseUpgrade(upgradeId: string): boolean {
    if (purchasedUpgradeIds.value.includes(upgradeId)) return false

    const upgrade = UPGRADE_DEFINITIONS.find((u) => u.id === upgradeId)
    if (!upgrade || totalTypes.value < upgrade.cost) return false

    totalTypes.value -= upgrade.cost
    purchasedUpgradeIds.value.push(upgradeId)
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
      purchasedUpgradeIds: purchasedUpgradeIds.value,
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
      purchasedUpgradeIds.value = saveData.purchasedUpgradeIds ?? []

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
    purchasedUpgradeIds,
    globalMultiplier,
    typesPerSecond,
    addTypes,
    getEngineerCost,
    hireEngineer,
    purchaseUpgrade,
    startAutoTick,
    stopAutoTick,
    saveGame,
    loadGame,
  }
})
