import type { UpgradeDefinition } from '../types/game'

export const UPGRADE_DEFINITIONS: UpgradeDefinition[] = [
  {
    id: 'mechanical-keyboard',
    name: 'メカニカルキーボード',
    description: 'タイプ効率が2倍になる',
    cost: 500,
    multiplier: 2,
    icon: '⌨️',
  },
  {
    id: 'ergonomic-desk',
    name: 'エルゴノミクスデスク',
    description: 'タイプ効率が3倍になる',
    cost: 5000,
    multiplier: 3,
    icon: '🪑',
  },
  {
    id: 'dual-monitor',
    name: 'デュアルモニター',
    description: 'タイプ効率が5倍になる',
    cost: 50000,
    multiplier: 5,
    icon: '🖥️',
  },
  {
    id: 'ai-assistant',
    name: 'AIアシスタント',
    description: 'タイプ効率が10倍になる',
    cost: 500000,
    multiplier: 10,
    icon: '🤖',
  },
  {
    id: 'quantum-keyboard',
    name: '量子キーボード',
    description: 'タイプ効率が25倍になる',
    cost: 5000000,
    multiplier: 25,
    icon: '⚛️',
  },
  {
    id: 'neural-link',
    name: 'ニューラルリンク',
    description: 'タイプ効率が100倍になる',
    cost: 100000000,
    multiplier: 100,
    icon: '🧠',
  },
]
