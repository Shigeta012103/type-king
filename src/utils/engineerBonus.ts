import type { OwnedEngineer } from '../types/game'
import { ENGINEER_DEFINITIONS } from '../constants/engineers'

/**
 * シナジーボーナス: sourceの人数がtargetのTPSを強化（片方向）
 *
 * source 1人につき target のTPS +1%
 * 例: ジュニア100人 → ミドルのTPSに+100%
 */
const SYNERGY_RATE = 0.01

export interface SynergyPair {
  source: string
  target: string
  name: string
  icon: string
}

export const SYNERGY_PAIRS: SynergyPair[] = [
  // 隣接ティア（低→高）
  { source: 'junior', target: 'middle', name: 'ペアプロ', icon: '🤝' },
  { source: 'assistant', target: 'senior', name: 'メンター制度', icon: '🎓' },
  { source: 'middle', target: 'expert', name: '技術継承', icon: '📜' },
  { source: 'senior', target: 'robot', name: '人機協調', icon: '🤖' },
  { source: 'expert', target: 'wizard', name: '魔法工学', icon: '⚗️' },
  { source: 'robot', target: 'dragon', name: '竜騎兵', icon: '🐲' },
  { source: 'wizard', target: 'time-lord', name: '時空魔法', icon: '🌀' },
  { source: 'time-lord', target: 'god', name: '神の祝福', icon: '✨' },
  // クロスティア（低→高）
  { source: 'assistant', target: 'god', name: '神の寵愛', icon: '🙏' },
  { source: 'assistant', target: 'wizard', name: '魔法使いの卵', icon: '🪄' },
  { source: 'junior', target: 'dragon', name: '竜の弟子', icon: '🔥' },
  { source: 'middle', target: 'time-lord', name: '時短術', icon: '⏱️' },
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

    // このエンジニアがtargetになっているシナジーのsource人数から計算
    let synergyBonus = 0
    for (const pair of SYNERGY_PAIRS) {
      if (pair.target !== def.id) continue
      const sourceCount = getCountById(engineers, pair.source)
      synergyBonus += sourceCount * SYNERGY_RATE
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
