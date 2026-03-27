import type { FeverUpgradeDefinition } from '../types/game'

export const FEVER_UPGRADE_DEFINITIONS: FeverUpgradeDefinition[] = [
  {
    id: 'fever-boost',
    name: 'フィーバーブースト',
    description: 'フィーバー倍率+1',
    baseCost: 5000000,
    costGrowth: 8,
    icon: '🔥',
  },
  {
    id: 'fever-extend',
    name: 'フィーバー延長',
    description: 'フィーバー時間+5秒',
    baseCost: 15000000,
    costGrowth: 10,
    icon: '⏱️',
  },
  {
    id: 'fever-cooldown',
    name: 'フィーバー加速',
    description: 'クールタイム-5秒（最短15秒）',
    baseCost: 10000000,
    costGrowth: 8,
    icon: '⚡',
  },
  {
    id: 'fever-sync',
    name: 'フィーバーシンクロ',
    description: 'フィーバー倍率を自動タイプにも適用(Lv3で100%)',
    baseCost: 100000000,
    costGrowth: 15,
    icon: '🔄',
  },
]
