import type { OwnedEngineer } from '../types/game'
import { ENGINEER_DEFINITIONS } from '../constants/engineers'

/**
 * シナジーボーナス: 隣接ティア同士が強化し合う
 *
 * 下位ティア1人 → 上位ティアのTPS +0.5%
 * 上位ティア1人 → 下位ティアのTPS +5%
 *
 * 例: アシスタント100人 → ジュニアに+50%ボーナス
 *     エキスパート10人 → シニアに+50%ボーナス
 */
const LOWER_TO_UPPER_RATE = 0.005
const UPPER_TO_LOWER_RATE = 0.05

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

function getCountByIndex(engineers: OwnedEngineer[], tierIndex: number): number {
  const def = ENGINEER_DEFINITIONS[tierIndex]
  if (!def) return 0
  return engineers.find((e) => e.definitionId === def.id)?.count ?? 0
}

export function calcAllEngineerBonuses(engineers: OwnedEngineer[]): BonusSummary {
  const details: EngineerBonusDetail[] = []

  // シナジー計算
  for (let i = 0; i < ENGINEER_DEFINITIONS.length; i++) {
    const def = ENGINEER_DEFINITIONS[i]
    const owned = engineers.find((e) => e.definitionId === def.id)
    const count = owned?.count ?? 0
    if (count === 0) {
      details.push({
        definitionId: def.id,
        baseTps: def.typesPerSecond,
        count: 0,
        digitBonus: 1,
        synergyBonus: 0,
        effectiveTps: 0,
      })
      continue
    }

    const digitBonus = calcDigitBonus(count)

    // 下のティアからのシナジー（下位の人数 × LOWER_TO_UPPER_RATE）
    let synergyFromLower = 0
    if (i > 0) {
      const lowerCount = getCountByIndex(engineers, i - 1)
      synergyFromLower = lowerCount * LOWER_TO_UPPER_RATE
    }

    // 上のティアからのシナジー（上位の人数 × UPPER_TO_LOWER_RATE）
    let synergyFromUpper = 0
    if (i < ENGINEER_DEFINITIONS.length - 1) {
      const upperCount = getCountByIndex(engineers, i + 1)
      synergyFromUpper = upperCount * UPPER_TO_LOWER_RATE
    }

    const synergyBonus = synergyFromLower + synergyFromUpper
    const effectiveTps = def.typesPerSecond * count * digitBonus * (1 + synergyBonus)

    details.push({
      definitionId: def.id,
      baseTps: def.typesPerSecond,
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
    const count = eng.count
    for (const ms of MILESTONES) {
      if (count >= ms.threshold) {
        milestoneBonus += ms.globalBonus
        milestoneCount++
      }
    }
  }

  // マイルストーンを全体に適用
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
