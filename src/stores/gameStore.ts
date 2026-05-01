import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { OwnedEngineer, OwnedUpgrade, OwnedFeverUpgrade, OwnedPrestigeUpgrade } from '../types/game'
import { ENGINEER_DEFINITIONS } from '../constants/engineers'
import { calcAllEngineerBonuses } from '../utils/engineerBonus'
import {
  UPGRADE_DEFINITIONS,
  LEVEL_POWER_GROWTH,
  LEVEL_COST_GROWTH,
} from '../constants/upgrades'
import { FEVER_UPGRADE_DEFINITIONS } from '../constants/feverUpgrades'
import { PRESTIGE_UPGRADE_DEFINITIONS } from '../constants/prestigeUpgrades'
import { calcPrestigeLevel } from '../utils/prestige'
import { formatNumber } from '../utils/formatNumber'

const SAVE_KEY = 'type-king-save'
const AUTO_TICK_INTERVAL_MS = 100
const IPO_COST = 1_000_000_000
const BASE_FEVER_INTERVAL_MS = 60_000
const BASE_FEVER_WARN_MS = 5_000
const BASE_FEVER_DURATION_MS = 30_000
const BASE_FEVER_MULTIPLIER = 3
const STARTING_FUND_AMOUNT = 10_000

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

  // --- 転生 ---
  const lifetimeTypesEarned = ref(0)
  const currentRunTypesEarned = ref(0)
  const prestigeCount = ref(0)
  const prestigeUpgrades = ref<OwnedPrestigeUpgrade[]>(
    PRESTIGE_UPGRADE_DEFINITIONS.map((def) => ({ definitionId: def.id, purchased: false }))
  )

  // 表示形式
  const useShortFormat = ref(false)

  function toggleFormat(): void {
    useShortFormat.value = !useShortFormat.value
  }

  function fmt(value: number): string {
    if (useShortFormat.value) return formatNumber(value)
    return Math.floor(value).toLocaleString()
  }

  // --- 転生ヘルパー ---
  function hasPrestigeUpgrade(upgradeId: string): boolean {
    return prestigeUpgrades.value.find((u) => u.definitionId === upgradeId)?.purchased ?? false
  }

  // --- 転生レベル & ポイント ---
  const prestigeLevel = computed(() => calcPrestigeLevel(lifetimeTypesEarned.value))
  const potentialPrestigeLevel = computed(() =>
    calcPrestigeLevel(lifetimeTypesEarned.value + currentRunTypesEarned.value)
  )
  const spentPrestigePoints = computed(() => {
    let spent = 0
    for (const owned of prestigeUpgrades.value) {
      if (!owned.purchased) continue
      const def = PRESTIGE_UPGRADE_DEFINITIONS.find((d) => d.id === owned.definitionId)
      if (def) spent += def.cost
    }
    return spent
  })
  const availablePrestigePoints = computed(() => prestigeLevel.value - spentPrestigePoints.value)
  const newPointsOnSell = computed(() => potentialPrestigeLevel.value - prestigeLevel.value)

  // --- 転生バフ ---
  const prestigeTypingBonus = computed(() => {
    let bonus = 0
    if (hasPrestigeUpgrade('typing-memory-1')) bonus += 0.10
    if (hasPrestigeUpgrade('typing-memory-2')) bonus += 0.25
    if (hasPrestigeUpgrade('click-combo')) bonus += 0.25
    if (hasPrestigeUpgrade('typing-mastery')) bonus += 1.00
    if (hasPrestigeUpgrade('click-mastery')) bonus += 2.00
    if (hasPrestigeUpgrade('click-divine')) bonus += 5.00
    return bonus
  })

  const prestigeTpsBonus = computed(() => {
    let bonus = 0
    if (hasPrestigeUpgrade('tps-memory-1')) bonus += 0.10
    if (hasPrestigeUpgrade('tps-memory-2')) bonus += 0.25
    if (hasPrestigeUpgrade('tps-mastery')) bonus += 1.00
    if (hasPrestigeUpgrade('tps-divine')) bonus += 5.00
    return bonus
  })

  const prestigePassiveRate = computed(() => {
    let rate = 0.01
    if (hasPrestigeUpgrade('prestige-resonance')) rate += 0.005
    if (hasPrestigeUpgrade('prestige-resonance-2')) rate += 0.015
    return rate
  })
  const prestigePassiveMultiplier = computed(() =>
    1 + prestigeLevel.value * prestigePassiveRate.value
  )

  const prestigeAllMultiplier = computed(() => {
    let mult = 1
    if (hasPrestigeUpgrade('hand-of-god')) mult *= 2
    if (hasPrestigeUpgrade('ascension')) mult *= 2
    if (hasPrestigeUpgrade('genesis')) mult *= 3
    if (hasPrestigeUpgrade('infinity')) mult *= 5
    return mult
  })

  const prestigeProductionMultiplier = computed(() =>
    prestigePassiveMultiplier.value * prestigeAllMultiplier.value
  )

  const prestigeCostMultiplier = computed(() => {
    let mult = 1
    if (hasPrestigeUpgrade('cost-efficiency')) mult *= 0.9
    if (hasPrestigeUpgrade('cost-mastery')) mult *= 0.8
    return mult
  })

  const prestigeOfflineMultiplier = computed(() => {
    let mult = 1
    if (hasPrestigeUpgrade('timekeeper')) mult *= 2
    if (hasPrestigeUpgrade('time-master')) mult *= 2.5
    return mult
  })

  const effectiveIpoCost = computed(() => {
    const base = hasPrestigeUpgrade('early-ipo') ? IPO_COST * 0.5 : IPO_COST
    return Math.floor(base * prestigeCostMultiplier.value)
  })

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
    BASE_FEVER_MULTIPLIER
    + feverBoostLevel.value
    + (hasPrestigeUpgrade('fever-echo') ? 1 : 0)
    + (hasPrestigeUpgrade('fever-eternal') ? 3 : 0)
  )
  const feverDurationMs = computed(() =>
    BASE_FEVER_DURATION_MS
    + feverExtendLevel.value * 5000
    + (hasPrestigeUpgrade('fever-sustain') ? 10_000 : 0)
    + (hasPrestigeUpgrade('fever-eternal') ? 20_000 : 0)
  )
  const feverCooldownMs = computed(() => {
    const base = Math.max(MIN_FEVER_COOLDOWN_MS, BASE_FEVER_INTERVAL_MS - feverCooldownLevel.value * 5000)
    const chainMultiplier = hasPrestigeUpgrade('fever-chain') ? 0.5 : 1
    return Math.max(MIN_FEVER_COOLDOWN_MS, Math.floor(base * chainMultiplier))
  })
  // シンクロ: Lv.1=33%, Lv.2=66%, Lv.3+=100% のフィーバー倍率を自動タイプに適用
  const feverSyncRate = computed(() =>
    Math.min(feverSyncLevel.value / 3, 1)
  )

  // タイピング倍率（転生バフ込み）
  const typingMultiplier = computed(() => {
    let bonus = 0
    for (const owned of upgrades.value) {
      if (owned.level === 0) continue
      const def = UPGRADE_DEFINITIONS.find((d) => d.id === owned.definitionId)
      if (def) {
        bonus += calcTotalUpgradeBonus(def.basePower, owned.level)
      }
    }
    return (1 + bonus) * (1 + prestigeTypingBonus.value)
  })

  const effectiveTypingMultiplier = computed(() => {
    let fever = 1
    if (isFeverActive.value) {
      fever = feverMultiplier.value
      if (hasPrestigeUpgrade('fever-frenzy')) fever += 1
    }
    return typingMultiplier.value * fever * prestigeProductionMultiplier.value
  })

  const engineerBonusSummary = computed(() => {
    let synergyMult = 1
    if (hasPrestigeUpgrade('synergy-amp')) synergyMult *= 2
    if (hasPrestigeUpgrade('synergy-supreme')) synergyMult *= 2

    let baseTpsMult = 1
    if (hasPrestigeUpgrade('engineer-elite')) baseTpsMult *= 1.5
    if (hasPrestigeUpgrade('engineer-master')) baseTpsMult *= 2

    return calcAllEngineerBonuses(engineers.value, {
      synergyMultiplier: synergyMult,
      baseTpsMultiplier: baseTpsMult,
      milestoneMultiplier: hasPrestigeUpgrade('milestone-awakening') ? 2 : 1,
    })
  })

  // TPS（転生バフ込み）
  const typesPerSecond = computed(() =>
    engineerBonusSummary.value.totalTps * (1 + prestigeTpsBonus.value) * prestigeProductionMultiplier.value
  )

  const effectiveTpsMultiplier = computed(() => {
    if (!isFeverActive.value || feverSyncRate.value === 0) return 1
    return 1 + (feverMultiplier.value - 1) * feverSyncRate.value
  })

  function addTypes(count: number): void {
    const earned = count * effectiveTypingMultiplier.value
    totalTypes.value += earned
    currentRunTypesEarned.value += earned
  }

  // --- IPO ---
  const canIpo = computed(() => !isIpoed.value && totalTypes.value >= effectiveIpoCost.value)

  function doIpo(): boolean {
    if (isIpoed.value || totalTypes.value < effectiveIpoCost.value) return false
    const cost = effectiveIpoCost.value
    totalTypes.value -= cost
    if (hasPrestigeUpgrade('ipo-refund')) {
      totalTypes.value += Math.floor(cost * 0.2)
    }
    isIpoed.value = true
    saveGame()
    return true
  }

  // --- エンジニア ---
  function getEngineerCost(definitionId: string): number {
    const def = ENGINEER_DEFINITIONS.find((d) => d.id === definitionId)
    const owned = engineers.value.find((e) => e.definitionId === definitionId)
    if (!def || !owned) return Infinity
    return Math.floor(def.baseCost * Math.pow(def.costMultiplier, owned.count) * prestigeCostMultiplier.value)
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
    return Math.floor(def.baseCost * Math.pow(LEVEL_COST_GROWTH, owned.level) * prestigeCostMultiplier.value)
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
    return Math.floor(def.baseCost * Math.pow(def.costGrowth, owned.level) * prestigeCostMultiplier.value)
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

  // --- 転生アクション ---
  function purchasePrestigeUpgrade(upgradeId: string): boolean {
    const def = PRESTIGE_UPGRADE_DEFINITIONS.find((d) => d.id === upgradeId)
    if (!def) return false
    const owned = prestigeUpgrades.value.find((u) => u.definitionId === upgradeId)
    if (!owned || owned.purchased) return false
    if (availablePrestigePoints.value < def.cost) return false

    owned.purchased = true
    saveGame()
    return true
  }

  function performPrestige(): boolean {
    if (potentialPrestigeLevel.value <= 0) return false

    // 現ランの稼ぎを通算に加算
    lifetimeTypesEarned.value += currentRunTypesEarned.value
    currentRunTypesEarned.value = 0

    // 初期資金（転生バフ）
    const startingTypes = hasPrestigeUpgrade('starting-fund') ? STARTING_FUND_AMOUNT : 0

    // ゲーム状態リセット
    totalTypes.value = startingTypes
    isIpoed.value = false
    engineers.value = ENGINEER_DEFINITIONS.map((def) => {
      let count = 0
      if (hasPrestigeUpgrade('starter-junior') && def.id === 'junior') count = 1
      if (hasPrestigeUpgrade('starter-pack') && (def.id === 'assistant' || def.id === 'junior' || def.id === 'middle')) {
        count = Math.max(count, 1)
      }
      return { definitionId: def.id, count }
    })
    upgrades.value = UPGRADE_DEFINITIONS.map((def) => ({ definitionId: def.id, level: 0 }))
    feverUpgrades.value = FEVER_UPGRADE_DEFINITIONS.map((def) => ({ definitionId: def.id, level: 0 }))

    // フィーバー状態リセット
    isFeverActive.value = false
    isFeverWarning.value = false
    feverRemainingMs.value = 0
    nextFeverMs.value = feverCooldownMs.value

    prestigeCount.value++

    saveGame()
    return true
  }

  // --- ティック ---
  let tickInterval: ReturnType<typeof setInterval> | null = null
  let lastTickTime = 0
  let hiddenAt = 0

  function tick(): void {
    const now = performance.now()
    const elapsedMs = lastTickTime > 0 ? Math.min(now - lastTickTime, 60_000) : AUTO_TICK_INTERVAL_MS
    lastTickTime = now

    const autoMult = effectiveTpsMultiplier.value
    const increment = typesPerSecond.value * (elapsedMs / 1000) * autoMult
    if (increment > 0) {
      totalTypes.value += increment
      currentRunTypesEarned.value += increment
    }

    updateFeverTimer(elapsedMs)
  }

  function onVisibilityChange(): void {
    if (document.visibilityState === 'hidden') {
      hiddenAt = Date.now()
      saveGame()
      return
    }

    // タブ復帰時: スリープ・バックグラウンド中の経過時間分を加算
    if (document.visibilityState === 'visible' && hiddenAt > 0) {
      const offlineMs = Date.now() - hiddenAt
      hiddenAt = 0

      if (offlineMs > 0 && typesPerSecond.value > 0) {
        const offlineGain = typesPerSecond.value * (offlineMs / 1000) * prestigeOfflineMultiplier.value
        totalTypes.value += offlineGain
        currentRunTypesEarned.value += offlineGain
      }

      // フィーバータイマーも経過分進める
      updateFeverTimer(offlineMs)

      // lastTickTime をリセットして次の通常tickで二重加算しない
      lastTickTime = performance.now()
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
      lifetimeTypesEarned: lifetimeTypesEarned.value,
      currentRunTypesEarned: currentRunTypesEarned.value,
      prestigeCount: prestigeCount.value,
      prestigeUpgrades: prestigeUpgrades.value,
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

      // 転生データ読み込み（旧セーブ互換: 未保存なら現在のtotalTypesを暫定値に）
      lifetimeTypesEarned.value = saveData.lifetimeTypesEarned ?? 0
      currentRunTypesEarned.value = saveData.currentRunTypesEarned ?? totalTypes.value
      prestigeCount.value = saveData.prestigeCount ?? 0

      if (Array.isArray(saveData.prestigeUpgrades)) {
        for (const saved of saveData.prestigeUpgrades) {
          const owned = prestigeUpgrades.value.find(
            (u) => u.definitionId === saved.definitionId
          )
          if (owned) {
            owned.purchased = saved.purchased ?? false
          }
        }
      }

      // オフライン中の自動タイプ分を加算
      if (saveData.savedAt) {
        const elapsedSeconds = (Date.now() - saveData.savedAt) / 1000
        const offlineGain = typesPerSecond.value * elapsedSeconds * prestigeOfflineMultiplier.value
        if (offlineGain > 0) {
          totalTypes.value += offlineGain
          currentRunTypesEarned.value += offlineGain
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
    useShortFormat,
    toggleFormat,
    fmt,
    engineers,
    upgrades,
    feverUpgrades,
    typingMultiplier,
    effectiveTypingMultiplier,
    typesPerSecond,
    engineerBonusSummary,
    effectiveTpsMultiplier,
    isFeverActive,
    isFeverWarning,
    feverRemainingMs,
    feverMultiplier,
    feverDurationMs,
    feverCooldownMs,
    feverSyncRate,
    nextFeverMs,
    canIpo,
    effectiveIpoCost,
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
    // 転生
    lifetimeTypesEarned,
    currentRunTypesEarned,
    prestigeCount,
    prestigeUpgrades,
    prestigeLevel,
    potentialPrestigeLevel,
    availablePrestigePoints,
    newPointsOnSell,
    spentPrestigePoints,
    prestigeProductionMultiplier,
    prestigePassiveRate,
    prestigeTypingBonus,
    prestigeTpsBonus,
    hasPrestigeUpgrade,
    purchasePrestigeUpgrade,
    performPrestige,
  }
})
