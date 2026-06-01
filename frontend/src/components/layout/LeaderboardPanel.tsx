import { Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { getInitials } from '@/lib/utils'

interface LeaderEntry {
  rank: 1 | 2 | 3
  name: string
  username: string
  title: string
  avatar_url?: string
  points: number
}

// Dados de exemplo — substituir por API futuramente
const TOP_THREE: LeaderEntry[] = [
  {
    rank: 1,
    name: 'Ana Souza',
    username: 'anasouza',
    title: 'Editor-Chefe',
    points: 1820,
  },
  {
    rank: 2,
    name: 'Pedro Alves',
    username: 'pedroalves',
    title: 'Editor',
    points: 1340,
  },
  {
    rank: 3,
    name: 'Carla Matos',
    username: 'carlamatos',
    title: 'Repórter',
    points: 890,
  },
]

const MEDAL_COLORS: Record<1 | 2 | 3, string> = {
  1: 'text-amber-500',
  2: 'text-slate-400',
  3: 'text-amber-700',
}

const AVATAR_SIZES: Record<1 | 2 | 3, string> = {
  1: 'size-14',
  2: 'size-11',
  3: 'size-11',
}

function LeaderCard({ entry }: { entry: LeaderEntry }) {
  return (
    <div className="flex flex-col items-center gap-1.5 text-center">
      <div className="relative">
        <Avatar className={AVATAR_SIZES[entry.rank]}>
          <AvatarImage src={entry.avatar_url} />
          <AvatarFallback className="text-sm font-medium">
            {getInitials(entry.name)}
          </AvatarFallback>
        </Avatar>
        <span
          className={`absolute -top-1 -right-1 text-xs font-bold leading-none ${MEDAL_COLORS[entry.rank]}`}
        >
          #{entry.rank}
        </span>
      </div>
      <div>
        <p className="text-sm font-medium leading-tight">{entry.name}</p>
        <p className="text-xs text-muted-foreground">{entry.title}</p>
      </div>
    </div>
  )
}

export function LeaderboardPanel() {
  const [first, second, third] = TOP_THREE

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <Trophy className="h-5 w-5" />
          <span className="sr-only">Ranking</span>
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-72 p-0">
        {/* Header */}
        <div className="px-4 py-3 border-b">
          <p className="text-sm font-semibold">Top da Redação</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Quem mais interagiu na plataforma
          </p>
        </div>

        {/* Podium */}
        <div className="px-4 py-5">
          {/* #1 — centralizado e destacado */}
          <div className="flex justify-center mb-5">
            <LeaderCard entry={first} />
          </div>

          {/* #2 e #3 lado a lado */}
          <div className="grid grid-cols-2 gap-4">
            <LeaderCard entry={second} />
            <LeaderCard entry={third} />
          </div>
        </div>


      </PopoverContent>
    </Popover>
  )
}
