import type { UpgradeDefinition } from '../types/game'

/**
 * レベルアップ時のスケーリング定数
 *
 * パワー成長: 各レベルで2000倍 → レベルアップが強力に感じる
 * コスト成長: 各レベルで5000倍 → 高ティアの方がコスパが良い
 */
export const LEVEL_POWER_GROWTH = 2000
export const LEVEL_COST_GROWTH = 5000

export const UPGRADE_DEFINITIONS: UpgradeDefinition[] = [
  {
    id: 'mechanical-keyboard',
    name: 'メカニカルキーボード',
    description: 'カチカチ気持ちいいキーボード',
    basePower: 2,
    baseCost: 200,
    icon: '⌨️',
  },
  {
    id: 'ergonomic-desk',
    name: 'エルゴノミクスデスク',
    description: '姿勢改善で集中力UP',
    basePower: 10,
    baseCost: 2500,
    icon: '🪑',
  },
  {
    id: 'dual-monitor',
    name: 'デュアルモニター',
    description: '視野が広がり効率UP',
    basePower: 40,
    baseCost: 25000,
    icon: '🖥️',
  },
  {
    id: 'ai-assistant',
    name: 'AIアシスタント',
    description: 'AIが入力を先読みサポート',
    basePower: 180,
    baseCost: 250000,
    icon: '🤖',
  },
  {
    id: 'quantum-keyboard',
    name: '量子キーボード',
    description: '量子もつれで超高速入力',
    basePower: 800,
    baseCost: 3000000,
    icon: '⚛️',
  },
  {
    id: 'neural-link',
    name: 'ニューラルリンク',
    description: '思考がそのまま文字になる',
    basePower: 3500,
    baseCost: 20000000,
    icon: '🧠',
  },
]
