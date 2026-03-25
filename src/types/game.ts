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
  basePower: number
  baseCost: number
  icon: string
}

export interface OwnedUpgrade {
  definitionId: string
  level: number
}

export interface WordEntry {
  display: string
  reading: string
}
