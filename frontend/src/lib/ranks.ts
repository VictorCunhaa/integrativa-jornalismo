export interface Rank {
  id: number
  title: string
  min: number
}

export const RANKS: Rank[] = [
  { id: 1, title: 'Estagiário',        min: 0    },
  { id: 2, title: 'Repórter Jr',       min: 100  },
  { id: 3, title: 'Repórter',          min: 300  },
  { id: 4, title: 'Editor-Assistente', min: 600  },
  { id: 5, title: 'Editor',            min: 1000 },
  { id: 6, title: 'Editor-Chefe',      min: 1500 },
]

export interface RankInfo {
  current: Rank
  next: Rank | null
  /** 0–100 */
  progress: number
}

export function getRankInfo(points: number): RankInfo {
  let current = RANKS[0]
  for (const rank of RANKS) {
    if (points >= rank.min) current = rank
    else break
  }

  const currentIndex = RANKS.indexOf(current)
  const next = RANKS[currentIndex + 1] ?? null

  const progress = next
    ? Math.round(((points - current.min) / (next.min - current.min)) * 100)
    : 100

  return { current, next, progress }
}
