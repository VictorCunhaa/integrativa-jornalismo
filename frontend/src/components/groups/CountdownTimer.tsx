import { useEffect, useState } from 'react'
import { differenceInSeconds } from 'date-fns'
import { Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CountdownTimerProps {
  dueAt: string
  className?: string
}

function formatDuration(totalSeconds: number): string {
  if (totalSeconds <= 0) return 'Encerrado'
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (days > 0) return `${days}d ${hours}h ${minutes}m`
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`
  return `${minutes}m ${seconds}s`
}

export function CountdownTimer({ dueAt, className }: CountdownTimerProps) {
  const [remaining, setRemaining] = useState(() =>
    differenceInSeconds(new Date(dueAt), new Date())
  )

  useEffect(() => {
    const id = setInterval(() => {
      setRemaining(differenceInSeconds(new Date(dueAt), new Date()))
    }, 1000)
    return () => clearInterval(id)
  }, [dueAt])

  const isExpired = remaining <= 0
  const isUrgent = remaining > 0 && remaining < 3600 // less than 1h

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-xs font-mono font-medium',
        isExpired && 'text-muted-foreground',
        isUrgent && !isExpired && 'text-destructive animate-pulse',
        !isUrgent && !isExpired && 'text-orange-500',
        className,
      )}
    >
      <Clock className="w-3 h-3" />
      {formatDuration(remaining)}
    </span>
  )
}
