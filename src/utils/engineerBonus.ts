import type { OwnedEngineer } from '../types/game'
import { ENGINEER_DEFINITIONS } from '../constants/engineers'

/**
 * シナジーボーナス: 特定の組み合わせが互いのTPSを強化（双方向）
 *
 * 相手1人につき自分のTPS +0.5%
 * 例: ジュニア100人 → ミドルに+50%, ミドル100人 → ジュニアに+50%
 */
const SYNERGY_RATE = 0.005

export interface SynergyPair {
  engineerA: string
  engineerB: string
  name: string
  icon: string
}

export const SYNERGY_PAIRS: SynergyPair[] = [
  // 隣接ティア
  { engineerA: 'junior', engineerB: 'middle', name: 'ペアプロ', icon: '🤝' },
  { engineerA: 'assistant', engineerB: 'senior', name: 'メンター制度', icon: '🎓' },
  { engineerA: 'middle', engineerB: 'expert', name: '技術継承', icon: '📜' },
  { engineerA: 'senior', engineerB: 'robot', name: '人機協調', icon: '🤖' },
  { engineerA: 'expert', engineerB: 'wizard', name: '魔法工学', icon: '⚗️' },
  { engineerA: 'robot', engineerB: 'dragon', name: '竜騎兵', icon: '🐲' },
  { engineerA: 'wizard', engineerB: 'time-lord', name: '時空魔法', icon: '🌀' },
  { engineerA: 'time-lord', engineerB: 'god', name: '神の祝福', icon: '✨' },
  // クロスティア
  { engineerA: 'assistant', engineerB: 'god', name: '神の寵愛', icon: '🙏' },
  { engineerA: 'assistant', engineerB: 'wizard', name: '魔法使いの卵', icon: '🪄' },
  { engineerA: 'junior', engineerB: 'dragon', name: '竜の弟子', icon: '🔥' },
  { engineerA: 'middle', engineerB: 'time-lord', name: '時短術', icon: '⏱️' },
]

/**
 * マイルストーンボーナス: 特定人数で全エンジニアにバフ
 *
 * 各ティアの25人/50人/100人到達で全体ボーナスが加算
 */
interface Milestone {
  threshold: number
  globalBonus: number
  label: string
}

const MILESTONES: Milestone[] = [
  { threshold: 25, globalBonus: 0.10, label: '25人' },
  { threshold: 50, globalBonus: 0.15, label: '50人' },
  { threshold: 100, globalBonus: 0.25, label: '100人' },
]

export interface EngineerBonusDetail {
  definitionId: string
  baseTps: number
  count: number
  digitBonus: number
  synergyBonus: number
  effectiveTps: number
}

export interface BonusSummary {
  engineers: EngineerBonusDetail[]
  milestoneBonus: number
  milestoneCount: number
  totalTps: number
}

function calcDigitBonus(count: number): number {
  if (count < 10) return 1
  const digits = Math.floor(Math.log10(count))
  return 1 + digits * 0.5
}

function getCountById(engineers: OwnedEngineer[], definitionId: string): number {
  return engineers.find((e) => e.definitionId === definitionId)?.count ?? 0
}

export interface EngineerBonusOptions {
  synergyMultiplier?: number
  baseTpsMultiplier?: number
  milestoneMultiplier?: number
}

export function calcAllEngineerBonuses(
  engineers: OwnedEngineer[],
  options: EngineerBonusOptions = {}
): BonusSummary {
  const synergyMultiplier = options.synergyMultiplier ?? 1
  const baseTpsMultiplier = options.baseTpsMultiplier ?? 1
  const milestoneMultiplier = options.milestoneMultiplier ?? 1
  const details: EngineerBonusDetail[] = []

  for (const def of ENGINEER_DEFINITIONS) {
    const count = getCountById(engineers, def.id)
    const baseTps = def.typesPerSecond * baseTpsMultiplier
    if (count === 0) {
      details.push({
        definitionId: def.id,
        baseTps,
        count: 0,
        digitBonus: 1,
        synergyBonus: 0,
        effectiveTps: 0,
      })
      continue
    }

    const digitBonus = calcDigitBonus(count)

    let synergyBonus = 0
    for (const pair of SYNERGY_PAIRS) {
      if (pair.engineerA === def.id) {
        synergyBonus += getCountById(engineers, pair.engineerB) * SYNERGY_RATE
      } else if (pair.engineerB === def.id) {
        synergyBonus += getCountById(engineers, pair.engineerA) * SYNERGY_RATE
      }
    }
    synergyBonus *= synergyMultiplier

    const effectiveTps = baseTps * count * digitBonus * (1 + synergyBonus)

    details.push({
      definitionId: def.id,
      baseTps,
      count,
      digitBonus,
      synergyBonus,
      effectiveTps,
    })
  }

  // マイルストーン計算
  let milestoneBonus = 0
  let milestoneCount = 0
  for (const eng of engineers) {
    for (const ms of MILESTONES) {
      if (eng.count >= ms.threshold) {
        milestoneBonus += ms.globalBonus
        milestoneCount++
      }
    }
  }

  // マイルストーンを全体に適用
  milestoneBonus *= milestoneMultiplier
  const globalMultiplier = 1 + milestoneBonus
  let totalTps = 0
  for (const detail of details) {
    detail.effectiveTps *= globalMultiplier
    totalTps += detail.effectiveTps
  }

  return {
    engineers: details,
    milestoneBonus,
    milestoneCount,
    totalTps,
  }
}

export { MILESTONES }
