export interface EngineerDefinition {
  id: string
  name: string
  description: string
  typesPerSecond: number
  baseCost: number
  costMultiplier: number
  icon: string
  requiresIpo: boolean
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
  requiresIpo: boolean
}

export interface OwnedUpgrade {
  definitionId: string
  level: number
}

export interface FeverUpgradeDefinition {
  id: string
  name: string
  description: string
  baseCost: number
  costGrowth: number
  icon: string
  maxLevel?: number
}

export interface OwnedFeverUpgrade {
  definitionId: string
  level: number
}

export interface PrestigeUpgradeDefinition {
  id: string
  name: string
  description: string
  cost: number
  icon: string
}

export interface OwnedPrestigeUpgrade {
  definitionId: string
  purchased: boolean
}

export interface RepeatablePrestigeDefinition {
  id: string
  name: string
  description: string
  baseCost: number
  costGrowth: number
  effectPerLevel: number
  icon: string
}

export interface OwnedRepeatablePrestige {
  definitionId: string
  level: number
}

export interface WordEntry {
  display: string
  reading: string
}
