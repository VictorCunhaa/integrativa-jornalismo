import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  Copy, Check, Link2, Plus, Users, Trophy, RefreshCw, Trash2, ArrowLeft,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { useGroup, useInviteUsers, useRegenerateInvite, useRemoveMember } from '@/hooks/useGroups'
import { useAuthStore } from '@/lib/auth'
import { ChallengeCard } from '@/components/groups/ChallengeCard'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function GroupDetailPage() {
  const { groupId } = useParams<{ groupId: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const id = Number(groupId)

  const { data: group, isLoading } = useGroup(id)
  const inviteUsers = useInviteUsers(id)
  const regenerate = useRegenerateInvite(id)
  const removeMember = useRemoveMember(id)

  const [copied, setCopied] = useState(false)
  const [inviteInput, setInviteInput] = useState('')

  const isOwner = group?.creator.id === user?.id

  const inviteLink = group
    ? `${window.location.origin}/groups/join/${group.invite_token}`
    : ''

  function copyLink() {
    navigator.clipboard.writeText(inviteLink)
    setCopied(true)
    toast.success('Link copiado!')
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    const usernames = inviteInput.split(',').map((s) => s.trim()).filter(Boolean)
    if (!usernames.length) return
    await inviteUsers.mutateAsync(usernames)
    setInviteInput('')
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    )
  }

  if (!group) return null

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/groups')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{group.name}</h1>
          {group.description && (
            <p className="text-muted-foreground text-sm mt-1">{group.description}</p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            Criado por {group.creator.display_name} ·{' '}
            {formatDistanceToNow(new Date(group.created_at), { addSuffix: true, locale: ptBR })}
          </p>
        </div>
        {isOwner && (
          <Button asChild size="sm">
            <Link to={`/groups/${id}/challenges/new`}>
              <Plus className="w-4 h-4 mr-1" />
              Desafio
            </Link>
          </Button>
        )}
      </div>

      {/* Invite link */}
      {isOwner && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Link2 className="w-4 h-4" />
              Link de convite
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input readOnly value={inviteLink} className="text-xs font-mono" />
              <Button variant="outline" size="icon" onClick={copyLink}>
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => regenerate.mutate()}
                disabled={regenerate.isPending}
                title="Regenerar link"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>

            {/* Manual invite */}
            <form onSubmit={handleInvite} className="flex gap-2">
              <Input
                placeholder="Convidar por username: user1, user2"
                value={inviteInput}
                onChange={(e) => setInviteInput(e.target.value)}
                className="text-sm"
              />
              <Button type="submit" variant="outline" disabled={inviteUsers.isPending}>
                Convidar
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Challenges */}
      <div className="space-y-3">
        <h2 className="font-semibold flex items-center gap-2">
          <Trophy className="w-4 h-4" />
          Desafios ({(group.challenges || []).length})
        </h2>

        {(group.challenges || []).length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground text-sm">
              {isOwner
                ? 'Nenhum desafio ainda. Crie o primeiro!'
                : 'Nenhum desafio publicado ainda.'}
            </CardContent>
          </Card>
        )}

        {(group.challenges || []).map((challenge) => (
          <ChallengeCard
            key={challenge.id}
            challenge={challenge}
            groupId={id}
            isOwner={isOwner}
          />
        ))}
      </div>

      <Separator />

      {/* Members */}
      <div className="space-y-3">
        <h2 className="font-semibold flex items-center gap-2">
          <Users className="w-4 h-4" />
          Membros ({(group.members || []).length})
        </h2>

        <div className="space-y-2">
          {(group.members || []).map((m) => (
            <div key={m.id} className="flex items-center gap-3 py-2">
              <Avatar className="w-8 h-8">
                <AvatarImage src={m.user.avatar_url || undefined} />
                <AvatarFallback>{m.user.display_name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{m.user.display_name}</p>
                <p className="text-xs text-muted-foreground">@{m.user.username}</p>
              </div>
              {m.role === 'owner' && (
                <Badge variant="secondary" className="text-xs">Professor</Badge>
              )}
              {isOwner && m.role !== 'owner' && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remover membro?</AlertDialogTitle>
                      <AlertDialogDescription>
                        {m.user.display_name} será removido do grupo.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => removeMember.mutate(m.user.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Remover
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
