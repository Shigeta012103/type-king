import type { PrestigeUpgradeDefinition } from '../types/game'

export const PRESTIGE_UPGRADE_DEFINITIONS: PrestigeUpgradeDefinition[] = [
  // --- Tier 1: 安価 ---
  {
    id: 'starting-fund',
    name: '始まりの種',
    description: '転生後、10,000タイプを持った状態で開始する',
    cost: 1,
    icon: '🌱',
  },
  {
    id: 'typing-memory-1',
    name: 'タイパーの血統',
    description: 'タイピング倍率が永続で+10%',
    cost: 3,
    icon: '🩸',
  },
  {
    id: 'tps-memory-1',
    name: '効率の遺伝子',
    description: '自動TPSが永続で+10%',
    cost: 3,
    icon: '🧬',
  },

  // --- Tier 2: 中程度 ---
  {
    id: 'fever-echo',
    name: 'フィーバーの残響',
    description: 'フィーバー倍率の基本値+1',
    cost: 5,
    icon: '🔔',
  },
  {
    id: 'cost-efficiency',
    name: 'コスト効率化',
    description: '全ての購入コストが-10%',
    cost: 5,
    icon: '💰',
  },

  // --- Tier 3: やや高め ---
  {
    id: 'typing-memory-2',
    name: '天才の記憶',
    description: 'タイピング倍率が永続で+25%',
    cost: 8,
    icon: '🧠',
  },
  {
    id: 'tps-memory-2',
    name: '軍団の記憶',
    description: '自動TPSが永続で+25%',
    cost: 8,
    icon: '⚔️',
  },

  // --- Tier 4: 高め ---
  {
    id: 'early-ipo',
    name: '早期上場',
    description: 'IPOコストが半額になる',
    cost: 10,
    icon: '📈',
  },
  {
    id: 'fever-sustain',
    name: '持続フィーバー',
    description: 'フィーバー持続時間が永続で+10秒',
    cost: 10,
    icon: '⏰',
  },
  {
    id: 'timekeeper',
    name: 'タイムキーパー',
    description: 'オフライン収益が2倍になる',
    cost: 12,
    icon: '⌛',
  },

  // --- Tier 5: 高価 ---
  {
    id: 'fever-chain',
    name: 'フィーバー連鎖',
    description: 'フィーバークールダウンが半減する',
    cost: 15,
    icon: '⚡',
  },
  {
    id: 'typing-mastery',
    name: '究極のタイピスト',
    description: 'タイピング倍率が永続で+100%',
    cost: 20,
    icon: '👆',
  },
  {
    id: 'tps-mastery',
    name: '究極の軍団',
    description: '自動TPSが永続で+100%',
    cost: 20,
    icon: '🏰',
  },

  // --- Tier 6: 最高 ---
  {
    id: 'hand-of-god',
    name: '神の手',
    description: '全ての生産力が2倍になる',
    cost: 30,
    icon: '✋',
  },
]
