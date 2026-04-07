import type { OwnedEngineer } from '../types/game'
import { ENGINEER_DEFINITIONS } from '../constants/engineers'

/**
 * シナジーボーナス: 全ティア間で相互強化（距離で減衰）
 *
 * 距離1（隣接）: 下位1人→上位+0.5%, 上位1人→下位+5%
 * 距離2:         下位1人→上位+0.3%, 上位1人→下位+3%
 * 距離3以上:     下位1人→上位+0.1%, 上位1人→下位+1%
 *
 * 例: アシスタント100人 → ジュニア+50%, ミドル+30%, シニア以上+10%
 */
interface SynergyRate {
  lowerToUpper: number
  upperToLower: number
}

const SYNERGY_BY_DISTANCE: SynergyRate[] = [
  { lowerToUpper: 0, upperToLower: 0 },         // 距離0（自身）
  { lowerToUpper: 0.005, upperToLower: 0.05 },  // 距離1（隣接）
  { lowerToUpper: 0.003, upperToLower: 0.03 },  // 距離2
]
const FAR_SYNERGY: SynergyRate = { lowerToUpper: 0.001, upperToLower: 0.01 } // 距離3以上

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

    // 全ティアからのシナジー（距離で減衰）
    let synergyFromLower = 0
    let synergyFromUpper = 0
    for (let j = 0; j < ENGINEER_DEFINITIONS.length; j++) {
      if (j === i) continue
      const distance = Math.abs(i - j)
      const rate = SYNERGY_BY_DISTANCE[distance] ?? FAR_SYNERGY
      const otherCount = getCountByIndex(engineers, j)
      if (j < i) {
        synergyFromLower += otherCount * rate.lowerToUpper
      } else {
        synergyFromUpper += otherCount * rate.upperToLower
      }
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
