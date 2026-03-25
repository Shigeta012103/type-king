export interface EngineerDefinition {
  id: string
  name: string
  description: string
  typesPerSecond: number
  baseCost: number
  costMultiplier: number
  icon: string
}

export interface OwnedEngineer {
  definitionId: string
  count: number
}

export interface UpgradeDefinition {
  id: string
  name: string
  description: string
  cost: number
  multiplier: number
  icon: string
}

export interface WordEntry {
  display: string
  reading: string
}

export interface GameState {
  totalTypes: number
  typesPerSecond: number
  globalMultiplier: number
  engineers: OwnedEngineer[]
  purchasedUpgradeIds: string[]
}
