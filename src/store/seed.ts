import type { CreatorStats } from '../types'
import { brlToFt } from '../utils/format'

export function buildStats(seed: string, priceBRL: number): CreatorStats {
  let s = [...seed].reduce((a, c) => a + c.charCodeAt(0), 7)
  const rand = () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
  const now = new Date()
  let subs = 4 + Math.floor(rand() * 6)
  const monthly = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
    subs = Math.max(1, subs + Math.floor(rand() * 9) - 2)
    return {
      month: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      subscribers: subs,
      revenueFt: subs * brlToFt(priceBRL),
    }
  })
  return { monthly, pendingFt: Math.round(monthly[5].revenueFt * 0.4) }
}
