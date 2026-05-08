import type { RepeatablePrestigeDefinition } from '../types/game'

export const REPEATABLE_PRESTIGE_DEFINITIONS: RepeatablePrestigeDefinition[] = [
  {
    id: 'eternal-training',
    name: '永遠の研鑽',
    description: 'タイピング倍率 +20%/Lv',
    baseCost: 50,
    costGrowth: 1.8,
    effectPerLevel: 0.20,
    icon: '🔁',
  },
  {
    id: 'infinite-efficiency',
    name: '無限の効率',
    description: '自動TPS +20%/Lv',
    baseCost: 50,
    costGrowth: 1.8,
    effectPerLevel: 0.20,
    icon: '♾️',
  },
  {
    id: 'dimension-compression',
    name: '次元圧縮',
    description: '全生産 +5%/Lv（乗算）',
    baseCost: 200,
    costGrowth: 2.0,
    effectPerLevel: 0.05,
    icon: '🌌',
  },
]
