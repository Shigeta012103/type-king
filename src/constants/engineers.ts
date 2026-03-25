import type { EngineerDefinition } from '../types/game'

export const ENGINEER_DEFINITIONS: EngineerDefinition[] = [
  {
    id: 'assistant',
    name: 'アシスタント',
    description: 'タイピングを始めたばかりの新人',
    typesPerSecond: 1,
    baseCost: 50,
    costMultiplier: 1.15,
    icon: '👶',
  },
  {
    id: 'junior',
    name: 'ジュニア',
    description: '基本的なタイピングができるエンジニア',
    typesPerSecond: 5,
    baseCost: 300,
    costMultiplier: 1.15,
    icon: '🧑‍💻',
  },
  {
    id: 'middle',
    name: 'ミドル',
    description: '安定したタイピング速度を持つエンジニア',
    typesPerSecond: 20,
    baseCost: 2000,
    costMultiplier: 1.15,
    icon: '💻',
  },
  {
    id: 'senior',
    name: 'シニア',
    description: '高速タイピングのベテランエンジニア',
    typesPerSecond: 80,
    baseCost: 15000,
    costMultiplier: 1.15,
    icon: '🔥',
  },
  {
    id: 'expert',
    name: 'エキスパート',
    description: '伝説級のタイピングマスター',
    typesPerSecond: 300,
    baseCost: 100000,
    costMultiplier: 1.15,
    icon: '👑',
  },
]
