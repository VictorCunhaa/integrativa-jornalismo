import { Lock, Users, Info } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { getRankInfo } from '@/lib/ranks'

interface Tag {
  id: number
  slug: string
  label: string
}

interface ProfileSidebarProps {
  interests: Tag[]
  postEditorias?: Tag[]
  username: string
  isOwner?: boolean
}

// Pontos fixos de exemplo — substituir por dado real da API futuramente
const EXAMPLE_POINTS: Record<string, number> = {}
function getExamplePoints(username: string): number {
  if (!(username in EXAMPLE_POINTS)) {
    let hash = 0
    for (let i = 0; i < username.length; i++) hash = (hash * 31 + username.charCodeAt(i)) & 0xffff
    EXAMPLE_POINTS[username] = (hash % 1400) + 50
  }
  return EXAMPLE_POINTS[username]
}

export function ProfileSidebar({ interests, postEditorias = [], username, isOwner = false }: ProfileSidebarProps) {
  // Show user-defined interests first; fall back to editorias derived from posts
  const tags = interests.length > 0 ? interests : postEditorias

  const points = getExamplePoints(username)
  const rankInfo = getRankInfo(points)

  return (
    <div className="space-y-4">
      {/* Rank */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
            Nível
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-52 text-center">
                  Nível do usuário — interaja com a plataforma para subir de cargo!
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm font-medium">{rankInfo.current.title}</p>
          <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${rankInfo.progress}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {rankInfo.next
              ? `${rankInfo.current.title} → ${rankInfo.next.title}`
              : 'Nível máximo atingido!'}
          </p>
        </CardContent>
      </Card>
      {/* Interests */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Interesses</CardTitle>
        </CardHeader>
        <CardContent>
          {tags.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <Link
                  key={tag.id}
                  to={`/?editoria=${tag.slug}`}
                  className="text-xs px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground hover:bg-sky-100 hover:text-sky-700 transition-colors"
                >
                  {tag.label}
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Nenhum interesse cadastrado.</p>
          )}
        </CardContent>
      </Card>

      {/* Groups — placeholder, only visible to profile owner */}
      {isOwner && (
      <Card className="opacity-70">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Users className="h-4 w-4" />
            Grupos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Lock className="h-4 w-4 shrink-0" />
            <span className="text-xs">Em breve</span>
          </div>
        </CardContent>
      </Card>
      )}
    </div>
  )
}
