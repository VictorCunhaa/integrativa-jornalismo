import { useState } from 'react'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useNotifications, Notification } from '@/hooks/useNotifications'

// ─── helpers ────────────────────────────────────────────────────────────────

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 1) return 'agora mesmo'
  if (minutes < 60) return `há ${minutes}min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `há ${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 7) return `há ${days}d`
  return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

function formatTimeRemaining(deadline: string): string {
  const diff = new Date(deadline).getTime() - Date.now()
  if (diff <= 0) return 'Encerrado'
  const totalMinutes = Math.floor(diff / 60_000)
  const days = Math.floor(totalMinutes / 1440)
  const hours = Math.floor((totalMinutes % 1440) / 60)
  const parts: string[] = []
  if (days > 0) parts.push(`${days}d`)
  if (hours > 0) parts.push(`${hours}h`)
  if (parts.length === 0) parts.push('<1h')
  return `${parts.join(' ')} restantes`
}

// ─── item renderers ─────────────────────────────────────────────────────────

function ChallengeItem({ n }: { n: Notification }) {
  const deadline = n.payload?.deadline as string | undefined
  return (
    <div className="flex items-start justify-between gap-2 px-4 py-3 hover:bg-muted/50 transition-colors">
      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
        <span className="text-sm text-foreground leading-snug truncate">{n.title}</span>
        <span className="text-xs text-muted-foreground">{formatRelativeTime(n.created_at)}</span>
      </div>
      {deadline && (
        <span className="text-xs text-muted-foreground shrink-0 whitespace-nowrap mt-0.5">
          {formatTimeRemaining(deadline)}
        </span>
      )}
    </div>
  )
}

function GeneralItem({ n }: { n: Notification }) {
  let text: React.ReactNode = n.title

  if (n.type === 'like') {
    const liker = (n.payload?.liker_name as string) ?? 'Alguém'
    const postTitle = (n.payload?.post_title as string) ?? n.body ?? ''
    text = (
      <>
        <span className="font-semibold">{liker}</span> curtiu sua matéria{' '}
        {postTitle && <span className="font-semibold">{postTitle}</span>}
      </>
    )
  } else if (n.type === 'group_invite') {
    const groupName = (n.payload?.group_name as string) ?? n.body ?? ''
    text = (
      <>
        Você foi convidado para o grupo{' '}
        {groupName && <span className="font-semibold">{groupName}</span>}
      </>
    )
  }

  return (
    <div className="px-4 py-3 hover:bg-muted/50 transition-colors">
      <p className="text-sm text-foreground leading-snug">{text}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{formatRelativeTime(n.created_at)}</p>
    </div>
  )
}

// ─── main component ──────────────────────────────────────────────────────────

export function NotificationPanel() {
  const { notifications, unreadCount, markAllRead } = useNotifications()
  const [open, setOpen] = useState(false)

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (next && unreadCount > 0) {
      markAllRead()
    }
  }

  const challenges = notifications.filter((n) => n.type === 'challenge')
  const others = notifications.filter((n) => n.type !== 'challenge')

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground leading-none">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-80 p-0">
        {/* Header */}
        <div className="px-4 py-3 border-b">
          <h3 className="text-sm font-semibold">Notificações</h3>
        </div>

        {/* Scrollable list — max ~5 items visible */}
        <div className="overflow-y-auto" style={{ maxHeight: '18rem' }}>
          {notifications.length === 0 && (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">
              Nenhuma notificação.
            </p>
          )}

          {/* ── Desafios ── */}
          {challenges.length > 0 && (
            <div>
              <p className="px-4 pt-3 pb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Desafios
              </p>
              {challenges.map((n) => (
                <ChallengeItem key={n.id} n={n} />
              ))}
            </div>
          )}

          {/* ── Divisor ── */}
          {challenges.length > 0 && others.length > 0 && (
            <hr className="my-1 border-border" />
          )}

          {/* ── Outras notificações ── */}
          {others.length > 0 && (
            <div>
              {challenges.length > 0 && (
                <p className="px-4 pt-3 pb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Atividade
                </p>
              )}
              {others.map((n) => (
                <GeneralItem key={n.id} n={n} />
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
