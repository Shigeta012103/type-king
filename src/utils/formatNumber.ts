const SUFFIXES = [
  { threshold: 1e16, suffix: '京' },
  { threshold: 1e12, suffix: '兆' },
  { threshold: 1e8, suffix: '億' },
  { threshold: 1e4, suffix: '万' },
  { threshold: 1e3, suffix: '千' },
] as const

export function formatNumber(value: number): string {
  for (const { threshold, suffix } of SUFFIXES) {
    if (value >= threshold) {
      const formatted = (value / threshold).toFixed(1)
      return `${formatted}${suffix}`
    }
  }
  return Math.floor(value).toLocaleString()
}
