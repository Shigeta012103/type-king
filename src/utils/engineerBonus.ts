import type { OwnedEngineer } from '../types/game'
import { ENGINEER_DEFINITIONS } from '../constants/engineers'

/**
 * シナジーボーナス: 特定の組み合わせが互いを強化（クッキークリッカー方式）
 *
 * 相手1人につき自分のTPS +0.5%（双方向同率）
 * 例: ジュニア50人 → ペアのミドルに+25%
 */
const SYNERGY_RATE = 0.005

export interface SynergyPair {
  engineerA: string
  engineerB: string
  name: string
  icon: string
}

export const SYNERGY_PAIRS: SynergyPair[] = [
  // 上場前
  { engineerA: 'junior', engineerB: 'middle', name: 'ペアプロ', icon: '🤝' },
  { engineerA: 'assistant', engineerB: 'senior', name: 'メンター制度', icon: '🎓' },
  { engineerA: 'middle', engineerB: 'expert', name: '技術継承', icon: '📜' },
  // 上場後
  { engineerA: 'senior', engineerB: 'robot', name: '人機協調', icon: '🤖' },
  { engineerA: 'expert', engineerB: 'wizard', name: '魔法工学', icon: '⚗️' },
  { engineerA: 'robot', engineerB: 'dragon', name: '竜騎兵', icon: '🐲' },
  { engineerA: 'wizard', engineerB: 'time-lord', name: '時空魔法', icon: '🌀' },
  { engineerA: 'time-lord', engineerB: 'god', name: '神の祝福', icon: '✨' },
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

/** 指定エンジニアのシナジーペア相手のID一覧を返す */
function getSynergyPartnerIds(definitionId: string): string[] {
  const partners: string[] = []
  for (const pair of SYNERGY_PAIRS) {
    if (pair.engineerA === definitionId) partners.push(pair.engineerB)
    if (pair.engineerB === definitionId) partners.push(pair.engineerA)
  }
  return partners
}

export function calcAllEngineerBonuses(engineers: OwnedEngineer[]): BonusSummary {
  const details: EngineerBonusDetail[] = []

  for (const def of ENGINEER_DEFINITIONS) {
    const count = getCountById(engineers, def.id)
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

    // シナジーペアの相手人数から計算
    const partnerIds = getSynergyPartnerIds(def.id)
    let synergyBonus = 0
    for (const partnerId of partnerIds) {
      const partnerCount = getCountById(engineers, partnerId)
      synergyBonus += partnerCount * SYNERGY_RATE
    }

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
    for (const ms of MILESTONES) {
      if (eng.count >= ms.threshold) {
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
