/**
 * 転生レベル計算
 *
 * 必要タイプ数の目安:
 *   1B → Lv.1,  4B → Lv.2,  9B → Lv.3
 *   100B → Lv.10,  1T → Lv.31,  10T → Lv.100
 */
const PRESTIGE_THRESHOLD = 1_000_000_000

export function calcPrestigeLevel(lifetimeTypesEarned: number): number {
  if (lifetimeTypesEarned < PRESTIGE_THRESHOLD) return 0
  return Math.floor(Math.sqrt(lifetimeTypesEarned / PRESTIGE_THRESHOLD))
}
