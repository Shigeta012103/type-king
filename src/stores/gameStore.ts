import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { OwnedEngineer, OwnedUpgrade, OwnedFeverUpgrade } from '../types/game'
import { ENGINEER_DEFINITIONS } from '../constants/engineers'
import {
  UPGRADE_DEFINITIONS,
  LEVEL_POWER_GROWTH,
  LEVEL_COST_GROWTH,
} from '../constants/upgrades'
import { FEVER_UPGRADE_DEFINITIONS } from '../constants/feverUpgrades'

const SAVE_KEY = 'type-king-save'
const AUTO_TICK_INTERVAL_MS = 100
const IPO_COST = 1_000_000_000
const BASE_FEVER_INTERVAL_MS = 60_000
const BASE_FEVER_WARN_MS = 5_000
const BASE_FEVER_DURATION_MS = 30_000
const BASE_FEVER_MULTIPLIER = 3

function calcEngineerDigitBonus(count: number): number {
  if (count < 10) return 1
  const digits = Math.floor(Math.log10(count))
  return 1 + digits * 0.3
}

function calcLevelBonus(basePower: number, level: number): number {
  return basePower * Math.pow(LEVEL_POWER_GROWTH, level - 1)
}

function calcTotalUpgradeBonus(basePower: number, level: number): number {
  if (level === 0) return 0
  if (level === 1) return basePower
  return basePower * (Math.pow(LEVEL_POWER_GROWTH, level) - 1) / (LEVEL_POWER_GROWTH - 1)
}

