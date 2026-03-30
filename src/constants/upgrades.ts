import type { UpgradeDefinition } from '../types/game'

/**
 * レベルアップ時のスケーリング定数
 *
 * パワー成長: 各レベルで15倍 → 着実にパワーアップ
 * コスト成長: 各レベルで50倍 → コスト上昇の方が急でインフレ抑制
 *
 * バランス目安（上場前全Lv.1）:
 *   タイプ倍率 ~4,500 → 手動タイピング ~13,500/秒（3打鍵/秒想定）
 *   エンジニア自動 ~5,000/秒
 *   → 手動:自動 ≈ 2.7:1（手動が優位だが自動も意味がある）
 */
export const LEVEL_POWER_GROWTH = 8
export const LEVEL_COST_GROWTH = 25

export const UPGRADE_DEFINITIONS: UpgradeDefinition[] = [
  // --- 上場前 ---
  {
    id: 'mechanical-keyboard',
    name: 'メカニカルキーボード',
    description: 'カチカチ気持ちいいキーボード',
    basePower: 2,
    baseCost: 200,
    icon: '⌨️',
    requiresIpo: false,
  },
  {
    id: 'ergonomic-desk',
    name: 'エルゴノミクスデスク',
    description: '姿勢改善で集中力UP',
    basePower: 10,
    baseCost: 2500,
    icon: '🪑',
    requiresIpo: false,
  },
  {
    id: 'dual-monitor',
    name: 'デュアルモニター',
    description: '視野が広がり効率UP',
    basePower: 40,
    baseCost: 25000,
    icon: '🖥️',
    requiresIpo: false,
  },
  {
    id: 'ai-assistant',
    name: 'AIアシスタント',
    description: 'AIが入力を先読みサポート',
    basePower: 180,
    baseCost: 250000,
    icon: '🤖',
    requiresIpo: false,
  },
  {
    id: 'quantum-keyboard',
    name: '量子キーボード',
    description: '量子もつれで超高速入力',
    basePower: 800,
    baseCost: 3000000,
    icon: '⚛️',
    requiresIpo: false,
  },
  {
    id: 'neural-link',
    name: 'ニューラルリンク',
    description: '思考がそのまま文字になる',
    basePower: 3500,
    baseCost: 20000000,
    icon: '🧠',
    requiresIpo: false,
  },

  // --- 上場後 ---
  {
    id: 'drill',
    name: 'ドリル',
    description: '天を突くドリルでキーを貫く',
    basePower: 1000,
    baseCost: 500000000,
    icon: '🔩',
    requiresIpo: true,
  },
  {
    id: 'cheat-code',
    name: 'チートコード',
    description: '上上下下左右左右BA',
    basePower: 3000,
    baseCost: 8000000000,
    icon: '🎮',
    requiresIpo: true,
  },
  {
    id: 'matrix',
    name: 'マトリックス接続',
    description: '仮想世界から直接入力',
    basePower: 8000,
    baseCost: 100000000000,
    icon: '💊',
    requiresIpo: true,
  },
  {
    id: 'time-warp',
    name: 'タイムワープ',
    description: '未来の自分がもう打ち終わっている',
    basePower: 25000,
    baseCost: 2000000000000,
    icon: '⏰',
    requiresIpo: true,
  },
  {
    id: 'divine-touch',
    name: '神の一撃',
    description: '一打で宇宙が震える',
    basePower: 80000,
    baseCost: 50000000000000,
    icon: '⚡',
    requiresIpo: true,
  },
]
