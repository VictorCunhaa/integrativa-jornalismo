import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Users, LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useJoinGroup } from '@/hooks/useGroups'
import { useAuthStore } from '@/lib/auth'
import { toast } from 'sonner'

export function GroupJoinPage() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const joinGroup = useJoinGroup()
  const [status, setStatus] = useState<'idle' | 'joining' | 'done' | 'error'>('idle')
  const [groupId, setGroupId] = useState<number | null>(null)

  // Verifica se há token salvo — se sim, auth ainda está inicializando
  const hasStoredToken = !!localStorage.getItem('access_token')

  useEffect(() => {
    if (!isAuthenticated) return
    if (!token) return
    if (status !== 'idle') return   // evita chamar duas vezes
    setStatus('joining')
    joinGroup.mutateAsync(token)
      .then((res) => {
        setGroupId(res.group_id)
        setStatus('done')
        if (res.already_member) {
          toast.info('Você já é membro deste grupo')
        } else {
          toast.success('Você entrou no grupo!')
        }
      })
      .catch(() => {
        setStatus('error')
        toast.error('Link de convite inválido ou expirado')
      })
  }, [isAuthenticated, token, status])

  // Auth ainda inicializando (tem token mas store não carregou ainda)
  if (!isAuthenticated && hasStoredToken) {
    return (
      <div className="max-w-sm mx-auto mt-20 text-center">
        <Users className="w-10 h-10 mx-auto text-muted-foreground animate-pulse" />
        <p className="text-muted-foreground mt-3">Verificando acesso...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-sm mx-auto mt-20 text-center space-y-4">
        <Users className="w-12 h-12 mx-auto text-muted-foreground" />
        <h1 className="text-xl font-bold">Você foi convidado para um grupo</h1>
        <p className="text-muted-foreground text-sm">Faça login para aceitar o convite.</p>
        <Button onClick={() => navigate(`/login?redirect=/groups/join/${token}`)}>
          <LogIn className="w-4 h-4 mr-2" />
          Fazer login
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-sm mx-auto mt-20">
      <Card>
        <CardContent className="py-10 text-center space-y-4">
          <Users className="w-10 h-10 mx-auto text-muted-foreground" />
          {status === 'joining' && <p className="text-muted-foreground">Entrando no grupo...</p>}
          {status === 'done' && (
            <>
              <p className="font-medium">Você está no grupo!</p>
              <Button onClick={() => navigate(`/groups/${groupId}`)}>
                Ver grupo
              </Button>
            </>
          )}
          {status === 'error' && (
            <>
              <p className="text-destructive font-medium">Link inválido ou expirado</p>
              <Button variant="outline" onClick={() => navigate('/groups')}>
                Meus grupos
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
