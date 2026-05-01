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
    id: 'starter-junior',
    name: '見習いの記憶',
    description: '転生後、ジュニア1人を雇った状態で開始する',
    cost: 2,
    icon: '🎓',
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
    id: 'click-combo',
    name: '連打の極意',
    description: 'タイピング倍率が永続で+25%',
    cost: 5,
    icon: '🥊',
  },
  {
    id: 'cost-efficiency',
    name: 'コスト効率化',
    description: '全ての購入コストが-10%',
    cost: 5,
    icon: '💰',
  },
  {
    id: 'ipo-refund',
    name: '上場ボーナス',
    description: 'IPO時に投資額の20%が戻ってくる',
    cost: 6,
    icon: '💸',
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
  {
    id: 'synergy-amp',
    name: '共鳴増幅',
    description: 'エンジニア間のシナジー効果が2倍',
    cost: 8,
    icon: '🔗',
  },
  {
    id: 'starter-pack',
    name: '初期チーム',
    description: '転生後、アシスタント・ジュニア・ミドルを各1人持つ',
    cost: 8,
    icon: '📦',
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
    id: 'fever-frenzy',
    name: '熱狂の手',
    description: 'フィーバー中、タイピング倍率がさらに+1倍',
    cost: 10,
    icon: '🔥',
  },
  {
    id: 'timekeeper',
    name: 'タイムキーパー',
    description: 'オフライン収益が2倍になる',
    cost: 12,
    icon: '⌛',
  },
  {
    id: 'prestige-resonance',
    name: '転生共鳴',
    description: '転生レベルあたりの受動ボーナスが+0.5%（合計1.5%/Lv）',
    cost: 12,
    icon: '🌟',
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
    id: 'engineer-elite',
    name: 'エリート教育',
    description: '全エンジニアの基本TPSが+50%',
    cost: 15,
    icon: '👔',
  },
  {
    id: 'click-mastery',
    name: '指の覚醒',
    description: 'タイピング倍率が永続で+200%',
    cost: 18,
    icon: '✨',
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

  // --- Tier 7: 超越 ---
  {
    id: 'ascension',
    name: '超越',
    description: '全ての生産力がさらに2倍（神の手と合わせて4倍）',
    cost: 50,
    icon: '🌌',
  },

  // --- Tier 8: 超高額 ---
  {
    id: 'milestone-awakening',
    name: 'マイルストーン覚醒',
    description: 'マイルストーンボーナスが2倍になる',
    cost: 60,
    icon: '🏆',
  },
  {
    id: 'cost-mastery',
    name: '錬金の極意',
    description: '全ての購入コストがさらに-20%（コスト効率化と乗算）',
    cost: 70,
    icon: '🪙',
  },
  {
    id: 'synergy-supreme',
    name: '至高のシナジー',
    description: 'エンジニア間のシナジー効果がさらに2倍（共鳴増幅と乗算で4倍）',
    cost: 80,
    icon: '💞',
  },
  {
    id: 'engineer-master',
    name: '神域の教え',
    description: '全エンジニアの基本TPSがさらに+100%（エリート教育と乗算）',
    cost: 80,
    icon: '🎖️',
  },
  {
    id: 'click-divine',
    name: '神速の指',
    description: 'タイピング倍率が永続で+500%',
    cost: 80,
    icon: '🌪️',
  },
  {
    id: 'tps-divine',
    name: '無尽の軍団',
    description: '自動TPSが永続で+500%',
    cost: 80,
    icon: '🛡️',
  },

  // --- Tier 9: 極限 ---
  {
    id: 'fever-eternal',
    name: '永遠のフィーバー',
    description: 'フィーバー倍率の基本値+3、持続時間+20秒',
    cost: 100,
    icon: '🌋',
  },
  {
    id: 'prestige-resonance-2',
    name: '転生極大化',
    description: '転生レベルあたりの受動ボーナスがさらに+1.5%（共鳴と合わせて3%/Lv）',
    cost: 100,
    icon: '💫',
  },
  {
    id: 'time-master',
    name: '時の支配者',
    description: 'オフライン収益がさらに2.5倍（タイムキーパーと合わせて5倍）',
    cost: 100,
    icon: '⏳',
  },
  {
    id: 'genesis',
    name: '創世の光',
    description: '全ての生産力が3倍',
    cost: 150,
    icon: '☀️',
  },

  // --- Tier 10: 神話 ---
  {
    id: 'infinity',
    name: '無限永劫',
    description: '全ての生産力がさらに5倍（神の手・超越・創世と合わせて60倍）',
    cost: 300,
    icon: '♾️',
  },
]