export const useGameStore = defineStore('game', () => {
  const totalTypes = ref(0)
  const isIpoed = ref(false)

  const engineers = ref<OwnedEngineer[]>(
    ENGINEER_DEFINITIONS.map((def) => ({ definitionId: def.id, count: 0 }))
  )
  const upgrades = ref<OwnedUpgrade[]>(
    UPGRADE_DEFINITIONS.map((def) => ({ definitionId: def.id, level: 0 }))
  )
  const feverUpgrades = ref<OwnedFeverUpgrade[]>(
    FEVER_UPGRADE_DEFINITIONS.map((def) => ({ definitionId: def.id, level: 0 }))
  )

  // フィーバー状態
  const isFeverActive = ref(false)
  const isFeverWarning = ref(false)
  const feverRemainingMs = ref(0)
  const nextFeverMs = ref(BASE_FEVER_INTERVAL_MS)

  // フィーバーパラメータ（アップグレードで変動）
  const feverBoostLevel = computed(() =>
    feverUpgrades.value.find((u) => u.definitionId === 'fever-boost')?.level ?? 0
  )
  const feverExtendLevel = computed(() =>
    feverUpgrades.value.find((u) => u.definitionId === 'fever-extend')?.level ?? 0
  )
  const feverCooldownLevel = computed(() =>
    feverUpgrades.value.find((u) => u.definitionId === 'fever-cooldown')?.level ?? 0
  )
  const feverSyncLevel = computed(() =>
    feverUpgrades.value.find((u) => u.definitionId === 'fever-sync')?.level ?? 0
  )

  const MIN_FEVER_COOLDOWN_MS = 15_000

  const feverMultiplier = computed(() =>
    BASE_FEVER_MULTIPLIER + feverBoostLevel.value
  )
  const feverDurationMs = computed(() =>
    BASE_FEVER_DURATION_MS + feverExtendLevel.value * 5000
  )
  const feverCooldownMs = computed(() =>
    Math.max(MIN_FEVER_COOLDOWN_MS, BASE_FEVER_INTERVAL_MS - feverCooldownLevel.value * 5000)
  )
  const feverAutoRate = computed(() =>
    Math.min(feverSyncLevel.value * 0.5, 3)
  )

  // タイピング倍率
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

  const effectiveTypingMultiplier = computed(() => {
    const fever = isFeverActive.value ? feverMultiplier.value : 1
    return typingMultiplier.value * fever
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

  const effectiveTpsMultiplier = computed(() => {
    if (!isFeverActive.value || feverAutoRate.value === 0) return 1
    return 1 + feverAutoRate.value
  })

  function addTypes(count: number): void {
    totalTypes.value += count * effectiveTypingMultiplier.value
  }

  // --- IPO ---
  const canIpo = computed(() => !isIpoed.value && totalTypes.value >= IPO_COST)

  function doIpo(): boolean {
    if (isIpoed.value || totalTypes.value < IPO_COST) return false
    totalTypes.value -= IPO_COST
    isIpoed.value = true
    saveGame()
    return true
  }

  // --- エンジニア ---
  function getEngineerCost(definitionId: string): number {
    const def = ENGINEER_DEFINITIONS.find((d) => d.id === definitionId)
    const owned = engineers.value.find((e) => e.definitionId === definitionId)
    if (!def || !owned) return Infinity
    return Math.floor(def.baseCost * Math.pow(def.costMultiplier, owned.count))
  }

  function hireEngineer(definitionId: string): boolean {
    const def = ENGINEER_DEFINITIONS.find((d) => d.id === definitionId)
    if (!def) return false
    if (def.requiresIpo && !isIpoed.value) return false
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

  // --- アップグレード ---
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
    const def = UPGRADE_DEFINITIONS.find((d) => d.id === definitionId)
    if (!def) return false
    if (def.requiresIpo && !isIpoed.value) return false
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

  // --- フィーバーアップグレード ---
  function getFeverUpgradeCost(definitionId: string): number {
    const def = FEVER_UPGRADE_DEFINITIONS.find((d) => d.id === definitionId)
    const owned = feverUpgrades.value.find((u) => u.definitionId === definitionId)
    if (!def || !owned) return Infinity
    return Math.floor(def.baseCost * Math.pow(def.costGrowth, owned.level))
  }

  function purchaseFeverUpgrade(definitionId: string): boolean {
    const cost = getFeverUpgradeCost(definitionId)
    if (totalTypes.value < cost) return false

    totalTypes.value -= cost
    const owned = feverUpgrades.value.find((u) => u.definitionId === definitionId)
    if (owned) {
      owned.level++
    }
    saveGame()
    return true
  }

  // --- ティック ---
  let tickInterval: ReturnType<typeof setInterval> | null = null
  let lastTickTime = 0

  function tick(): void {
    const now = performance.now()
    const elapsedMs = lastTickTime > 0 ? Math.min(now - lastTickTime, 60_000) : AUTO_TICK_INTERVAL_MS
    lastTickTime = now

    const autoMult = effectiveTpsMultiplier.value
    const increment = typesPerSecond.value * (elapsedMs / 1000) * autoMult
    if (increment > 0) {
      totalTypes.value += increment
    }

    updateFeverTimer(elapsedMs)
  }

  function onVisibilityChange(): void {
    if (document.visibilityState === 'visible') {
      tick()
    }
  }

  function startAutoTick(): void {
    if (tickInterval) return
    lastTickTime = performance.now()
    tickInterval = setInterval(tick, AUTO_TICK_INTERVAL_MS)
    document.addEventListener('visibilitychange', onVisibilityChange)
  }

  function stopAutoTick(): void {
    if (tickInterval) {
      clearInterval(tickInterval)
      tickInterval = null
    }
    document.removeEventListener('visibilitychange', onVisibilityChange)
  }

  function updateFeverTimer(elapsedMs: number): void {
    if (isFeverActive.value) {
      feverRemainingMs.value = Math.max(0, feverRemainingMs.value - elapsedMs)
      if (feverRemainingMs.value <= 0) {
        isFeverActive.value = false
        nextFeverMs.value = feverCooldownMs.value
      }
      return
    }

    nextFeverMs.value = Math.max(0, nextFeverMs.value - elapsedMs)
    isFeverWarning.value = !isFeverActive.value && nextFeverMs.value <= BASE_FEVER_WARN_MS

    if (nextFeverMs.value <= 0) {
      isFeverActive.value = true
      isFeverWarning.value = false
      feverRemainingMs.value = feverDurationMs.value
    }
  }

  // --- セーブ/ロード ---
  function saveGame(): void {
    const saveData = {
      totalTypes: totalTypes.value,
      isIpoed: isIpoed.value,
      engineers: engineers.value,
      upgrades: upgrades.value,
      feverUpgrades: feverUpgrades.value,
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
      isIpoed.value = saveData.isIpoed ?? false

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

      if (Array.isArray(saveData.feverUpgrades)) {
        for (const saved of saveData.feverUpgrades) {
          const owned = feverUpgrades.value.find(
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

  setInterval(saveGame, 30000)

  return {
    totalTypes,
    isIpoed,
    engineers,
    upgrades,
    feverUpgrades,
    typingMultiplier,
    effectiveTypingMultiplier,
    typesPerSecond,
    effectiveTpsMultiplier,
    isFeverActive,
    isFeverWarning,
    feverRemainingMs,
    feverMultiplier,
    feverDurationMs,
    feverCooldownMs,
    feverAutoRate,
    nextFeverMs,
    canIpo,
    doIpo,
    addTypes,
    getEngineerCost,
    hireEngineer,
    getUpgradeCost,
    getUpgradeNextBonus,
    getUpgradeTotalBonus,
    purchaseUpgrade,
    getFeverUpgradeCost,
    purchaseFeverUpgrade,
    startAutoTick,
    stopAutoTick,
    saveGame,
    loadGame,
  }
})
