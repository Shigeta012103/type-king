const SUFFIXES = [
  { threshold: 1e15, suffix: 'Q' },
  { threshold: 1e12, suffix: 'T' },
  { threshold: 1e9, suffix: 'B' },
  { threshold: 1e6, suffix: 'M' },
  { threshold: 1e3, suffix: 'K' },
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
