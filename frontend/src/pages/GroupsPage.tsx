import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Users, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { useMyGroups } from '@/hooks/useGroups'
import { useAuthStore } from '@/lib/auth'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function GroupsPage() {
  const { data: groups, isLoading } = useMyGroups()
  const { user } = useAuthStore()
  const isProfessor = user?.account_type === 'professor'
  const [search, setSearch] = useState('')

  const filteredGroups = (groups || []).filter((group) =>
    group.name.toLowerCase().includes(search.toLowerCase()) ||
    (group.description ?? '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Meus Grupos</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isProfessor ? 'Gerencie seus grupos e desafios' : 'Grupos em que você participa'}
          </p>
        </div>
        {isProfessor && (
          <Button asChild>
            <Link to="/groups/new">
              <Plus className="w-4 h-4 mr-2" />
              Novo grupo
            </Link>
          </Button>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Pesquisar grupos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      )}

      {!isLoading && groups?.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Users className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="font-medium">Você não participa de nenhum grupo</p>
            {isProfessor && (
              <Button asChild variant="outline" className="mt-4">
                <Link to="/groups/new">Criar meu primeiro grupo</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {!isLoading && groups && groups.length > 0 && filteredGroups.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Search className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="font-medium">Nenhum grupo encontrado para "{search}"</p>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col gap-4 overflow-y-auto max-h-[calc(100vh-280px)] pr-1">
        {filteredGroups.map((group) => (
          <Link key={group.id} to={`/groups/${group.id}`}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base">{group.name}</CardTitle>
                  {group.creator.id === user?.id && (
                    <Badge variant="secondary" className="text-xs shrink-0">Professor</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {group.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{group.description}</p>
                )}
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {group.member_count ?? 0} membros
                  </span>
                  <span>
                    Criado {formatDistanceToNow(new Date(group.created_at), { addSuffix: true, locale: ptBR })}
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
