import type { UpgradeDefinition } from '../types/game'

/**
 * レベルアップ時のスケーリング定数
 *
 * パワー成長: 各レベルで2000倍 → レベルアップが強力に感じる
 * コスト成長: 各レベルで5000倍 → 高ティアの方がコスパが良い
 *
 * 例: メカニカルキーボード
 *   Lv.1: +2 パワー, 300 コスト
 *   Lv.2: +4,000 パワー, 1,500,000 コスト
 *   Lv.3: +8,000,000 パワー, 7,500,000,000 コスト
 *
 * ニューラルリンク Lv.1 (+2,000, 500,000コスト) より
 * メカニカルキーボード Lv.2 (+4,002, 1,500,300コスト) の方が強いが、
 * コスパはニューラルリンクの方が3倍良い → 高ティアを先に買うのが正解
 */
export const LEVEL_POWER_GROWTH = 2000
export const LEVEL_COST_GROWTH = 5000

export const UPGRADE_DEFINITIONS: UpgradeDefinition[] = [
  {
    id: 'mechanical-keyboard',
    name: 'メカニカルキーボード',
    description: 'カチカチ気持ちいいキーボード',
    basePower: 2,
    baseCost: 300,
    icon: '⌨️',
  },
  {
    id: 'ergonomic-desk',
    name: 'エルゴノミクスデスク',
    description: '姿勢改善で集中力UP',
    basePower: 8,
    baseCost: 1000,
    icon: '🪑',
  },
  {
    id: 'dual-monitor',
    name: 'デュアルモニター',
    description: '視野が広がり効率UP',
    basePower: 30,
    baseCost: 4000,
    icon: '🖥️',
  },
  {
    id: 'ai-assistant',
    name: 'AIアシスタント',
    description: 'AIが入力を先読みサポート',
    basePower: 120,
    baseCost: 20000,
    icon: '🤖',
  },
  {
    id: 'quantum-keyboard',
    name: '量子キーボード',
    description: '量子もつれで超高速入力',
    basePower: 500,
    baseCost: 100000,
    icon: '⚛️',
  },
  {
    id: 'neural-link',
    name: 'ニューラルリンク',
    description: '思考がそのまま文字になる',
    basePower: 2000,
    baseCost: 500000,
    icon: '🧠',
  },
]
